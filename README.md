# UberClone

Ride-hailing mobile app built with Expo (React Native) as an academic project for the Mobile Development course at Tecnológico de Antioquia.

**Professor:** Paula Andrea Muñoz Correa

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 56 + Expo Router |
| Language | TypeScript (strict) |
| State | Redux Toolkit |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Storage | Firebase Storage |
| Maps | react-native-maps (Google Maps SDK) |
| Payments | Stripe + MercadoPago |
| i18n | react-i18next (ES / EN) |
| Animations | react-native-reanimated 4.x |

---

## Prerequisites

- Node.js 18+
- npm 10+
- Expo Go app on your device (iOS or Android)
- A Firebase project (see **Environment Setup** below)
- Google Cloud project with Maps, Places, Directions and Distance Matrix APIs enabled

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd UberClone
npm install --legacy-peer-deps
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your real keys:

```bash
cp .env.example .env
```

Required variables:

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Same as above |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Same as above |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Same as above |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Same as above |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Same as above |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → APIs & Services |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Cloud Console → APIs & Services |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `EXPO_PUBLIC_STRIPE_BACKEND_URL` | Your backend that creates PaymentIntents |
| `EXPO_PUBLIC_MERCADOPAGO_BACKEND_URL` | Your backend that creates MercadoPago preferences |

> **Note:** Variables prefixed with `EXPO_PUBLIC_` are bundled into the client. Never store server-side secrets with this prefix.

### 3. Firebase project setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2. Enable **Authentication** → Email/Password sign-in method.
3. Enable **Firestore Database** in production mode.
4. Enable **Firebase Storage** for profile photos.
5. Register a Web app and copy the config values into `.env`.

### 4. Run the app

```bash
# Start the dev server
npm start

# Open on Android
npm run android

# Open on iOS
npm run ios
```

Scan the QR code with the **Expo Go** app on your device.

> **Note:** Stripe payments require a custom development build (`expo prebuild`). They will not work in Expo Go.

---

## Project Structure

```
src/
├── app/                  # Expo Router screens (file-based routing)
│   ├── (auth)/           # Auth stack: login, register
│   ├── (tabs)/           # Tab navigator: home, profile
│   ├── payment.tsx       # Payment screen (Stripe + MercadoPago)
│   └── _layout.tsx       # Root layout (Redux Provider + i18n + StripeProvider)
├── components/           # Reusable UI components
│   ├── map/              # Map-related: SearchSheet, VehicleSelector, markers
│   └── TripCard.tsx      # Trip history card
├── contexts/             # React Context providers (AuthContext)
├── hooks/                # Custom React hooks
├── i18n/                 # Translations (en / es)
├── screens/              # Screen-level components (used by app/)
│   └── profile/          # PersonalDataTab, SecurityTab, TripsTab
├── services/             # Firebase, Google APIs, Stripe, MercadoPago
├── store/                # Redux store + slice reducers (tripSlice, authSlice, profileSlice)
└── utils/                # Shared utilities (fareCalculation, validation, logger)
```

---

## React Hooks Used

This project demonstrates all 8 core React hooks:

| Hook | Where used | Purpose |
|---|---|---|
| `useState` | All screens | Local component state (form fields, loading, errors) |
| `useEffect` | `index.tsx`, `TripsTab`, profile screen | Side effects: location updates, map animations, data fetching |
| `useContext` | `AuthContext.tsx` | Provides and consumes the Firebase Auth session context |
| `useReducer` | `PersonalDataTab.tsx` | Complex form state machine with typed actions |
| `useCallback` | `SearchSheet`, `TripsTab`, map hooks | Stable references for event handlers passed to child components |
| `useMemo` | `index.tsx`, `SearchSheet` | Derived values: FAB position, driver status labels, list data |
| `useRef` | `index.tsx` (MapView), `PersonalDataTab` (TextInput focus chain) | Imperative handles and stable mutable values |
| `useLayoutEffect` | `SearchSheet.tsx`, `PersonalDataTab.tsx` | Synchronous DOM measurements before paint (sheet height, form init) |

---

## Fare Calculation

Fares are calculated in COP (Colombian Pesos):

```
base = distanceKm × 1,500 + durationMin × 200
fare = base × vehicleMultiplier
```

| Vehicle | Multiplier |
|---|---|
| Economy | 1.0× |
| XL | 1.5× |
| Premium | 2.5× |

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, reviewed code only |
| `phases/phase-1-*` | Phase 1 setup and auth |
| `phases/phase-2` | Maps, Places search, destination |
| `phases/phase-3` | Route rendering and fare estimation |
| `phases/phase-4` | Payments, driver simulation |
| `phases/phase-5` | Trip history, i18n, quality pass |

---

## Development Phases

- [x] **Phase 1.1** — Project setup, folder structure, Redux, Firebase, i18n
- [x] **Phase 1.2** — Authentication (register, login, logout)
- [x] **Phase 1.3** — Profile screen (personal data, security, avatar upload)
- [x] **Phase 2.1** — Maps with Google Maps SDK, user location
- [x] **Phase 2.2** — Google Places autocomplete destination search
- [x] **Phase 2.3** — Vehicle selector (Economy / XL / Premium)
- [x] **Phase 3.1** — Directions API and route polyline rendering
- [x] **Phase 3.2** — Distance Matrix API (distance and duration display)
- [x] **Phase 3.3** — Fare estimation and request ride button
- [x] **Phase 4.1** — Driver simulation (finding → en route → arrived)
- [x] **Phase 4.2** — Stripe payment sheet integration
- [x] **Phase 4.3** — MercadoPago checkout via web browser
- [x] **Phase 4.4** — Trip persistence to Firestore on payment success
- [x] **Phase 5.1** — Trip history screen from Firestore
- [x] **Phase 5.2** — Full i18n pass (ES/EN across all screens)
- [x] **Phase 5.3** — Quality checklist (hooks, types, logger, README)
