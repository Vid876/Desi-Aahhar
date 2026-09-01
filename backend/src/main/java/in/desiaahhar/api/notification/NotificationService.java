package in.desiaahhar.api.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final String FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
    private final JdbcClient jdbc;
    private final RestClient restClient;
    private final boolean firebaseEnabled;
    private final String projectId;
    private final String credentialsPath;
    private volatile String cachedAccessToken;
    private volatile long cachedAccessTokenUntil;

    public NotificationService(JdbcClient jdbc, RestClient.Builder restClientBuilder,
                               @Value("${app.firebase.enabled}") boolean firebaseEnabled,
                               @Value("${app.firebase.project-id}") String projectId,
                               @Value("${app.firebase.credentials-path}") String credentialsPath) {
        this.jdbc = jdbc;
        this.restClient = restClientBuilder.build();
        this.firebaseEnabled = firebaseEnabled;
        this.projectId = projectId;
        this.credentialsPath = credentialsPath;
    }

    public void register(UUID userId, String token, String platform, String app) {
        jdbc.sql("""
                INSERT INTO device_tokens(user_id, token, platform, app) VALUES (:userId, :token, :platform, :app)
                ON CONFLICT (token) DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform,
                    app = EXCLUDED.app, active = true, updated_at = now()
                """).param("userId", userId).param("token", token).param("platform", platform).param("app", app).update();
    }

    public List<NotificationView> list(UUID userId) {
        return jdbc.sql("""
                SELECT id, title, body, read_at IS NOT NULL AS is_read, created_at
                FROM notifications WHERE user_id = :userId ORDER BY created_at DESC LIMIT 100
                """).param("userId", userId).query((rs, row) -> new NotificationView(
                rs.getObject("id", UUID.class), rs.getString("title"), rs.getString("body"),
                rs.getBoolean("is_read"), rs.getObject("created_at", java.time.OffsetDateTime.class))).list();
    }

    public void markRead(UUID userId, UUID notificationId) {
        jdbc.sql("UPDATE notifications SET read_at = now() WHERE id = :id AND user_id = :userId")
                .param("id", notificationId).param("userId", userId).update();
    }

    public void notifyUser(UUID userId, String title, String body, Map<String, String> data) {
        String json = toSimpleJson(data);
        jdbc.sql("""
                INSERT INTO notifications(user_id, title, body, data)
                VALUES (:userId, :title, :body, CAST(:data AS jsonb))
                """).param("userId", userId).param("title", title).param("body", body).param("data", json).update();
        if (!realPushEnabled()) return;
        List<String> tokens = jdbc.sql("SELECT token FROM device_tokens WHERE user_id = :userId AND active = true")
                .param("userId", userId).query(String.class).list();
        for (String token : tokens) sendFcm(token, title, body, data);
    }

    private void sendFcm(String token, String title, String body, Map<String, String> data) {
        try {
            restClient.post().uri("https://fcm.googleapis.com/v1/projects/{project}/messages:send", projectId)
                    .headers(headers -> headers.setBearerAuth(accessToken()))
                    .body(Map.of("message", Map.of("token", token,
                            "notification", Map.of("title", title, "body", body), "data", data)))
                    .retrieve().toBodilessEntity();
        } catch (RestClientResponseException exception) {
            log.warn("Firebase FCM rejected one notification with status {}", exception.getStatusCode());
        } catch (RuntimeException exception) {
            log.error("Firebase notification failed", exception);
        }
    }

    private synchronized String accessToken() {
        if (cachedAccessToken != null && cachedAccessTokenUntil > Instant.now().getEpochSecond()) return cachedAccessToken;
        try {
            String credentials = Files.readString(Path.of(credentialsPath));
            String email = jsonString(credentials, "client_email");
            String privateKeyPem = jsonString(credentials, "private_key");
            String tokenUri = jsonString(credentials, "token_uri");
            long now = Instant.now().getEpochSecond();
            String header = urlBase64("{\"alg\":\"RS256\",\"typ\":\"JWT\"}");
            String claims = urlBase64("{\"iss\":\"" + jsonEscape(email) + "\",\"scope\":\"" + FCM_SCOPE
                    + "\",\"aud\":\"" + jsonEscape(tokenUri) + "\",\"iat\":" + now + ",\"exp\":" + (now + 3600) + "}");
            String unsigned = header + "." + claims;
            String assertion = unsigned + "." + sign(unsigned, privateKeyPem);
            LinkedMultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
            form.add("assertion", assertion);
            Map<?, ?> response = restClient.post().uri(tokenUri).contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form).retrieve().body(Map.class);
            cachedAccessToken = String.valueOf(response.get("access_token"));
            long expires = response.get("expires_in") instanceof Number number ? number.longValue() : 3600;
            cachedAccessTokenUntil = now + expires - 60;
            return cachedAccessToken;
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to authorize with Firebase service account", exception);
        }
    }

    private String sign(String unsigned, String pem) throws Exception {
        String encoded = pem.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "").replaceAll("\\s", "");
        PrivateKey key = KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(encoded)));
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(key);
        signature.update(unsigned.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(signature.sign());
    }

    private String jsonString(String json, String field) {
        Matcher matcher = Pattern.compile("\\\"" + Pattern.quote(field) + "\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"])*)\\\"").matcher(json);
        if (!matcher.find()) throw new IllegalStateException("Missing service-account field: " + field);
        return matcher.group(1).replace("\\n", "\n").replace("\\r", "\r")
                .replace("\\\"", "\"").replace("\\\\", "\\");
    }

    private String urlBase64(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String jsonEscape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\""); }

    private String toSimpleJson(Map<String, String> data) {
        return data.entrySet().stream().map(entry -> "\"" + jsonEscape(entry.getKey()) + "\":\"" + jsonEscape(entry.getValue()) + "\"")
                .collect(java.util.stream.Collectors.joining(",", "{", "}"));
    }

    public boolean realPushEnabled() {
        return firebaseEnabled && !projectId.isBlank() && !credentialsPath.isBlank() && Files.isRegularFile(Path.of(credentialsPath));
    }

    public record NotificationView(UUID id, String title, String body, boolean read,
                                   java.time.OffsetDateTime createdAt) {}
}
