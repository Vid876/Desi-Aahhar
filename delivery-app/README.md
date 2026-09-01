# Delivery/staff mobile app

Expo SDK 57 app for staff login, assigned orders, status transitions, foreground delivery location, proof capture/upload and push notifications.

Create `.env.local`:

```dotenv
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_LAN_IP:8080/api/v1
```

Then:

```powershell
pnpm install
npx eas-cli@latest init
npx eas-cli@latest build --profile preview --platform android
```

Default local staff login is `delivery@desiaahhar.in` / `Delivery@123`. This app needs its own Expo/EAS project ID.
