# SWD Frontend

Frontend được xây dựng với React, Vite, và TypeScript. Sử dụng Feature-Based Architecture.

## Cấu Trúc Dự Án

```
frontend/
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/         # Authentication feature
│   │   ├── user/         # User management feature
│   │   └── product/      # Product management feature
│   ├── shared/           # Shared code
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── types/            # Global types
│   ├── App.tsx           # Main component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Thêm Feature Mới

Mỗi feature cần có cấu trúc:

```
features/[featureName]/
├── components/
│   ├── index.tsx
│   └── [ComponentName].tsx
├── pages/
│   └── [PageName].tsx
├── services/
│   └── [FeatureName]Service.ts
├── hooks/
│   └── use[FeatureName].ts
├── types.ts
└── index.tsx
```
