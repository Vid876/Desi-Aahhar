# देसी Aahhar

This repository contains the React Native customer app for the grocery/Kirana platform described in the supplied architecture blueprint.

## Project layout

```text
customer-app/              Expo + React Native customer application
  assets/brand/            Supplied logo and generated grocery hero
  src/app/                 Expo Router screens and navigation
  src/components/          Reusable branded UI components
  src/context/             Persistent cart, account and order state
  src/data/                Demo catalog, categories and coupons
  src/domain/              ₹500 rule engine and tests
  src/services/            Spring Boot API client configuration
  docs/API_INTEGRATION.md  Mobile/backend integration contract
```

Start with [customer-app/README.md](customer-app/README.md).

The customer app is implemented and runnable in mock mode. The architecture's Spring Boot API, web admin panel and separate delivery/staff app are separate deployables and are not bundled into this React Native customer application.
