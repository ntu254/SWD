# Mobile App - FDM Structure

This project follows the **Feature Driven Modular (FDM) + FSD-lite** architectural pattern, similar to the frontend project.

## 🛠️ Tech Stack ("The Destructive Combo")

We use a modern, performance-oriented stack to ensure rapid development and high-quality UI/UX:

| Category | Technology | Description |
|----------|------------|-------------|
| **Core** | React Native + Expo | Cross-platform mobile framework (Managed Workflow) |
| **Logic** | TypeScript | Strictly typed for safety and intelligence |
| **Styling** | **NativeWind (TailwindCSS)** | Utility-first styling, standardizing UI development |
| **State** | **Zustand** | Minimalist, fast, scalable state management |
| **Server State** | **TanStack Query** | Powerful asynchronous state management for API data |
| **Network** | **Axios** | Promise-based HTTP client |
| **Forms** | **React Hook Form** + **Zod** | Performant forms with schema-based validation |
| **Icons** | **Lucide React Native** | Beautiful, consistent icon set (Replaces @expo/vector-icons) |
| **Utilities** | clsx, tailwind-merge | Conditional class merging for NativeWind |

## 📁 Directory Structure

```
mobile/
├── src/
│   ├── app/              # Expo Router pages (Presentation Layer)
│   ├── features/         # Business logic modules (Domain Layer - Auth, User, etc.)
│   ├── entities/         # Business entities (Domain Layer - Interfaces, Models)
│   ├── navigation/       # Navigation configuration
│   ├── shared/           # Reusable code (Shared Layer)
│   │   ├── components/   # UI Components (Buttons, Inputs, Cards)
│   │   ├── hooks/        # Custom Hooks
│   │   ├── constants/    # Constants & Theme
│   │   └── utils.ts      # Utilities (cn, helpers)
│   └── assets/           # Images & Fonts
├── tsconfig.json         # Configured with @/* -> ./src/*
├── tailwind.config.js    # Tailwind configuration
├── app.json
└── ...
```

## 🚀 Get Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the app**

   ```bash
   npx expo start -c
   ```
   > Note: Use `-c` to clear cache if Tailwind classes are not applying correctly.

## 📝 Development Guide

### Styling with NativeWind
We use `className` instead of `style` objects.
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-gray-800">Hello World</Text>
</View>
```

### Path Aliases
Use `@/` to import from `src`.
- `import { Button } from '@/shared/components/ui/button'`
- `import { useAuth } from '@/features/auth'`

### Icons
Use **Lucide Icons** instead of Ionicons/Expo Icons.
```tsx
import { Mail } from 'lucide-react-native';
<Mail size={24} color="#000" />
```
