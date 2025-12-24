# SWD Backend

Backend API được xây dựng với Node.js, Express, và TypeScript. Sử dụng Feature-Based Architecture.

## Cấu Trúc Dự Án

```
backend/
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/         # Authentication feature
│   │   ├── user/         # User management feature
│   │   └── product/      # Product management feature
│   ├── shared/           # Shared code (types, utils, helpers)
│   ├── config/           # Configuration files
│   └── index.ts          # Application entry point
├── dist/                 # Compiled JavaScript
├── package.json
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
npm start
```

## Thêm Feature Mới

Mỗi feature cần có cấu trúc:

```
features/[featureName]/
├── controllers/
├── services/
├── routes/
├── models/
├── dtos/
├── types.ts
└── index.ts
hello
```
