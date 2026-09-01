package in.desiaahhar.api.cart;

import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class CartController {
    private final CartService cart;

    public CartController(CartService cart) {
        this.cart = cart;
    }

    @GetMapping("/cart")
    CartService.CartView get(Authentication authentication, @RequestParam(required = false) String coupon) {
        return cart.get(SecurityIdentity.userId(authentication), coupon);
    }

    @PostMapping("/cart/items")
    CartService.CartView add(Authentication authentication, @Valid @RequestBody CartRequest request) {
        return cart.add(SecurityIdentity.userId(authentication), request.variantId(), request.quantity());
    }

    @PatchMapping("/cart/items/{variantId}")
    CartService.CartView update(Authentication authentication, @PathVariable UUID variantId,
                                @Valid @RequestBody QuantityRequest request) {
        return cart.update(SecurityIdentity.userId(authentication), variantId, request.quantity());
    }

    @DeleteMapping("/cart/items/{variantId}")
    CartService.CartView remove(Authentication authentication, @PathVariable UUID variantId) {
        return cart.remove(SecurityIdentity.userId(authentication), variantId);
    }

    @PostMapping("/cart/validate")
    CartService.Pricing validate(Authentication authentication, @RequestBody(required = false) CouponRequest request) {
        String coupon = request == null ? null : request.couponCode();
        return cart.get(SecurityIdentity.userId(authentication), coupon).pricing();
    }

    @GetMapping("/checkout/preview")
    CartService.CartView preview(Authentication authentication, @RequestParam(required = false) String coupon) {
        return cart.get(SecurityIdentity.userId(authentication), coupon);
    }

    public record CartRequest(@NotNull UUID variantId, @Min(1) int quantity) {}
    public record QuantityRequest(@Min(0) int quantity) {}
    public record CouponRequest(String couponCode) {}
}
