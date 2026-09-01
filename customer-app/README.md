# Customer mobile app

Expo SDK 57 / React Native customer application. It includes phone OTP with email fallback, live catalog, per-category minimum validation, cart, coupons, COD, Razorpay checkout, orders and FCM device registration.

```powershell
pnpm install
```

For backend-connected mode create `.env.local`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080/api/v1
EXPO_PUBLIC_USE_MOCK_API=false
```

Use `10.0.2.2` instead of a LAN IP for the Android emulator. The Razorpay module needs an EAS development or preview build:

```powershell
npx eas-cli@latest build --profile preview --platform android
npx expo start --dev-client
```

Checks:

```powershell
pnpm run typecheck
pnpm run lint
pnpm run test:rules
```

Firebase setup and full-system startup are documented in the repository root README.
