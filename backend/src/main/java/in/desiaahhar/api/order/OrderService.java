package in.desiaahhar.api.order;

import in.desiaahhar.api.cart.CartService;
import in.desiaahhar.api.common.ApiException;
import in.desiaahhar.api.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Types;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {
    private final JdbcClient jdbc;
    private final CartService cart;
    private final NotificationService notifications;

    public OrderService(JdbcClient jdbc, CartService cart, NotificationService notifications) {
        this.jdbc = jdbc;
        this.cart = cart;
        this.notifications = notifications;
    }

    @Transactional
    public OrderView create(UUID userId, CreateOrderRequest request) {
        List<CartService.CartLine> items = cart.lines(userId);
        if (items.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Cart is empty");
        CartService.Pricing pricing = cart.price(items, request.couponCode());
        if (!pricing.valid()) throw new ApiException(HttpStatus.BAD_REQUEST,
                "Minimum order rule is not met for: " + String.join(", ", pricing.violations().stream().map(CartService.RuleViolation::categoryName).toList()));
        String paymentMethod = request.paymentMethod().toUpperCase();
        if (!List.of("COD", "ONLINE").contains(paymentMethod))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Payment method must be COD or ONLINE");
        UUID orderId = UUID.randomUUID();
        String orderNumber = "DAH" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        String status = "COD".equals(paymentMethod) ? "CONFIRMED" : "PAYMENT_PENDING";
        JdbcClient.StatementSpec insert = jdbc.sql("""
                INSERT INTO orders(id, order_number, user_id, status, payment_method, payment_status,
                  subtotal, discount, delivery_fee, total, coupon_code, delivery_slot,
                  recipient, recipient_phone, address_line1, address_city, address_pincode, customer_note)
                VALUES (:id, :number, :userId, :status, :paymentMethod, 'PENDING', :subtotal, :discount,
                  :deliveryFee, :total, :couponCode, :slot, :recipient, :phone, :line1, :city, :pincode, :note)
                """).param("id", orderId).param("number", orderNumber).param("userId", userId)
                .param("status", status).param("paymentMethod", paymentMethod).param("subtotal", pricing.subtotal())
                .param("discount", pricing.discount()).param("deliveryFee", pricing.deliveryFee()).param("total", pricing.total())
                .param("slot", request.deliverySlot()).param("recipient", request.address().recipient())
                .param("phone", request.address().phone()).param("line1", request.address().line1())
                .param("city", request.address().city()).param("pincode", request.address().pincode());
        if (request.couponCode() == null) insert.param("couponCode", null, Types.VARCHAR); else insert.param("couponCode", request.couponCode());
        if (request.note() == null) insert.param("note", null, Types.VARCHAR); else insert.param("note", request.note());
        insert.update();
        for (CartService.CartLine item : items) {
            int updated = jdbc.sql("UPDATE product_variants SET stock = stock - :quantity WHERE id = :id AND stock >= :quantity")
                    .param("quantity", item.quantity()).param("id", item.variantId()).update();
            if (updated == 0) throw new ApiException(HttpStatus.CONFLICT, item.productName() + " is out of stock");
            jdbc.sql("""
                    INSERT INTO order_items(order_id, product_id, variant_id, product_name, variant_label,
                      quantity, unit_price, line_total)
                    VALUES (:orderId, :productId, :variantId, :name, :label, :quantity, :price, :lineTotal)
                    """).param("orderId", orderId).param("productId", item.productId()).param("variantId", item.variantId())
                    .param("name", item.productName()).param("label", item.variantLabel()).param("quantity", item.quantity())
                    .param("price", item.price()).param("lineTotal", item.lineTotal()).update();
        }
        addHistory(orderId, status, "Order created", userId);
        cart.clear(userId);
        if ("COD".equals(paymentMethod)) {
            notifications.notifyUser(userId, "Order confirmed", orderNumber + " has been placed successfully.",
                    Map.of("type", "ORDER_STATUS", "orderId", orderId.toString(), "status", status));
        }
        return getForUser(userId, orderId);
    }

    public List<OrderView> listForUser(UUID userId) {
        return orderIds("SELECT id FROM orders WHERE user_id = :userId ORDER BY created_at DESC", "userId", userId)
                .stream().map(id -> getForUser(userId, id)).toList();
    }

    public OrderView getForUser(UUID userId, UUID orderId) {
        return view(orderId, " AND o.user_id = :actorId", userId);
    }

    public List<OrderView> listAll(String status) {
        String sql = "SELECT id FROM orders WHERE (:status IS NULL OR status = :status) ORDER BY created_at DESC";
        JdbcClient.StatementSpec statement = jdbc.sql(sql);
        if (status == null) statement.param("status", null, Types.VARCHAR); else statement.param("status", status);
        return statement.query(UUID.class).list().stream().map(this::getAny).toList();
    }

    public OrderView getAny(UUID orderId) {
        return view(orderId, "", null);
    }

    public List<OrderView> listForStaff(UUID staffId) {
        return orderIds("SELECT id FROM orders WHERE assigned_to = :actorId ORDER BY created_at DESC", "actorId", staffId)
                .stream().map(id -> view(id, " AND o.assigned_to = :actorId", staffId)).toList();
    }

    public OrderView getForStaff(UUID staffId, UUID orderId) {
        return view(orderId, " AND o.assigned_to = :actorId", staffId);
    }

    @Transactional
    public OrderView assign(UUID orderId, UUID staffId, UUID adminId) {
        Integer staff = jdbc.sql("SELECT count(*) FROM users WHERE id = :id AND role = 'STAFF' AND active = true")
                .param("id", staffId).query(Integer.class).single();
        if (staff == 0) throw new ApiException(HttpStatus.BAD_REQUEST, "Active delivery staff not found");
        int updated = jdbc.sql("UPDATE orders SET assigned_to = :staffId, updated_at = now() WHERE id = :orderId")
                .param("staffId", staffId).param("orderId", orderId).update();
        if (updated == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        addHistory(orderId, currentStatus(orderId), "Assigned to delivery staff", adminId);
        OrderView order = getAny(orderId);
        notifications.notifyUser(staffId, "New delivery assigned", order.orderNumber() + " is ready for you.",
                Map.of("type", "DELIVERY_ASSIGNMENT", "orderId", orderId.toString()));
        return order;
    }

    @Transactional
    public OrderView updateStatus(UUID orderId, String requested, UUID actorId, boolean staffRestricted) {
        String next = requested.toUpperCase();
        String current = currentStatus(orderId);
        Map<String, List<String>> transitions = Map.of(
                "PAYMENT_PENDING", List.of("CONFIRMED", "CANCELLED"),
                "CONFIRMED", List.of("PICKING", "CANCELLED"),
                "PICKING", List.of("PACKED", "CANCELLED"),
                "PACKED", List.of("OUT_FOR_DELIVERY", "CANCELLED"),
                "OUT_FOR_DELIVERY", List.of("DELIVERED", "CANCELLED"),
                "DELIVERED", List.of(), "CANCELLED", List.of());
        if (!transitions.getOrDefault(current, List.of()).contains(next))
            throw new ApiException(HttpStatus.CONFLICT, "Order cannot move from " + current + " to " + next);
        String ownerCheck = staffRestricted ? " AND assigned_to = :actorId" : "";
        JdbcClient.StatementSpec statement = jdbc.sql("UPDATE orders SET status = :status, updated_at = now() WHERE id = :id" + ownerCheck)
                .param("status", next).param("id", orderId);
        if (staffRestricted) statement.param("actorId", actorId);
        if (statement.update() == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Assigned order not found");
        addHistory(orderId, next, "Status updated", actorId);
        OrderView order = getAny(orderId);
        notifications.notifyUser(order.userId(), "Order update", order.orderNumber() + " is now " + next.replace('_', ' ').toLowerCase() + ".",
                Map.of("type", "ORDER_STATUS", "orderId", orderId.toString(), "status", next));
        return order;
    }

    public OrderView addProof(UUID staffId, UUID orderId, String proofUrl) {
        int updated = jdbc.sql("UPDATE orders SET delivery_proof_url = :proof, updated_at = now() WHERE id = :id AND assigned_to = :staffId")
                .param("proof", proofUrl).param("id", orderId).param("staffId", staffId).update();
        if (updated == 0) throw new ApiException(HttpStatus.NOT_FOUND, "Assigned order not found");
        return getForStaff(staffId, orderId);
    }

    @Transactional
    public OrderView cancelPendingPayment(UUID userId, UUID orderId) {
        PaymentOrder order = paymentOrder(userId, orderId);
        if (!"PAYMENT_PENDING".equals(order.status())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only an unpaid online order can be cancelled here");
        }
        jdbc.sql("""
                UPDATE product_variants v SET stock = stock + oi.quantity
                FROM order_items oi WHERE oi.order_id = :orderId AND oi.variant_id = v.id
                """).param("orderId", orderId).update();
        jdbc.sql("""
                INSERT INTO cart_items(user_id, variant_id, quantity)
                SELECT :userId, variant_id, quantity FROM order_items WHERE order_id = :orderId
                ON CONFLICT (user_id, variant_id) DO UPDATE
                SET quantity = EXCLUDED.quantity, updated_at = now()
                """).param("userId", userId).param("orderId", orderId).update();
        jdbc.sql("UPDATE payments SET status = 'FAILED', updated_at = now() WHERE order_id = :orderId AND status = 'CREATED'")
                .param("orderId", orderId).update();
        jdbc.sql("UPDATE orders SET status = 'CANCELLED', payment_status = 'FAILED', updated_at = now() WHERE id = :orderId")
                .param("orderId", orderId).update();
        addHistory(orderId, "CANCELLED", "Online payment was not completed; cart and stock were restored", userId);
        return getForUser(userId, orderId);
    }

    @Transactional
    public void markPaid(UUID orderId, String paymentId) {
        UUID userId = jdbc.sql("UPDATE orders SET payment_status = 'PAID', status = 'CONFIRMED', updated_at = now() WHERE id = :id RETURNING user_id")
                .param("id", orderId).query(UUID.class).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
        addHistory(orderId, "CONFIRMED", "Online payment verified: " + paymentId, userId);
        OrderView order = getAny(orderId);
        notifications.notifyUser(userId, "Payment successful", order.orderNumber() + " is confirmed.",
                Map.of("type", "PAYMENT_SUCCESS", "orderId", orderId.toString()));
    }

    public PaymentOrder paymentOrder(UUID userId, UUID orderId) {
        return jdbc.sql("SELECT id, order_number, total, status, payment_method FROM orders WHERE id = :id AND user_id = :userId")
                .param("id", orderId).param("userId", userId).query((rs, row) -> new PaymentOrder(
                        rs.getObject("id", UUID.class), rs.getString("order_number"), rs.getBigDecimal("total"),
                        rs.getString("status"), rs.getString("payment_method"))).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private OrderView view(UUID orderId, String actorClause, UUID actorId) {
        String sql = """
                SELECT o.*, u.name customer_name, s.name staff_name FROM orders o
                JOIN users u ON u.id = o.user_id LEFT JOIN users s ON s.id = o.assigned_to
                WHERE o.id = :id
                """ + actorClause;
        JdbcClient.StatementSpec statement = jdbc.sql(sql).param("id", orderId);
        if (actorId != null) statement.param("actorId", actorId);
        return statement.query((rs, row) -> new OrderView(
                rs.getObject("id", UUID.class), rs.getString("order_number"), rs.getObject("user_id", UUID.class),
                rs.getString("customer_name"), rs.getString("status"), rs.getString("payment_method"),
                rs.getString("payment_status"), rs.getBigDecimal("subtotal"), rs.getBigDecimal("discount"),
                rs.getBigDecimal("delivery_fee"), rs.getBigDecimal("total"), rs.getString("delivery_slot"),
                new AddressView(rs.getString("recipient"), rs.getString("recipient_phone"), rs.getString("address_line1"),
                        rs.getString("address_city"), rs.getString("address_pincode")),
                rs.getObject("assigned_to", UUID.class), rs.getString("staff_name"), rs.getString("delivery_proof_url"),
                rs.getObject("created_at", OffsetDateTime.class), items(orderId), history(orderId))).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private List<OrderItemView> items(UUID orderId) {
        return jdbc.sql("SELECT product_id, variant_id, product_name, variant_label, quantity, unit_price, line_total FROM order_items WHERE order_id = :id")
                .param("id", orderId).query((rs, row) -> new OrderItemView(rs.getObject("product_id", UUID.class),
                        rs.getObject("variant_id", UUID.class), rs.getString("product_name"), rs.getString("variant_label"),
                        rs.getInt("quantity"), rs.getBigDecimal("unit_price"), rs.getBigDecimal("line_total"))).list();
    }

    private List<HistoryView> history(UUID orderId) {
        return jdbc.sql("SELECT status, note, created_at FROM order_status_history WHERE order_id = :id ORDER BY created_at")
                .param("id", orderId).query((rs, row) -> new HistoryView(rs.getString("status"), rs.getString("note"),
                        rs.getObject("created_at", OffsetDateTime.class))).list();
    }

    private List<UUID> orderIds(String sql, String parameter, UUID value) {
        return jdbc.sql(sql).param(parameter, value).query(UUID.class).list();
    }

    private String currentStatus(UUID orderId) {
        return jdbc.sql("SELECT status FROM orders WHERE id = :id").param("id", orderId).query(String.class).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private void addHistory(UUID orderId, String status, String note, UUID actorId) {
        jdbc.sql("INSERT INTO order_status_history(order_id, status, note, changed_by) VALUES (:orderId, :status, :note, :actorId)")
                .param("orderId", orderId).param("status", status).param("note", note).param("actorId", actorId).update();
    }

    public record AddressRequest(String recipient, String phone, String line1, String city, String pincode) {}
    public record CreateOrderRequest(String paymentMethod, String deliverySlot, AddressRequest address,
                                     String couponCode, String note) {}
    public record AddressView(String recipient, String phone, String line1, String city, String pincode) {}
    public record OrderItemView(UUID productId, UUID variantId, String productName, String variantLabel,
                                int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {}
    public record HistoryView(String status, String note, OffsetDateTime createdAt) {}
    public record OrderView(UUID id, String orderNumber, UUID userId, String customerName, String status,
                            String paymentMethod, String paymentStatus, BigDecimal subtotal, BigDecimal discount,
                            BigDecimal deliveryFee, BigDecimal total, String deliverySlot, AddressView address,
                            UUID assignedTo, String staffName, String deliveryProofUrl, OffsetDateTime createdAt,
                            List<OrderItemView> items, List<HistoryView> history) {}
    public record PaymentOrder(UUID id, String orderNumber, BigDecimal total, String status, String paymentMethod) {}
}
