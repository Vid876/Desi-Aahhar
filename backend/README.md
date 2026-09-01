# Spring Boot API

Spring Boot 4.1 / Java 17 API with PostgreSQL, Flyway, JWT role security, Twilio Verify, SMTP OTP, Razorpay signature verification, Firebase Cloud Messaging, delivery tracking and file uploads.

Run through root Docker Compose, or locally after starting PostgreSQL:

```powershell
mvn spring-boot:run
```

Health endpoint: `GET /actuator/health`. All application endpoints are under `/api/v1`. Environment variables are listed in the root `.env.example`.
