package in.desiaahhar.api.admin;

import in.desiaahhar.api.catalog.CatalogService;
import in.desiaahhar.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {
    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;
    private final CatalogService catalog;

    public AdminService(JdbcClient jdbc, PasswordEncoder encoder, CatalogService catalog) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.catalog = catalog;
    }

    public Dashboard dashboard() {
        long users = count("SELECT count(*) FROM users WHERE role = 'CUSTOMER'");
        long orders = count("SELECT count(*) FROM orders");
        long activeOrders = count("SELECT count(*) FROM orders WHERE status NOT IN ('DELIVERED','CANCELLED','PAYMENT_PENDING')");
        long lowStock = count("SELECT count(*) FROM product_variants WHERE stock < 10 AND active = true");
        BigDecimal revenue = jdbc.sql("SELECT COALESCE(sum(total), 0) FROM orders WHERE payment_status = 'PAID' OR status = 'DELIVERED'")
                .query(BigDecimal.class).single();
        List<StatusCount> byStatus = jdbc.sql("SELECT status, count(*) total FROM orders GROUP BY status ORDER BY status")
                .query((rs, row) -> new StatusCount(rs.getString("status"), rs.getLong("total"))).list();
        return new Dashboard(users, orders, activeOrders, lowStock, revenue, byStatus);
    }

    public List<StaffView> staff() {
        return jdbc.sql("""
                SELECT u.id, u.name, u.email, u.phone, u.active,
                  (SELECT count(*) FROM orders o WHERE o.assigned_to = u.id AND o.status NOT IN ('DELIVERED','CANCELLED')) active_orders
                FROM users u WHERE u.role = 'STAFF' ORDER BY u.name
                """).query((rs, row) -> new StaffView(rs.getObject("id", UUID.class), rs.getString("name"),
                rs.getString("email"), rs.getString("phone"), rs.getBoolean("active"), rs.getLong("active_orders"))).list();
    }

    public StaffView createStaff(String name, String email, String phone, String password) {
        UUID id = UUID.randomUUID();
        try {
            JdbcClient.StatementSpec insert = jdbc.sql("""
                    INSERT INTO users(id, name, email, phone, password_hash, role)
                    VALUES (:id, :name, :email, :phone, :password, 'STAFF')
                    """).param("id", id).param("name", name).param("email", email.toLowerCase())
                    .param("password", encoder.encode(password));
            if (phone == null || phone.isBlank()) insert.param("phone", null, java.sql.Types.VARCHAR); else insert.param("phone", phone);
            insert.update();
        } catch (org.springframework.dao.DuplicateKeyException exception) {
            throw new ApiException(HttpStatus.CONFLICT, "Staff email or phone already exists");
        }
        return new StaffView(id, name, email.toLowerCase(), phone, true, 0);
    }

    public List<CatalogService.CategoryView> categories() { return catalog.categories(); }

    public CatalogService.CategoryView updateRule(UUID id, boolean applies, BigDecimal minimum) {
        int updated = jdbc.sql("""
                UPDATE categories SET applies_minimum = :applies, minimum_order_value = :minimum WHERE id = :id
                """).param("applies", applies).param("minimum", applies ? minimum : BigDecimal.ZERO).param("id", id).update();
        if (updated == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Category not found");
        return catalog.categories().stream().filter(category -> category.id().equals(id)).findFirst().orElseThrow();
    }

    @Transactional
    public CatalogService.ProductView createProduct(ProductRequest request) {
        UUID productId = UUID.randomUUID();
        UUID variantId = UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO products(id, category_id, slug, name, hindi_name, emoji, description, badge, featured)
                VALUES (:id, :categoryId, :slug, :name, :hindiName, :emoji, :description, :badge, :featured)
                """).param("id", productId).param("categoryId", request.categoryId()).param("slug", request.slug())
                .param("name", request.name()).param("hindiName", request.hindiName()).param("emoji", request.emoji())
                .param("description", request.description()).param("badge", request.badge() == null ? "" : request.badge())
                .param("featured", request.featured()).update();
        jdbc.sql("""
                INSERT INTO product_variants(id, product_id, sku, label, price, mrp, stock)
                VALUES (:id, :productId, :sku, :label, :price, :mrp, :stock)
                """).param("id", variantId).param("productId", productId).param("sku", request.variant().sku())
                .param("label", request.variant().label()).param("price", request.variant().price())
                .param("mrp", request.variant().mrp()).param("stock", request.variant().stock()).update();
        return catalog.product(productId);
    }

    public CatalogService.ProductView updateProduct(UUID id, ProductUpdate request) {
        int updated = jdbc.sql("""
                UPDATE products SET name = :name, hindi_name = :hindiName, description = :description,
                  featured = :featured, active = :active, updated_at = now() WHERE id = :id
                """).param("name", request.name()).param("hindiName", request.hindiName())
                .param("description", request.description()).param("featured", request.featured())
                .param("active", request.active()).param("id", id).update();
        if (updated == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Product not found");
        return catalog.product(id);
    }

    public Map<String, Object> updateVariant(UUID id, BigDecimal price, BigDecimal mrp, int stock) {
        int updated = jdbc.sql("UPDATE product_variants SET price = :price, mrp = :mrp, stock = :stock WHERE id = :id")
                .param("price", price).param("mrp", mrp).param("stock", stock).param("id", id).update();
        if (updated == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Product variant not found");
        return Map.of("updated", true, "variantId", id);
    }

    public List<CouponView> coupons() {
        return jdbc.sql("""
                SELECT id, code, title, description, minimum_amount, discount_amount, active, starts_at, ends_at
                FROM coupons ORDER BY code
                """).query((rs, row) -> new CouponView(rs.getObject("id", UUID.class), rs.getString("code"),
                rs.getString("title"), rs.getString("description"), rs.getBigDecimal("minimum_amount"),
                rs.getBigDecimal("discount_amount"), rs.getBoolean("active"),
                rs.getObject("starts_at", OffsetDateTime.class), rs.getObject("ends_at", OffsetDateTime.class))).list();
    }

    public CouponView saveCoupon(CouponRequest request) {
        UUID id = UUID.randomUUID();
        jdbc.sql("""
                INSERT INTO coupons(id, code, title, description, minimum_amount, discount_amount, active)
                VALUES (:id, upper(:code), :title, :description, :minimum, :discount, :active)
                ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description,
                  minimum_amount = EXCLUDED.minimum_amount, discount_amount = EXCLUDED.discount_amount, active = EXCLUDED.active
                """).param("id", id).param("code", request.code()).param("title", request.title())
                .param("description", request.description()).param("minimum", request.minimumAmount())
                .param("discount", request.discountAmount()).param("active", request.active()).update();
        return coupons().stream().filter(coupon -> coupon.code().equalsIgnoreCase(request.code())).findFirst().orElseThrow();
    }

    public Map<String, String> settings() {
        return jdbc.sql("SELECT key, value FROM app_settings ORDER BY key")
                .query((rs, row) -> Map.entry(rs.getString("key"), rs.getString("value"))).list().stream()
                .collect(java.util.stream.Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (left, right) -> right, java.util.LinkedHashMap::new));
    }

    public Map<String, String> updateSetting(String key, String value) {
        jdbc.sql("""
                INSERT INTO app_settings(key, value, updated_at) VALUES (:key, :value, now())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
                """).param("key", key).param("value", value).update();
        return settings();
    }

    private long count(String sql) { return jdbc.sql(sql).query(Long.class).single(); }

    public record Dashboard(long customers, long orders, long activeOrders, long lowStockVariants,
                            BigDecimal revenue, List<StatusCount> orderStatus) {}
    public record StatusCount(String status, long total) {}
    public record StaffView(UUID id, String name, String email, String phone, boolean active, long activeOrders) {}
    public record VariantRequest(String sku, String label, BigDecimal price, BigDecimal mrp, int stock) {}
    public record ProductRequest(UUID categoryId, String slug, String name, String hindiName, String emoji,
                                 String description, String badge, boolean featured, VariantRequest variant) {}
    public record ProductUpdate(String name, String hindiName, String description, boolean featured, boolean active) {}
    public record CouponView(UUID id, String code, String title, String description, BigDecimal minimumAmount,
                             BigDecimal discountAmount, boolean active, OffsetDateTime startsAt, OffsetDateTime endsAt) {}
    public record CouponRequest(String code, String title, String description, BigDecimal minimumAmount,
                                BigDecimal discountAmount, boolean active) {}
}
