# UberClone

Ride-hailing mobile app built with Expo (React Native) as an academic project for the Mobile Development course at Tecnológico de Antioquia.

**Professor:** Paula Andrea Muñoz Correa

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 56 + Expo Router |
| Language | TypeScript |
| State | Redux Toolkit |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Maps | react-native-maps (Google Maps SDK) |
| Payments | Stripe + MercadoPago |
| i18n | react-i18next (ES / EN) |

---

## Prerequisites

- Node.js 18+
- npm 10+
- Expo Go app on your device (iOS or Android)
- A Firebase project (see **Environment Setup** below)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd UberClone
npm install
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

> **Note:** Variables prefixed with `EXPO_PUBLIC_` are bundled into the client. Never store server-side secrets with this prefix.

### 3. Firebase project setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2. Enable **Authentication** → Email/Password sign-in method.
3. Enable **Firestore Database** in production mode.
4. Register a Web app and copy the config values into `.env`.

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

---

## Project Structure

```
src/
├── app/                  # Expo Router screens (file-based routing)
│   ├── (auth)/           # Auth stack: login, register
│   ├── (tabs)/           # Tab navigator: home, profile
│   └── _layout.tsx       # Root layout (Redux Provider + i18n)
├── components/           # Reusable UI components
├── constants/            # Theme colors, spacing, fonts
├── hooks/                # Custom React hooks
├── i18n/                 # Translations (en / es)
├── navigation/           # Navigation type definitions
├── screens/              # Screen-level components (used by app/)
├── services/             # Firebase, API clients
├── store/                # Redux store + slice reducers
└── utils/                # Shared utility functions
```

---

## Code Quality

```bash
# Check lint
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

Code style follows the **Airbnb JavaScript Style Guide**.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, reviewed code only |
| `phases/phase-1-*` | Phase 1 setup and auth |
| `feature/phase-2-*` | Maps and ride booking |
| `feature/phase-3-*` | Payments |

Merges to `main` require professor review.

---

## Development Phases

- [x] **Phase 1.1** — Project setup, folder structure, Redux, Firebase, i18n
- [ ] **Phase 1.2** — Authentication (register, login, logout)
- [ ] **Phase 1.3** — Profile screen
- [ ] **Phase 2** — Maps, Google Places, ride booking
- [ ] **Phase 3** — Payments (Stripe + MercadoPago)
