package in.desiaahhar.api.payment;

import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentService payments;

    public PaymentController(PaymentService payments) {
        this.payments = payments;
    }

    @PostMapping("/create")
    PaymentService.PaymentOrderResponse create(Authentication authentication, @Valid @RequestBody CreateRequest request) {
        return payments.create(SecurityIdentity.userId(authentication), request.orderId());
    }

    @PostMapping("/verify")
    Map<String, Object> verify(Authentication authentication, @Valid @RequestBody VerifyBody request) {
        return payments.verify(SecurityIdentity.userId(authentication), new PaymentService.VerifyRequest(
                request.internalOrderId(), request.razorpayOrderId(), request.razorpayPaymentId(), request.razorpaySignature()));
    }

    @PostMapping("/webhook")
    Map<String, Object> webhook(@RequestBody String payload,
                                @RequestHeader("X-Razorpay-Signature") String signature,
                                @RequestHeader(value = "X-Razorpay-Event-Id", required = false) String eventId) {
        return payments.webhook(payload, signature, eventId);
    }

    public record CreateRequest(@NotNull UUID orderId) {}
    public record VerifyBody(@NotNull UUID internalOrderId, @NotBlank String razorpayOrderId,
                             @NotBlank String razorpayPaymentId, @NotBlank String razorpaySignature) {}
}
