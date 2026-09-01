package in.desiaahhar.api.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class JwtService {
    private final JwtEncoder encoder;
    private final long ttlHours;

    public JwtService(JwtEncoder encoder, @Value("${app.jwt.ttl-hours}") long ttlHours) {
        this.encoder = encoder;
        this.ttlHours = ttlHours;
    }

    public String issue(UUID userId, String role, String name) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("desi-aahhar-api")
                .issuedAt(now)
                .expiresAt(now.plus(ttlHours, ChronoUnit.HOURS))
                .subject(userId.toString())
                .claim("name", name)
                .claim("roles", List.of(role))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
