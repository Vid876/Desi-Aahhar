# देसी Aahhar Customer App

Premium React Native grocery shopping app built with Expo SDK 57, React Native 0.86 and Expo Router.

## Included flows

- Mobile OTP login, email OTP fallback and persistent session
- Branded home, category browsing, search and product details
- Product variants, wishlist, quantity and low-stock-ready data model
- Admin-configurable-style ₹500 eligible grocery rule progress
- Fresh category exemption for vegetables, fruits and dairy
- Persistent cart, coupon validation and bill breakdown
- Address selection/creation, delivery slot and COD/online payment UI
- Order confirmation, history, repeat order and tracking timeline
- Notifications, offers, support and profile
- Mock-first service layer plus Spring Boot endpoint handoff

## Run locally

```powershell
cd customer-app
npm install
Copy-Item .env.example .env.local
npm start
```

Press `a` for an Android emulator, `w` for web preview, or scan the QR code with a compatible Expo development client.

## Quality checks

```powershell
npm run check
```

## Backend configuration

The default is local demo mode. Update `.env.local`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1
EXPO_PUBLIC_USE_MOCK_API=false
```

See [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md) for the endpoint and state contracts.

## Builds

The included `eas.json` provides development, preview APK and production profiles. Configure an Expo/EAS account and run `eas build --platform android --profile preview` when signing credentials are ready.
