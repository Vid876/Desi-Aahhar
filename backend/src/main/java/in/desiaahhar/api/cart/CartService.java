package in.desiaahhar.api.cart;

import in.desiaahhar.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {
    private final JdbcClient jdbc;

    public CartService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public CartView get(UUID userId, String couponCode) {
        List<CartLine> items = lines(userId);
        Pricing pricing = price(items, couponCode);
        return new CartView(items, items.stream().mapToInt(CartLine::quantity).sum(), pricing);
    }

    public CartView add(UUID userId, UUID variantId, int quantity) {
        ensureStock(variantId, quantity);
        jdbc.sql("""
                INSERT INTO cart_items(user_id, variant_id, quantity) VALUES (:userId, :variantId, :quantity)
                ON CONFLICT (user_id, variant_id) DO UPDATE
                SET quantity = LEAST(EXCLUDED.quantity + cart_items.quantity,
                    (SELECT stock FROM product_variants WHERE id = :variantId)), updated_at = now()
                """).param("userId", userId).param("variantId", variantId).param("quantity", quantity).update();
        return get(userId, null);
    }

    public CartView update(UUID userId, UUID variantId, int quantity) {
        if (quantity <= 0) return remove(userId, variantId);
        ensureStock(variantId, quantity);
        int changed = jdbc.sql("UPDATE cart_items SET quantity = :quantity, updated_at = now() WHERE user_id = :userId AND variant_id = :variantId")
                .param("quantity", quantity).param("userId", userId).param("variantId", variantId).update();
        if (changed == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Cart item not found");
        return get(userId, null);
    }

    public CartView remove(UUID userId, UUID variantId) {
        jdbc.sql("DELETE FROM cart_items WHERE user_id = :userId AND variant_id = :variantId")
                .param("userId", userId).param("variantId", variantId).update();
        return get(userId, null);
    }

    public void clear(UUID userId) {
        jdbc.sql("DELETE FROM cart_items WHERE user_id = :userId").param("userId", userId).update();
    }

    public List<CartLine> lines(UUID userId) {
        return jdbc.sql("""
                SELECT p.id product_id, p.name product_name, p.emoji, v.id variant_id, v.label variant_label,
                       v.price, v.mrp, v.stock, ci.quantity, c.id category_id, c.name category_name,
                       c.applies_minimum, c.minimum_order_value
                FROM cart_items ci JOIN product_variants v ON v.id = ci.variant_id
                JOIN products p ON p.id = v.product_id JOIN categories c ON c.id = p.category_id
                WHERE ci.user_id = :userId AND p.active = true AND v.active = true ORDER BY ci.updated_at DESC
                """).param("userId", userId).query((rs, row) -> new CartLine(
                rs.getObject("product_id", UUID.class), rs.getString("product_name"), rs.getString("emoji"),
                rs.getObject("variant_id", UUID.class), rs.getString("variant_label"), rs.getBigDecimal("price"),
                rs.getBigDecimal("mrp"), rs.getInt("stock"), rs.getInt("quantity"),
                rs.getObject("category_id", UUID.class), rs.getString("category_name"),
                rs.getBoolean("applies_minimum"), rs.getBigDecimal("minimum_order_value"))).list();
    }

    public Pricing price(List<CartLine> items, String couponCode) {
        BigDecimal subtotal = items.stream().map(CartLine::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<RuleViolation> violations = items.stream().filter(CartLine::appliesMinimum)
                .map(CartLine::categoryId).distinct().map(categoryId -> {
                    List<CartLine> categoryItems = items.stream().filter(item -> item.categoryId().equals(categoryId)).toList();
                    BigDecimal categoryTotal = categoryItems.stream().map(CartLine::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal threshold = categoryItems.get(0).minimumOrderValue();
                    return new RuleViolation(categoryId, categoryItems.get(0).categoryName(), categoryTotal, threshold,
                            threshold.subtract(categoryTotal).max(BigDecimal.ZERO));
                }).filter(rule -> rule.remaining().compareTo(BigDecimal.ZERO) > 0).toList();
        BigDecimal discount = resolveDiscount(couponCode, subtotal);
        BigDecimal freeMinimum = setting("FREE_DELIVERY_MINIMUM", "999");
        BigDecimal deliveryFee = subtotal.signum() == 0 || subtotal.compareTo(freeMinimum) >= 0
                ? BigDecimal.ZERO : setting("DELIVERY_FEE", "49");
        BigDecimal eligibleSubtotal = items.stream().filter(CartLine::appliesMinimum)
                .map(CartLine::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Pricing(subtotal, eligibleSubtotal, violations.isEmpty(), violations,
                discount, deliveryFee, subtotal.subtract(discount).add(deliveryFee).max(BigDecimal.ZERO));
    }

    private BigDecimal resolveDiscount(String code, BigDecimal subtotal) {
        if (code == null || code.isBlank()) return BigDecimal.ZERO;
        Coupon coupon = jdbc.sql("""
                SELECT minimum_amount, discount_amount FROM coupons WHERE upper(code) = upper(:code) AND active = true
                  AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
                """).param("code", code.trim()).query((rs, row) -> new Coupon(
                rs.getBigDecimal("minimum_amount"), rs.getBigDecimal("discount_amount"))).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Coupon is invalid or expired"));
        if (subtotal.compareTo(coupon.minimum()) < 0)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cart total is below the coupon minimum");
        return coupon.discount();
    }

    private BigDecimal setting(String key, String fallback) {
        return jdbc.sql("SELECT value FROM app_settings WHERE key = :key").param("key", key).query(String.class)
                .optional().map(BigDecimal::new).orElse(new BigDecimal(fallback));
    }

    private void ensureStock(UUID variantId, int quantity) {
        Integer stock = jdbc.sql("SELECT stock FROM product_variants WHERE id = :id AND active = true")
                .param("id", variantId).query(Integer.class).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product variant not found"));
        if (quantity < 1 || quantity > stock) throw new ApiException(HttpStatus.BAD_REQUEST, "Requested quantity is not available");
    }

    public record CartLine(UUID productId, String productName, String emoji, UUID variantId, String variantLabel,
                           BigDecimal price, BigDecimal mrp, int stock, int quantity, UUID categoryId,
                           String categoryName, boolean appliesMinimum, BigDecimal minimumOrderValue) {
        public BigDecimal lineTotal() { return price.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP); }
    }
    public record RuleViolation(UUID categoryId, String categoryName, BigDecimal subtotal,
                                BigDecimal threshold, BigDecimal remaining) {}
    public record Pricing(BigDecimal subtotal, BigDecimal eligibleSubtotal, boolean valid,
                          List<RuleViolation> violations, BigDecimal discount,
                          BigDecimal deliveryFee, BigDecimal total) {}
    public record CartView(List<CartLine> items, int itemCount, Pricing pricing) {}
    private record Coupon(BigDecimal minimum, BigDecimal discount) {}
}
