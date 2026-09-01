package in.desiaahhar.api.notification;

import in.desiaahhar.api.security.SecurityIdentity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notifications;

    public NotificationController(NotificationService notifications) {
        this.notifications = notifications;
    }

    @PostMapping("/devices")
    Map<String, Object> register(Authentication authentication, @Valid @RequestBody DeviceRequest request) {
        notifications.register(SecurityIdentity.userId(authentication), request.token(), request.platform(), request.app());
        return Map.of("registered", true, "realPushEnabled", notifications.realPushEnabled());
    }

    @GetMapping
    List<NotificationService.NotificationView> list(Authentication authentication) {
        return notifications.list(SecurityIdentity.userId(authentication));
    }

    @PatchMapping("/{id}/read")
    Map<String, Boolean> read(Authentication authentication, @PathVariable UUID id) {
        notifications.markRead(SecurityIdentity.userId(authentication), id);
        return Map.of("read", true);
    }

    public record DeviceRequest(@NotBlank String token, @NotBlank String platform, @NotBlank String app) {}
}
