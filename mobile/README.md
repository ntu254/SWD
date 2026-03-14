# EcoCollect Mobile Application

Mobile application for the EcoCollect waste collection and reward system.

## Project Structure

```
mobile/
├── app/                    # Application routes and pages
│   ├── (admin)/           # Admin routes
│   ├── (citizen)/         # Citizen routes
│   ├── (collector)/       # Collector routes
│   └── (enterprise)/      # Enterprise routes
├── components/            # Reusable components
│   ├── Citizen/          # Citizen-specific components
│   ├── constants/        # Constants and configurations
│   ├── data/             # Mock data
│   ├── store/            # State management
│   └── types/            # Type definitions
├── assets/               # Static assets
│   └── images/          # Image files
└── package.json         # Dependencies
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Run on specific platform:
   ```bash
   npm run android    # Android
   npm run ios       # iOS
   npm run web       # Web
   ```
