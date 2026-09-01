package in.desiaahhar.api.catalog;

import in.desiaahhar.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CatalogService {
    private final JdbcClient jdbc;

    public CatalogService(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public List<CategoryView> categories() {
        return jdbc.sql("""
                SELECT id, slug, name, hindi_name, emoji, color, applies_minimum, minimum_order_value
                FROM categories WHERE active = true ORDER BY sort_order, name
                """).query((rs, row) -> new CategoryView(
                rs.getObject("id", UUID.class), rs.getString("slug"), rs.getString("name"),
                rs.getString("hindi_name"), rs.getString("emoji"), rs.getString("color"),
                rs.getBoolean("applies_minimum"), rs.getBigDecimal("minimum_order_value"))).list();
    }

    public List<ProductView> products(String category, Boolean featured, String query) {
        StringBuilder sql = new StringBuilder("""
                SELECT p.id, p.category_id, p.slug, p.name, p.hindi_name, p.emoji, p.description,
                       p.rating, p.reviews, p.badge, p.featured
                FROM products p JOIN categories c ON c.id = p.category_id
                WHERE p.active = true AND c.active = true
                """);
        if (category != null && !category.isBlank()) sql.append(" AND (c.slug = :category OR c.id::text = :category)");
        if (featured != null) sql.append(" AND p.featured = :featured");
        if (query != null && !query.isBlank()) sql.append(" AND (p.name ILIKE :query OR p.hindi_name ILIKE :query OR p.description ILIKE :query)");
        sql.append(" ORDER BY p.featured DESC, p.name");
        JdbcClient.StatementSpec statement = jdbc.sql(sql.toString());
        if (category != null && !category.isBlank()) statement.param("category", category);
        if (featured != null) statement.param("featured", featured);
        if (query != null && !query.isBlank()) statement.param("query", "%" + query.trim() + "%");
        return statement.query((rs, row) -> new ProductView(
                rs.getObject("id", UUID.class), rs.getObject("category_id", UUID.class), rs.getString("slug"),
                rs.getString("name"), rs.getString("hindi_name"), rs.getString("emoji"),
                rs.getString("description"), rs.getBigDecimal("rating"), rs.getInt("reviews"),
                rs.getString("badge"), rs.getBoolean("featured"), variants(rs.getObject("id", UUID.class)))).list();
    }

    public ProductView product(UUID id) {
        return jdbc.sql("""
                SELECT id, category_id, slug, name, hindi_name, emoji, description, rating, reviews, badge, featured
                FROM products WHERE id = :id AND active = true
                """).param("id", id).query((rs, row) -> new ProductView(
                rs.getObject("id", UUID.class), rs.getObject("category_id", UUID.class), rs.getString("slug"),
                rs.getString("name"), rs.getString("hindi_name"), rs.getString("emoji"),
                rs.getString("description"), rs.getBigDecimal("rating"), rs.getInt("reviews"),
                rs.getString("badge"), rs.getBoolean("featured"), variants(id))).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public List<OfferView> offers() {
        return jdbc.sql("""
                SELECT code, title, description, minimum_amount, discount_amount
                FROM coupons
                WHERE active = true
                  AND (starts_at IS NULL OR starts_at <= now())
                  AND (ends_at IS NULL OR ends_at >= now())
                ORDER BY discount_amount DESC, code
                """).query((rs, row) -> new OfferView(
                rs.getString("code"), rs.getString("title"), rs.getString("description"),
                rs.getBigDecimal("minimum_amount"), rs.getBigDecimal("discount_amount"))).list();
    }

    private List<VariantView> variants(UUID productId) {
        return jdbc.sql("""
                SELECT id, sku, label, price, mrp, stock FROM product_variants
                WHERE product_id = :productId AND active = true ORDER BY price
                """).param("productId", productId).query((rs, row) -> new VariantView(
                rs.getObject("id", UUID.class), rs.getString("sku"), rs.getString("label"),
                rs.getBigDecimal("price"), rs.getBigDecimal("mrp"), rs.getInt("stock"))).list();
    }

    public record CategoryView(UUID id, String slug, String name, String hindiName, String emoji,
                               String color, boolean appliesMinimum, BigDecimal minimumOrderValue) {}
    public record VariantView(UUID id, String sku, String label, BigDecimal price, BigDecimal mrp, int stock) {}
    public record ProductView(UUID id, UUID categoryId, String slug, String name, String hindiName,
                              String emoji, String description, BigDecimal rating, int reviews,
                              String badge, boolean featured, List<VariantView> variants) {}
    public record OfferView(String code, String title, String description,
                            BigDecimal minimumAmount, BigDecimal discountAmount) {}
}
