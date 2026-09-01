package in.desiaahhar.api.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final OtpService otp;
    private final AuthService auth;

    public AuthController(OtpService otp, AuthService auth) {
        this.otp = otp;
        this.auth = auth;
    }

    @PostMapping("/send-otp")
    OtpService.OtpDispatch sendOtp(@Valid @RequestBody PhoneRequest request) {
        return otp.sendSms(request.phone());
    }

    @PostMapping("/verify-otp")
    AuthService.AuthResponse verifyOtp(@Valid @RequestBody PhoneVerifyRequest request) {
        return auth.mobileLogin(otp.verifySms(request.phone(), request.otp()));
    }

    @PostMapping("/email/send-otp")
    OtpService.OtpDispatch sendEmailOtp(@Valid @RequestBody EmailRequest request) {
        return otp.sendEmail(request.email());
    }

    @PostMapping("/email/verify-otp")
    AuthService.AuthResponse verifyEmailOtp(@Valid @RequestBody EmailVerifyRequest request) {
        return auth.emailLogin(otp.verifyEmail(request.email(), request.otp()));
    }

    @PostMapping("/admin/login")
    AuthService.AuthResponse adminLogin(@Valid @RequestBody PasswordLogin request) {
        return auth.passwordLogin(request.email(), request.password(), "ADMIN");
    }

    @PostMapping("/staff/login")
    AuthService.AuthResponse staffLogin(@Valid @RequestBody PasswordLogin request) {
        return auth.passwordLogin(request.email(), request.password(), "STAFF");
    }

    public record PhoneRequest(@NotBlank String phone) {}
    public record PhoneVerifyRequest(@NotBlank String phone,
                                     @Pattern(regexp = "\\d{6}", message = "OTP must contain 6 digits") String otp) {}
    public record EmailRequest(@Email @NotBlank String email) {}
    public record EmailVerifyRequest(@Email @NotBlank String email,
                                     @Pattern(regexp = "\\d{6}", message = "OTP must contain 6 digits") String otp) {}
    public record PasswordLogin(@Email @NotBlank String email, @NotBlank String password) {}
}
