package in.desiaahhar.api.auth;

import in.desiaahhar.api.common.ApiException;
import in.desiaahhar.api.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Types;
import java.util.UUID;

@Service
public class AuthService {
    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthService(JdbcClient jdbc, PasswordEncoder encoder, JwtService jwtService) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    public AuthResponse mobileLogin(String phone) {
        return response(findOrCreate("phone", phone));
    }

    public AuthResponse emailLogin(String email) {
        return response(findOrCreate("email", email));
    }

    public AuthResponse passwordLogin(String email, String password, String expectedRole) {
        UserRow user = jdbc.sql("""
                SELECT id, name, phone, email, password_hash, role FROM users
                WHERE lower(email) = lower(:email) AND active = true
                """).param("email", email.trim()).query(this::mapUser).optional()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (user.passwordHash() == null || !encoder.matches(password, user.passwordHash()))
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        if (expectedRole != null && !expectedRole.equals(user.role()) && !"ADMIN".equals(user.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, "This account cannot access the requested application");
        return response(user);
    }

    private UserRow findOrCreate(String field, String identity) {
        UserRow existing = jdbc.sql("SELECT id, name, phone, email, password_hash, role FROM users WHERE " + field + " = :identity")
                .param("identity", identity).query(this::mapUser).optional().orElse(null);
        if (existing != null) return existing;
        UUID id = UUID.randomUUID();
        JdbcClient.StatementSpec statement = jdbc.sql("""
                INSERT INTO users(id, name, phone, email, role) VALUES (:id, 'Desi Customer', :phone, :email, 'CUSTOMER')
                """).param("id", id);
        if ("phone".equals(field)) {
            statement.param("phone", identity).param("email", null, Types.VARCHAR);
        } else {
            statement.param("phone", null, Types.VARCHAR).param("email", identity);
        }
        statement.update();
        return jdbc.sql("SELECT id, name, phone, email, password_hash, role FROM users WHERE id = :id")
                .param("id", id).query(this::mapUser).single();
    }

    private UserRow mapUser(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        return new UserRow(rs.getObject("id", UUID.class), rs.getString("name"), rs.getString("phone"),
                rs.getString("email"), rs.getString("password_hash"), rs.getString("role"));
    }

    private AuthResponse response(UserRow user) {
        return new AuthResponse(jwtService.issue(user.id(), user.role(), user.name()),
                new UserView(user.id(), user.name(), user.phone(), user.email(), user.role()));
    }

    public record AuthResponse(String token, UserView user) {}
    public record UserView(UUID id, String name, String phone, String email, String role) {}
    private record UserRow(UUID id, String name, String phone, String email, String passwordHash, String role) {}
}
