package in.desiaahhar.api.admin;

import in.desiaahhar.api.auth.OtpService;
import in.desiaahhar.api.catalog.CatalogService;
import in.desiaahhar.api.notification.NotificationService;
import in.desiaahhar.api.order.OrderService;
import in.desiaahhar.api.payment.PaymentService;
import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService admin;
    private final OrderService orders;
    private final OtpService otp;
    private final PaymentService payments;
    private final NotificationService notifications;
    private final JdbcClient jdbc;

    public AdminController(AdminService admin, OrderService orders, OtpService otp,
                           PaymentService payments, NotificationService notifications, JdbcClient jdbc) {
        this.admin = admin;
        this.orders = orders;
        this.otp = otp;
        this.payments = payments;
        this.notifications = notifications;
        this.jdbc = jdbc;
    }

    @GetMapping("/dashboard") AdminService.Dashboard dashboard() { return admin.dashboard(); }

    @GetMapping("/integrations")
    Map<String, Boolean> integrations() {
        return Map.of("postgresql", true, "smsOtp", otp.realSmsEnabled(), "emailOtp", otp.realEmailEnabled(),
                "razorpay", payments.realEnabled(), "firebasePush", notifications.realPushEnabled());
    }

    @GetMapping("/orders")
    List<OrderService.OrderView> orders(@RequestParam(required = false) String status) { return orders.listAll(status); }

    @PutMapping("/orders/{id}/assign")
    OrderService.OrderView assign(Authentication authentication, @PathVariable UUID id, @RequestBody AssignRequest request) {
        return orders.assign(id, request.staffId(), SecurityIdentity.userId(authentication));
    }

    @PatchMapping("/orders/{id}/status")
    OrderService.OrderView status(Authentication authentication, @PathVariable UUID id, @RequestBody StatusRequest request) {
        return orders.updateStatus(id, request.status(), SecurityIdentity.userId(authentication), false);
    }

    @GetMapping("/orders/{id}/tracking")
    List<Map<String, Object>> tracking(@PathVariable UUID id) {
        return jdbc.sql("""
                SELECT latitude, longitude, accuracy, recorded_at FROM delivery_locations
                WHERE order_id = :id ORDER BY recorded_at DESC LIMIT 100
                """).param("id", id).query((rs, row) -> Map.<String, Object>of(
                "latitude", rs.getBigDecimal("latitude"), "longitude", rs.getBigDecimal("longitude"),
                "accuracy", rs.getBigDecimal("accuracy") == null ? BigDecimal.ZERO : rs.getBigDecimal("accuracy"),
                "recordedAt", rs.getObject("recorded_at", java.time.OffsetDateTime.class))).list();
    }

    @GetMapping("/staff") List<AdminService.StaffView> staff() { return admin.staff(); }

    @PostMapping("/staff")
    AdminService.StaffView createStaff(@Valid @RequestBody StaffRequest request) {
        return admin.createStaff(request.name(), request.email(), request.phone(), request.password());
    }

    @GetMapping("/categories") List<CatalogService.CategoryView> categories() { return admin.categories(); }

    @PutMapping("/categories/{id}/rule")
    CatalogService.CategoryView updateRule(@PathVariable UUID id, @Valid @RequestBody RuleRequest request) {
        return admin.updateRule(id, request.appliesMinimum(), request.minimumOrderValue());
    }

    @PostMapping("/products")
    CatalogService.ProductView createProduct(@Valid @RequestBody ProductBody request) {
        AdminService.VariantRequest variant = new AdminService.VariantRequest(request.variant().sku(), request.variant().label(),
                request.variant().price(), request.variant().mrp(), request.variant().stock());
        return admin.createProduct(new AdminService.ProductRequest(request.categoryId(), request.slug(), request.name(),
                request.hindiName(), request.emoji(), request.description(), request.badge(), request.featured(), variant));
    }

    @PutMapping("/products/{id}")
    CatalogService.ProductView updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductUpdateBody request) {
        return admin.updateProduct(id, new AdminService.ProductUpdate(request.name(), request.hindiName(),
                request.description(), request.featured(), request.active()));
    }

    @PutMapping("/variants/{id}")
    Map<String, Object> updateVariant(@PathVariable UUID id, @Valid @RequestBody VariantUpdateBody request) {
        return admin.updateVariant(id, request.price(), request.mrp(), request.stock());
    }

    @GetMapping("/coupons") List<AdminService.CouponView> coupons() { return admin.coupons(); }

    @PostMapping("/coupons")
    AdminService.CouponView saveCoupon(@Valid @RequestBody CouponBody request) {
        return admin.saveCoupon(new AdminService.CouponRequest(request.code(), request.title(), request.description(),
                request.minimumAmount(), request.discountAmount(), request.active()));
    }

    @GetMapping("/settings") Map<String, String> settings() { return admin.settings(); }

    @PutMapping("/settings/{key}")
    Map<String, String> setting(@PathVariable String key, @RequestBody SettingRequest request) {
        return admin.updateSetting(key, request.value());
    }

    public record AssignRequest(@NotNull UUID staffId) {}
    public record StatusRequest(@NotBlank String status) {}
    public record StaffRequest(@NotBlank String name, @Email @NotBlank String email, String phone,
                               @NotBlank String password) {}
    public record RuleRequest(boolean appliesMinimum, @NotNull @Min(0) BigDecimal minimumOrderValue) {}
    public record VariantBody(@NotBlank String sku, @NotBlank String label, @NotNull @Min(0) BigDecimal price,
                              @NotNull @Min(0) BigDecimal mrp, @Min(0) int stock) {}
    public record ProductBody(@NotNull UUID categoryId, @NotBlank String slug, @NotBlank String name,
                              @NotBlank String hindiName, @NotBlank String emoji, @NotBlank String description,
                              String badge, boolean featured, @Valid @NotNull VariantBody variant) {}
    public record ProductUpdateBody(@NotBlank String name, @NotBlank String hindiName, @NotBlank String description,
                                    boolean featured, boolean active) {}
    public record VariantUpdateBody(@NotNull @Min(0) BigDecimal price, @NotNull @Min(0) BigDecimal mrp, @Min(0) int stock) {}
    public record CouponBody(@NotBlank String code, @NotBlank String title, @NotBlank String description,
                             @NotNull @Min(0) BigDecimal minimumAmount, @NotNull @Min(0) BigDecimal discountAmount,
                             boolean active) {}
    public record SettingRequest(@NotBlank String value) {}
}
