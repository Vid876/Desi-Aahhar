# Spring Boot API integration

The app runs immediately with its local demo catalog and persistent state. Set `EXPO_PUBLIC_USE_MOCK_API=false` and configure `EXPO_PUBLIC_API_BASE_URL` when the Spring Boot API is ready.

## Client-to-API map

| App flow | Endpoint | Notes |
| --- | --- | --- |
| Send OTP | `POST /auth/send-otp` | Phone number, rate-limited server-side |
| Verify OTP | `POST /auth/verify-otp` | Returns access + refresh JWT |
| Send email OTP | `POST /auth/email/send-otp` | Fallback when SMS delivery fails; rate-limit by email and device |
| Verify email OTP | `POST /auth/email/verify-otp` | Links the verified email to the same customer account |
| Categories | `GET /categories` | Includes rule/exempt display metadata |
| Products | `GET /products?categoryId=` | Product and variant remain separate |
| Search | `GET /search?q=` | Catalog search |
| Cart | `GET/POST /cart`, `POST /cart/items` | Backend remains price authority |
| Rule preview | `POST /cart/validate` | Returns valid, reason and remaining amount |
| Checkout preview | `POST /checkout/preview` | Rechecks price, stock, rules, coupon and delivery |
| Create order | `POST /orders` | Send a unique `Idempotency-Key` |
| Payment | `POST /payments/create` | Razorpay order creation; verify webhook server-side |
| Track order | `GET /orders/{id}` | Status history and delivery assignment |

## Expected cart validation response

```json
{
  "valid": false,
  "ruleGroups": [
    {
      "code": "KIRANA_MIN_500",
      "eligibleSubtotal": 400,
      "threshold": 500,
      "remaining": 100,
      "message": "Add ₹100 more from eligible grocery"
    }
  ]
}
```

The mobile app never decides final checkout eligibility in production. Its local rule engine exists for demo UX and tests; the server response replaces it when mock mode is disabled.

## Authentication fallback contract

The primary path remains mobile OTP. If SMS is delayed or unavailable, the customer can switch to email OTP from either the mobile-entry or OTP screen.

```json
{
  "email": "customer@example.com"
}
```

Email OTP verification should return the same access/refresh JWT response shape as mobile verification. The backend should resolve or link both verified identities to one customer record, expire codes quickly, enforce attempt limits and avoid revealing whether an email is already registered.

## Order status contract

`CONFIRMED -> PICKING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED`

Payment failures/timeouts should release inventory reservations and transition the order to a cancelled/expired state. Old orders must retain their item, price and rule snapshots.
