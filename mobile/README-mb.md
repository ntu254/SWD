# GreenLoop Mobile App

React Native mobile application for the GreenLoop waste management platform.

## 🚀 Tech Stack

- **Framework:** Expo SDK 54 + React Native 0.81
- **Language:** TypeScript 5.9
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation v7 (Stack + Bottom Tabs)
- **State Management:** Zustand 5.0
- **Data Fetching:** TanStack Query (React Query) 5.0 + Axios
- **Forms:** React Hook Form + Zod validation
- **Maps:** React Native Maps
- **Icons:** Lucide React Native
- **Animations:** React Native Reanimated
- **Storage:** AsyncStorage

## 📁 Project Structure (FDM + FSD lite)

```
mobile/
├── src/
│   ├── app/                    # Application layer
│   │   ├── App.tsx            # Root component
│   │   ├── navigation/        # Navigation setup
│   │   └── providers/         # Context providers
│   │
│   ├── features/              # Feature modules (FDM)
│   │   ├── auth/              # Authentication
│   │   ├── home/              # Dashboard
│   │   ├── map/               # Map & locations
│   │   └── profile/           # User profile
│   │
│   ├── shared/                # Shared resources
│   │   ├── ui/                # Reusable components
│   │   ├── api/               # API client
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # Utils, helpers
│   │   └── config/            # Constants, theme
│   │
│   └── assets/                # Static files
│
├── App.tsx                    # Entry point
├── tailwind.config.js         # Tailwind configuration
├── babel.config.js            # Babel with NativeWind
├── metro.config.js            # Metro bundler config
└── package.json
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS only)
- Android: Android Studio + Java 17

### Installation

```bash
cd mobile
npm install
```

### Google Maps API Key (Android Only)

1. Get API key from [Google Cloud Console](https://console.cloud.google.com)
2. Enable **Maps SDK for Android**
3. Update `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "YOUR_ACTUAL_API_KEY"
       }
     }
   }
   ```

iOS uses Apple Maps (no key required).

### Running the App

#### Development (Expo Go)

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

#### Production Build

iOS:
```bash
npx expo run:ios
```

Android:
```bash
npx expo run:android
```

## 🎨 Design System

The app follows the GreenLoop UI Template design tokens:

- **Fonts:** Fredoka (display), Nunito (sans)
- **Primary:** Emerald/Green (`brand-600`: #059669)
- **Accent:** Amber/Orange (`accent-500`: #f59e0b)
- **Shapes:** Rounded-xl (12px), Rounded-2xl (16px)
- **Shadows:** Brand-colored shadows for depth

See `src/shared/config/theme.ts` for full token definitions.

## 📦 Key Components

### Shared UI
- `<Button>` - Variants: primary, secondary, ghost
- `<Input>` - With icon support and validation
- `<Card>` - Solid and glass variants

### Features
- **Auth:** Login/Register with role-based access
- **Map:** React Native Maps with custom markers
- **Home:** Dashboard (placeholder)
- **Profile:** User profile (placeholder)

## 🗺️ Map Integration

The app uses React Native Maps with:
- Custom marker colors by type (collection point, bin, enterprise)
- User location tracking
- Mock data for development (`src/features/map/model/useLocations.ts`)

To use real data, update the API endpoint in `useLocations.ts`.

## 🔐 Authentication

Auth state is managed with Zustand (`src/shared/store/authStore.ts`):
- Token persistence with AsyncStorage
- Automatic navigation based on auth state
- API client interceptors for auth headers

## 🌐 API Configuration

Update API base URL in `src/shared/api/client.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080'      // Local dev
  : 'https://api.youready.net';  // Production
```

## 📱 Build & Deploy

### EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

### TestFlight / Play Store Beta

Follow Expo's [deployment guide](https://docs.expo.dev/submit/introduction/).

## 🧪 Testing

TypeScript check:
```bash
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Metro bundler errors
```bash
npx expo start --clear
```

### iOS build issues
```bash
cd ios && pod install && cd ..
```

### Android gradlew permissions
```bash
cd android && chmod +x gradlew && cd ..
```

## 📝 Implementation Status

### ✅ Completed
- [x] Project setup with Expo SDK 54
- [x] TypeScript configuration (strict mode)
- [x] Navigation structure (React Navigation)
- [x] Auth screens (Login & Register)
- [x] Form validation (React Hook Form + Zod)
- [x] UI component library (Button, Input, Card)
- [x] API client setup with interceptors
- [x] Auth state management (Zustand)
- [x] Map component (GreenLoopMap with React Native Maps)

### 🚧 TODO (See CODE_REVIEW.md for details)
1. **Home Screen** - Dashboard with statistics and quick actions
2. **Map Screen** - Integrate GreenLoopMap with location API
3. **Profile Screen** - User settings and profile management
4. **Backend Integration** - Connect all APIs to real backend
5. **Image Upload** - For reports and profile pictures
6. **Push Notifications** - User engagement features
7. **Testing** - Unit and integration tests

## 📄 Additional Documentation

- **CODE_REVIEW.md** - Comprehensive code review and development checklist
- **README-mb.md** - This file (setup and overview)

## 📄 License

Part of the GreenLoop SWD392 project.

