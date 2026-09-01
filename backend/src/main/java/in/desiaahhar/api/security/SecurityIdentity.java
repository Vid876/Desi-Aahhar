package in.desiaahhar.api.security;

import in.desiaahhar.api.common.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class SecurityIdentity {
    private SecurityIdentity() {}

    public static UUID userId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated())
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication is required");
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid access token");
        }
    }
}
