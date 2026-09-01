package in.desiaahhar.api.delivery;

import in.desiaahhar.api.order.OrderService;
import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;

@RestController
@RequestMapping("/api/v1/delivery")
public class DeliveryController {
    private final OrderService orders;
    private final JdbcClient jdbc;

    public DeliveryController(OrderService orders, JdbcClient jdbc) { this.orders = orders; this.jdbc = jdbc; }

    @GetMapping("/orders")
    List<OrderService.OrderView> assigned(Authentication authentication) {
        return orders.listForStaff(SecurityIdentity.userId(authentication));
    }

    @GetMapping("/orders/{id}")
    OrderService.OrderView order(Authentication authentication, @PathVariable UUID id) {
        return orders.getForStaff(SecurityIdentity.userId(authentication), id);
    }

    @PatchMapping("/orders/{id}/status")
    OrderService.OrderView status(Authentication authentication, @PathVariable UUID id,
                                  @Valid @RequestBody StatusRequest request) {
        return orders.updateStatus(id, request.status(), SecurityIdentity.userId(authentication), true);
    }

    @PostMapping("/orders/{id}/proof")
    OrderService.OrderView proof(Authentication authentication, @PathVariable UUID id,
                                 @Valid @RequestBody ProofRequest request) {
        return orders.addProof(SecurityIdentity.userId(authentication), id, request.proofUrl());
    }

    @PostMapping("/orders/{id}/location")
    Map<String, Object> location(Authentication authentication, @PathVariable UUID id,
                                 @Valid @RequestBody LocationRequest request) {
        UUID staffId = SecurityIdentity.userId(authentication);
        Integer assigned = jdbc.sql("SELECT count(*) FROM orders WHERE id = :id AND assigned_to = :staffId")
                .param("id", id).param("staffId", staffId).query(Integer.class).single();
        if (assigned == 0) throw new in.desiaahhar.api.common.ApiException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Assigned order not found");
        JdbcClient.StatementSpec insert = jdbc.sql("""
                INSERT INTO delivery_locations(order_id, staff_id, latitude, longitude, accuracy)
                VALUES (:orderId, :staffId, :latitude, :longitude, :accuracy)
                """).param("orderId", id).param("staffId", staffId).param("latitude", request.latitude())
                .param("longitude", request.longitude());
        if (request.accuracy() == null) insert.param("accuracy", null, java.sql.Types.NUMERIC);
        else insert.param("accuracy", request.accuracy());
        insert.update();
        return Map.of("tracked", true, "recordedAt", java.time.OffsetDateTime.now().toString());
    }

    public record StatusRequest(@NotBlank String status) {}
    public record ProofRequest(@NotBlank String proofUrl) {}
    public record LocationRequest(@NotNull java.math.BigDecimal latitude, @NotNull java.math.BigDecimal longitude,
                                  java.math.BigDecimal accuracy) {}
}
