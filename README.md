# SWD - Feature-Based Project

Project này sử dụng **Feature-Based Architecture** cho cả Backend và Frontend.

## Cấu Trúc Thư Mục

```
SWD/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── features/       # Feature modules (auth, user, product, etc.)
│   │   ├── shared/         # Shared types, utilities, helpers
│   │   ├── config/         # Configuration files
│   │   └── index.ts        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── frontend/                # React + Vite + TypeScript
    ├── src/
    │   ├── features/       # Feature modules (auth, user, product, etc.)
    │   ├── shared/         # Shared components, hooks, services, utils
    │   ├── types/          # Global type definitions
    │   ├── App.tsx         # Main component
    │   └── main.tsx        # Entry point
    ├── public/             # Static assets
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── README.md
```

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (configurable)
- **Package Manager**: npm

### Frontend

- **Library**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Package Manager**: npm

## Cách Bắt Đầu

### Backend

```bash
cd backend
npm install
npm run dev
```

Server sẽ chạy trên `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App sẽ chạy trên `http://localhost:3001`

## Feature-Based Architecture

### Cấu trúc Feature cho Backend

```
features/[featureName]/
├── controllers/
├── services/
├── routes/
├── models/
├── dtos/
├── types.ts
└── index.ts
```

Ví dụ: Feature `auth`

```
features/auth/
├── controllers/authController.ts
├── services/authService.ts
├── routes/authRoutes.ts
├── models/AuthUser.ts
├── dtos/loginDTO.ts
├── types.ts
└── index.ts
```

### Cấu trúc Feature cho Frontend

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

Ví dụ: Feature `auth`

```
features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── services/
│   └── authService.ts
├── hooks/
│   └── useAuth.ts
├── types.ts
└── index.tsx
```

## Scripts Hữu Ích

### Backend

```bash
npm run dev       # Development mode
npm run build     # Build TypeScript
npm start         # Production mode
npm run lint      # ESLint check
npm run format    # Format code with Prettier
```

### Frontend

```bash
npm run dev       # Development mode
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Format code with Prettier
```

## Cấu Hình Môi Trường

### Backend

Copy `.env.example` thành `.env` và điền thông tin:

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=swd_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_jwt_secret_key_here
```

### Frontend

Copy `.env.example` thành `.env` và điền thông tin:

```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=SWD Application
```

## Hướng Dẫn Thêm Feature Mới

1. Tạo folder mới trong `features/[featureName]`
2. Tạo cấu trúc con theo template ở trên
3. Implement logic của feature
4. Export từ `index.ts` hoặc `index.tsx`
5. Import vào routing chính

## Quy Tắc Đặt Tên

- **Files**: camelCase (authService.ts, loginForm.tsx)
- **Folders**: camelCase (features/auth)
- **Components**: PascalCase (LoginForm.tsx)
- **Functions**: camelCase (getUserById)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)

## Linting & Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

## Database Setup (Backend)

Tạo PostgreSQL database:

```sql
CREATE DATABASE swd_db;
```

Sau đó cấu hình `.env` file với thông tin kết nối.

## Troubleshooting

### Port đã bị sử dụng

- Backend: Thay đổi PORT trong `.env`
- Frontend: Thay đổi port trong `vite.config.ts`

### Module không tìm thấy

Đảm bảo `tsconfig.json` và `vite.config.ts` có cấu hình path aliases đúng.

---

**Happy Coding!** 🚀
