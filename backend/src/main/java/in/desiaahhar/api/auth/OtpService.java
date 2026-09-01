package in.desiaahhar.api.auth;

import in.desiaahhar.api.common.ApiException;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.OffsetDateTime;
import java.security.SecureRandom;
import java.util.Map;

@Service
public class OtpService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;
    private final RestClient restClient;
    private final JavaMailSender mailSender;
    private final String twilioAccountSid;
    private final String twilioAuthToken;
    private final String twilioServiceSid;
    private final boolean smtpEnabled;
    private final String smtpFrom;
    private final int ttlMinutes;
    private final String devCode;
    private final boolean exposeDevCode;

    public OtpService(
            JdbcClient jdbc,
            PasswordEncoder encoder,
            RestClient.Builder restClientBuilder,
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.twilio.account-sid}") String twilioAccountSid,
            @Value("${app.twilio.auth-token}") String twilioAuthToken,
            @Value("${app.twilio.verify-service-sid}") String twilioServiceSid,
            @Value("${app.smtp.enabled}") boolean smtpEnabled,
            @Value("${app.smtp.from}") String smtpFrom,
            @Value("${app.otp.ttl-minutes}") int ttlMinutes,
            @Value("${app.otp.dev-code}") String devCode,
            @Value("${app.otp.expose-dev-code}") boolean exposeDevCode) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.restClient = restClientBuilder.build();
        this.mailSender = mailSender.getIfAvailable();
        this.twilioAccountSid = twilioAccountSid;
        this.twilioAuthToken = twilioAuthToken;
        this.twilioServiceSid = twilioServiceSid;
        this.smtpEnabled = smtpEnabled;
        this.smtpFrom = smtpFrom;
        this.ttlMinutes = ttlMinutes;
        this.devCode = devCode;
        this.exposeDevCode = exposeDevCode;
    }

    public OtpDispatch sendSms(String rawPhone) {
        String phone = normalizePhone(rawPhone);
        enforceRateLimit(phone, "SMS");
        if (twilioConfigured()) {
            callTwilio("Verifications", form("To", phone, "Channel", "sms"));
            insertChallenge(phone, "SMS", null, "TWILIO");
            return new OtpDispatch("SMS", phone, ttlMinutes * 60, true, null);
        }
        insertChallenge(phone, "SMS", encoder.encode(devCode), "DEV");
        return new OtpDispatch("SMS", phone, ttlMinutes * 60, true, exposeDevCode ? devCode : null);
    }

    public OtpDispatch sendEmail(String rawEmail) {
        String email = rawEmail.trim().toLowerCase();
        enforceRateLimit(email, "EMAIL");
        String code = smtpEnabled ? String.format("%06d", SECURE_RANDOM.nextInt(1_000_000)) : devCode;
        insertChallenge(email, "EMAIL", encoder.encode(code), smtpEnabled ? "SMTP" : "DEV");
        if (smtpEnabled) {
            if (mailSender == null) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Email service is not configured");
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(smtpFrom);
            message.setTo(email);
            message.setSubject("Your Desi Aahhar verification code");
            message.setText("Your verification code is " + code + ". It expires in " + ttlMinutes + " minutes.");
            mailSender.send(message);
        }
        return new OtpDispatch("EMAIL", email, ttlMinutes * 60, false, !smtpEnabled && exposeDevCode ? devCode : null);
    }

    public String verifySms(String rawPhone, String code) {
        String phone = normalizePhone(rawPhone);
        if (twilioConfigured()) {
            Map<?, ?> response = callTwilio("VerificationCheck", form("To", phone, "Code", code));
            if (!"approved".equals(response.get("status"))) throw invalidOtp();
            markLatestVerified(phone, "SMS");
            return phone;
        }
        verifyLocal(phone, "SMS", code);
        return phone;
    }

    public String verifyEmail(String rawEmail, String code) {
        String email = rawEmail.trim().toLowerCase();
        verifyLocal(email, "EMAIL", code);
        return email;
    }

    private void verifyLocal(String destination, String channel, String code) {
        Challenge challenge = jdbc.sql("""
                SELECT id, code_hash, expires_at, attempts
                FROM otp_challenges
                WHERE destination = :destination AND channel = :channel AND verified_at IS NULL
                ORDER BY created_at DESC LIMIT 1
                """)
                .param("destination", destination)
                .param("channel", channel)
                .query((rs, row) -> new Challenge(
                        rs.getObject("id", java.util.UUID.class), rs.getString("code_hash"),
                        rs.getObject("expires_at", OffsetDateTime.class), rs.getInt("attempts")))
                .optional().orElseThrow(this::invalidOtp);
        if (challenge.attempts() >= 5 || challenge.expiresAt().isBefore(OffsetDateTime.now())) throw invalidOtp();
        jdbc.sql("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = :id").param("id", challenge.id()).update();
        if (challenge.codeHash() == null || !encoder.matches(code, challenge.codeHash())) throw invalidOtp();
        jdbc.sql("UPDATE otp_challenges SET verified_at = now() WHERE id = :id").param("id", challenge.id()).update();
    }

    private void enforceRateLimit(String destination, String channel) {
        Long count = jdbc.sql("""
                SELECT count(*) FROM otp_challenges
                WHERE destination = :destination AND channel = :channel AND created_at > now() - interval '10 minutes'
                """).param("destination", destination).param("channel", channel).query(Long.class).single();
        if (count >= 5) throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many OTP requests. Please wait 10 minutes.");
    }

    private void insertChallenge(String destination, String channel, String hash, String provider) {
        JdbcClient.StatementSpec statement = jdbc.sql("""
                INSERT INTO otp_challenges(destination, channel, code_hash, provider, expires_at)
                VALUES (:destination, :channel, :hash, :provider, :expires)
                """).param("destination", destination).param("channel", channel)
                .param("provider", provider).param("expires", OffsetDateTime.now().plusMinutes(ttlMinutes));
        if (hash == null) statement.param("hash", null, java.sql.Types.VARCHAR); else statement.param("hash", hash);
        statement.update();
    }

    private Map<?, ?> callTwilio(String operation, MultiValueMap<String, String> form) {
        String endpoint = "VerificationCheck".equals(operation) ? "VerificationCheck" : "Verifications";
        try {
            return restClient.post()
                    .uri("https://verify.twilio.com/v2/Services/{service}/" + endpoint, twilioServiceSid)
                    .headers(headers -> headers.setBasicAuth(twilioAccountSid, twilioAuthToken))
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientResponseException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "SMS provider rejected the OTP request");
        }
    }

    private MultiValueMap<String, String> form(String... values) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        for (int i = 0; i < values.length; i += 2) form.add(values[i], values[i + 1]);
        return form;
    }

    private boolean twilioConfigured() {
        return !twilioAccountSid.isBlank() && !twilioAuthToken.isBlank() && !twilioServiceSid.isBlank();
    }

    private void markLatestVerified(String destination, String channel) {
        jdbc.sql("""
                UPDATE otp_challenges SET verified_at = now()
                WHERE id = (SELECT id FROM otp_challenges WHERE destination = :destination AND channel = :channel
                            AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1)
                """).param("destination", destination).param("channel", channel).update();
    }

    private String normalizePhone(String raw) {
        String value = raw.trim().replaceAll("[^0-9+]", "");
        if (value.startsWith("+")) return value;
        String digits = value.replaceAll("\\D", "");
        if (digits.length() == 10) return "+91" + digits;
        if (digits.length() == 12 && digits.startsWith("91")) return "+" + digits;
        throw new ApiException(HttpStatus.BAD_REQUEST, "Enter a valid Indian mobile number");
    }

    private ApiException invalidOtp() {
        return new ApiException(HttpStatus.BAD_REQUEST, "OTP is invalid or expired");
    }

    public boolean realSmsEnabled() { return twilioConfigured(); }
    public boolean realEmailEnabled() { return smtpEnabled; }

    public record OtpDispatch(String channel, String destination, int expiresInSeconds,
                              boolean emailFallbackAvailable, String devOtp) {}
    private record Challenge(java.util.UUID id, String codeHash, OffsetDateTime expiresAt, int attempts) {}
}
