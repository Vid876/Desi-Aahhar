package in.desiaahhar.api.order;

import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
    private final OrderService orders;

    public OrderController(OrderService orders) {
        this.orders = orders;
    }

    @GetMapping
    List<OrderService.OrderView> list(Authentication authentication) {
        return orders.listForUser(SecurityIdentity.userId(authentication));
    }

    @GetMapping("/{id}")
    OrderService.OrderView get(Authentication authentication, @PathVariable UUID id) {
        return orders.getForUser(SecurityIdentity.userId(authentication), id);
    }

    @PostMapping
    OrderService.OrderView create(Authentication authentication, @Valid @RequestBody CreateOrderBody body) {
        OrderService.AddressRequest address = new OrderService.AddressRequest(body.address().recipient(), body.address().phone(),
                body.address().line1(), body.address().city(), body.address().pincode());
        return orders.create(SecurityIdentity.userId(authentication), new OrderService.CreateOrderRequest(
                body.paymentMethod(), body.deliverySlot(), address, body.couponCode(), body.note()));
    }

    @PostMapping("/{id}/cancel")
    OrderService.OrderView cancel(Authentication authentication, @PathVariable UUID id) {
        return orders.cancelPendingPayment(SecurityIdentity.userId(authentication), id);
    }

    public record AddressBody(@NotBlank String recipient, @NotBlank String phone, @NotBlank String line1,
                              @NotBlank String city, @Pattern(regexp = "\\d{6}") String pincode) {}
    public record CreateOrderBody(@NotBlank String paymentMethod, @NotBlank String deliverySlot,
                                  @NotNull @Valid AddressBody address, String couponCode, String note) {}
}
