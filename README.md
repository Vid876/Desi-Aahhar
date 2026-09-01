# देसी Aahhar — connected grocery platform

यह repository एक connected grocery/Kirana system है। इसमें attractive customer app, delivery app, web admin, Spring Boot API और PostgreSQL database एक साथ काम करते हैं।

## क्या बना है

| Application | Technology | काम |
| --- | --- | --- |
| Customer mobile app | Expo SDK 57 + React Native | OTP login, catalog, category rules, cart, coupons, COD/Razorpay, orders, notifications |
| Delivery/staff mobile app | Expo SDK 57 + React Native | Assigned orders, status updates, live GPS, delivery proof, push token |
| Admin panel | React 19 + Vite | Dashboard, products/variants/stock, category limits, coupons, staff, assignment, order status |
| Backend/API | Spring Boot 4.1 + Java 17 | JWT/RBAC, OTP, pricing, orders, payment verification, notifications, reports |
| Database | PostgreSQL 17 + Flyway | Complete schema, indexes, catalog seed and delivery tracking |
| Local email inbox | Mailpit | Email OTP को बिना real inbox के test करना |

Docker images आपके Docker Hub ID के हिसाब से named हैं:

- `vidya687/desi-aahhar-api:local`
- `vidya687/desi-aahhar-admin:local`

## सबसे आसान local start

Requirements: Docker Desktop running हो। फिर PowerShell में repository खोलें:

```powershell
cd "C:\Users\Asus\Documents\ChatGPT\देसी Aahhar"
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Open:

- Admin panel: <http://localhost:5173>
- Backend health: <http://localhost:8080/actuator/health>
- Local email inbox: <http://localhost:8025>

Default local accounts (`.env` में बदल सकते हैं):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@desiaahhar.in` | `Admin@123` |
| Delivery staff | `delivery@desiaahhar.in` | `Delivery@123` |

Phone OTP local mode में `123456` है। Email OTP random होगा और Mailpit inbox में दिखाई देगा।

Stop करने के लिए:

```powershell
docker compose down
```

Database data बचा रहता है। केवल local test database और uploads भी हटाने हों तो ही `docker compose down -v` चलाएँ।

## VS Code में खोलना

```powershell
cd "C:\Users\Asus\Documents\ChatGPT\देसी Aahhar"
code .
```

अगर `code` command available नहीं है, VS Code खोलकर **File → Open Folder** और यही folder select करें।

## Physical Android phone पर customer app

1. Phone और computer को same Wi-Fi पर रखें।
2. `ipconfig` चलाकर computer का IPv4 address देखें, उदाहरण `192.168.1.20`।
3. `customer-app/.env.local` बनाएँ:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8080/api/v1
EXPO_PUBLIC_USE_MOCK_API=false
```

4. Native Razorpay और push module के कारण development/preview build बनाएँ:

```powershell
cd customer-app
pnpm install
npx eas-cli@latest build --profile preview --platform android
```

Generated APK phone में install करें। Local bundler के साथ development client चलाना हो तो:

```powershell
npx expo start --dev-client
```

Android emulator पर API URL `http://10.0.2.2:8080/api/v1` रहेगा। Real phone पर `localhost` या `10.0.2.2` नहीं, computer का LAN IP इस्तेमाल करें। Windows Firewall में port `8080` allow होना चाहिए।

## Physical Android phone पर delivery app

`delivery-app/.env.local`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8080/api/v1
```

फिर:

```powershell
cd delivery-app
pnpm install
npx eas-cli@latest init
npx eas-cli@latest build --profile preview --platform android
```

Delivery app एक अलग Expo project है; customer app का project ID reuse न करें। Login के लिए default staff account ऊपर दिया है।

## Real integrations activate करना

Code और API contracts ready हैं, लेकिन secret keys repository में जानबूझकर नहीं रखी गई हैं। `.env` में credentials भरने के बाद backend automatically real provider use करता है।

### Real SMS OTP — Twilio Verify

```dotenv
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
EXPOSE_DEV_OTP=false
```

### Real email OTP — SMTP

```dotenv
SMTP_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=...
SMTP_PASSWORD=...
SMTP_AUTH=true
SMTP_STARTTLS=true
SMTP_FROM=no-reply@your-domain.com
```

Production email OTP cryptographically random है, hash के रूप में database में store होता है, 10 minutes में expire होता है और attempts/rate limits लागू हैं।

### Real Razorpay

```dotenv
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Webhook URL: `https://YOUR_API_DOMAIN/api/v1/payments/webhook`. Signature backend पर verify होती है; mobile app में key secret कभी नहीं जाता। Local keys खाली होने पर safe development payment flow चलता है। Cancelled online checkout cart और stock को restore करता है।

### Firebase push notifications

1. Firebase project में Android apps बनाएँ:
   - Customer: `com.vid876.desiaahhar`
   - Delivery: `com.vid876.desiaahhar.delivery`
2. सही `google-services.json` संबंधित mobile folder में रखें। Files Git में ignore हैं।
3. Firebase service-account JSON को `secrets/firebase-service-account.json` रखें।
4. `.env` में `FIREBASE_PROJECT_ID` भरें और backend overlay के साथ start करें:

```powershell
docker compose -f docker-compose.yml -f docker-compose.firebase.yml up --build -d
```

5. Mobile apps को दोबारा EAS build करें। Customer और delivery apps native FCM token backend में register करते हैं; order/payment/status changes push और in-app notifications create करते हैं।

## Useful checks

```powershell
# Backend
cd backend
mvn test

# Admin
cd ..\admin-web
pnpm install
pnpm build

# Customer
cd ..\customer-app
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run test:rules

# Delivery
cd ..\delivery-app
pnpm install
pnpm run typecheck
pnpm run lint
```

## Repository structure

```text
admin-web/                    React admin panel
backend/                      Spring Boot REST API + Flyway migrations
customer-app/                 Customer Expo/React Native app
delivery-app/                 Staff/delivery Expo/React Native app
docker-compose.yml            PostgreSQL, Mailpit, backend and admin
docker-compose.firebase.yml   Firebase service-account overlay
.env.example                  Local and real integration configuration
```

GitHub: <https://github.com/Vid876/Desi-Aahhar>
