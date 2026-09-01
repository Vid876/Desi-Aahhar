# Customer API map

The app uses these implemented Spring Boot endpoints when `EXPO_PUBLIC_USE_MOCK_API=false`.

| Flow | Endpoint |
| --- | --- |
| Send/verify phone OTP | `POST /auth/send-otp`, `POST /auth/verify-otp` |
| Send/verify email OTP | `POST /auth/email/send-otp`, `POST /auth/email/verify-otp` |
| Catalog and offers | `GET /categories`, `GET /products`, `GET /offers` |
| Server cart | `GET /cart`, `POST/PATCH/DELETE /cart/items` |
| Price/rule validation | `POST /cart/validate`, `GET /checkout/preview` |
| Create/list/track order | `POST/GET /orders`, `GET /orders/{id}` |
| Razorpay | `POST /payments/create`, `POST /payments/verify` |
| Push and in-app alerts | `POST /notifications/devices`, `GET /notifications` |

The backend is the final authority for price, stock, coupon, category minimum and payment signatures. The app keeps an optimistic local cart for fast rendering and refreshes it from the server after authentication.

Order lifecycle:

`PAYMENT_PENDING -> CONFIRMED -> PICKING -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED`

When an online checkout is cancelled before verification, `POST /orders/{id}/cancel` releases reserved stock and restores the server cart.
