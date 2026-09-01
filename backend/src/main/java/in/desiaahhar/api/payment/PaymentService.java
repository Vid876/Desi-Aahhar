package in.desiaahhar.api.payment;

import in.desiaahhar.api.common.ApiException;
import in.desiaahhar.api.order.OrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PaymentService {
    private final JdbcClient jdbc;
    private final OrderService orders;
    private final RestClient restClient;
    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;

    public PaymentService(JdbcClient jdbc, OrderService orders, RestClient.Builder builder,
                          @Value("${app.razorpay.key-id}") String keyId,
                          @Value("${app.razorpay.key-secret}") String keySecret,
                          @Value("${app.razorpay.webhook-secret}") String webhookSecret) {
        this.jdbc = jdbc;
        this.orders = orders;
        this.restClient = builder.build();
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
    }

    @Transactional
    public PaymentOrderResponse create(UUID userId, UUID orderId) {
        OrderService.PaymentOrder order = orders.paymentOrder(userId, orderId);
        if (!"ONLINE".equals(order.paymentMethod()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "This order uses cash on delivery");
        ExistingPayment existing = jdbc.sql("SELECT provider_order_id, amount FROM payments WHERE order_id = :id AND status = 'CREATED' ORDER BY created_at DESC LIMIT 1")
                .param("id", orderId).query((rs, row) -> new ExistingPayment(rs.getString("provider_order_id"), rs.getBigDecimal("amount")))
                .optional().orElse(null);
        if (existing != null) return new PaymentOrderResponse(existing.providerOrderId(), keyForClient(),
                existing.amount().movePointRight(2).longValue(), "INR", order.orderNumber(), realEnabled());

        String providerOrderId;
        long amountPaise = order.total().movePointRight(2).longValueExact();
        if (realEnabled()) {
            try {
                Map<?, ?> response = restClient.post().uri("https://api.razorpay.com/v1/orders")
                        .headers(headers -> headers.setBasicAuth(keyId, keySecret))
                        .body(Map.of("amount", amountPaise, "currency", "INR", "receipt", order.orderNumber(),
                                "notes", Map.of("internalOrderId", orderId.toString())))
                        .retrieve().body(Map.class);
                providerOrderId = String.valueOf(response.get("id"));
            } catch (RestClientResponseException exception) {
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Razorpay could not create the payment order");
            }
        } else {
            providerOrderId = "order_dev_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        }
        jdbc.sql("""
                INSERT INTO payments(order_id, provider_order_id, amount, status)
                VALUES (:orderId, :providerOrderId, :amount, 'CREATED')
                """).param("orderId", orderId).param("providerOrderId", providerOrderId).param("amount", order.total()).update();
        return new PaymentOrderResponse(providerOrderId, keyForClient(), amountPaise, "INR", order.orderNumber(), realEnabled());
    }

    @Transactional
    public Map<String, Object> verify(UUID userId, VerifyRequest request) {
        OrderService.PaymentOrder order = orders.paymentOrder(userId, request.internalOrderId());
        PaymentRow payment = jdbc.sql("""
                SELECT id, provider_order_id, status FROM payments
                WHERE order_id = :orderId AND provider_order_id = :providerOrderId
                """).param("orderId", order.id()).param("providerOrderId", request.razorpayOrderId())
                .query((rs, row) -> new PaymentRow(rs.getObject("id", UUID.class), rs.getString("provider_order_id"), rs.getString("status")))
                .optional().orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Payment order does not match"));
        if ("PAID".equals(payment.status())) return Map.of("verified", true, "orderId", order.id());
        boolean valid = realEnabled()
                ? secureEquals(hmac(request.razorpayOrderId() + "|" + request.razorpayPaymentId(), keySecret), request.razorpaySignature())
                : "DEV_SUCCESS".equals(request.razorpaySignature());
        if (!valid) throw new ApiException(HttpStatus.BAD_REQUEST, "Payment signature verification failed");
        jdbc.sql("""
                UPDATE payments SET provider_payment_id = :paymentId, signature = :signature,
                  status = 'PAID', updated_at = now() WHERE id = :id
                """).param("paymentId", request.razorpayPaymentId()).param("signature", request.razorpaySignature())
                .param("id", payment.id()).update();
        orders.markPaid(order.id(), request.razorpayPaymentId());
        return Map.of("verified", true, "orderId", order.id());
    }

    @Transactional
    public Map<String, Object> webhook(String payload, String signature, String eventId) {
        if (webhookSecret.isBlank()) throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Razorpay webhook is not configured");
        if (!secureEquals(hmac(payload, webhookSecret), signature))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid webhook signature");
        String resolvedEventId = eventId == null || eventId.isBlank() ? HexFormat.of().formatHex(MessageDigestHolder.sha256(payload)) : eventId;
        int inserted = jdbc.sql("""
                INSERT INTO webhook_events(provider, event_id, payload) VALUES ('RAZORPAY', :eventId, CAST(:payload AS jsonb))
                ON CONFLICT DO NOTHING
                """).param("eventId", resolvedEventId).param("payload", payload).update();
        if (inserted == 0) return Map.of("accepted", true, "duplicate", true);
        if (payload.contains("payment.captured")) {
            String internalOrderId = findJsonString(payload, "internalOrderId");
            String paymentId = findJsonString(payload, "id");
            if (internalOrderId != null && paymentId != null) {
                UUID orderId = UUID.fromString(internalOrderId);
                Integer alreadyPaid = jdbc.sql("SELECT count(*) FROM orders WHERE id = :id AND payment_status = 'PAID'")
                        .param("id", orderId).query(Integer.class).single();
                if (alreadyPaid == 0) orders.markPaid(orderId, paymentId);
            }
        }
        return Map.of("accepted", true, "duplicate", false);
    }

    public boolean realEnabled() { return !keyId.isBlank() && !keySecret.isBlank(); }

    private String keyForClient() { return realEnabled() ? keyId : "rzp_test_development"; }

    private String hmac(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to verify payment signature", exception);
        }
    }

    private boolean secureEquals(String expected, String actual) {
        if (actual == null) return false;
        return MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), actual.getBytes(StandardCharsets.UTF_8));
    }

    private String findJsonString(String json, String field) {
        Matcher matcher = Pattern.compile("\\\"" + Pattern.quote(field) + "\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"").matcher(json);
        return matcher.find() ? matcher.group(1) : null;
    }

    public record PaymentOrderResponse(String razorpayOrderId, String keyId, long amount, String currency,
                                       String receipt, boolean realGateway) {}
    public record VerifyRequest(UUID internalOrderId, String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySignature) {}
    private record ExistingPayment(String providerOrderId, java.math.BigDecimal amount) {}
    private record PaymentRow(UUID id, String providerOrderId, String status) {}

    private static final class MessageDigestHolder {
        private static byte[] sha256(String value) {
            try { return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); }
            catch (Exception exception) { throw new IllegalStateException(exception); }
        }
    }
}
