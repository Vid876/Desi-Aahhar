package in.desiaahhar.api.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@Component
public class SeedData implements ApplicationRunner {
    private final JdbcClient jdbc;
    private final PasswordEncoder encoder;
    private final String adminName;
    private final String adminEmail;
    private final String adminPassword;
    private final String staffName;
    private final String staffEmail;
    private final String staffPassword;

    public SeedData(JdbcClient jdbc, PasswordEncoder encoder,
                    @Value("${app.bootstrap.admin-name}") String adminName,
                    @Value("${app.bootstrap.admin-email}") String adminEmail,
                    @Value("${app.bootstrap.admin-password}") String adminPassword,
                    @Value("${app.bootstrap.staff-name}") String staffName,
                    @Value("${app.bootstrap.staff-email}") String staffEmail,
                    @Value("${app.bootstrap.staff-password}") String staffPassword) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.adminName = adminName;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.staffName = staffName;
        this.staffEmail = staffEmail;
        this.staffPassword = staffPassword;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedUser(adminName, adminEmail, "ADMIN", adminPassword);
        seedUser(staffName, staffEmail, "STAFF", staffPassword);
    }

    private void seedUser(String name, String email, String role, String rawPassword) {
        jdbc.sql("""
                INSERT INTO users(id, name, email, password_hash, role)
                VALUES (:id, :name, :email, :password, :role)
                ON CONFLICT (email) DO NOTHING
                """)
                .param("id", UUID.randomUUID())
                .param("name", name)
                .param("email", email)
                .param("password", encoder.encode(rawPassword))
                .param("role", role)
                .update();
    }
}
