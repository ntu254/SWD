# SWD - Feature-Driven Modular Project

Project này sử dụng **Feature-Driven Modular Architecture** cho cả Backend và Frontend.

## 📁 Cấu Trúc Thư Mục

```
SWD/
├── backend/                          # Spring Boot + Java 17
│   ├── src/main/java/com/example/backendservice/
│   │   ├── BackendServiceApplication.java
│   │   ├── config/                   # Cấu hình chung (DB, CORS, etc.)
│   │   ├── common/
│   │   │   ├── constants/            # Hằng số chung
│   │   │   ├── dto/                  # DTO dùng chung (ApiResponse, etc.)
│   │   │   ├── exception/            # Exception handler, custom exceptions
│   │   │   └── utils/                # Utility classes
│   │   ├── security/
│   │   │   ├── config/               # Security configuration
│   │   │   ├── jwt/                  # JWT token provider, filter
│   │   │   └── service/              # UserDetailsService, etc.
│   │   └── features/
│   │       ├── auth/                 # Feature: Authentication
│   │       │   ├── controller/
│   │       │   ├── service/
│   │       │   ├── repository/
│   │       │   ├── dto/
│   │       │   └── entity/
│   │       └── user/                 # Feature: User management
│   │           ├── controller/
│   │           ├── service/
│   │           ├── repository/
│   │           ├── dto/
│   │           └── entity/
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/                         # React + Vite + TypeScript
    ├── public/
    │   └── assets/                   # Static assets (images, fonts, etc.)
    ├── src/
    │   ├── features/                 # Feature modules
    │   │   └── auth/
    │   │       ├── components/       # Feature-specific components
    │   │       ├── hooks/            # Feature-specific hooks
    │   │       ├── pages/            # Feature pages
    │   │       ├── services/         # Feature API services
    │   │       ├── types/            # Feature type definitions
    │   │       └── index.ts          # Barrel export
    │   ├── shared/                   # Shared resources
    │   │   ├── components/           # Shared UI components
    │   │   ├── hooks/                # Shared custom hooks
    │   │   ├── services/             # Shared API services
    │   │   └── utils/                # Utility functions
    │   ├── types/                    # Global type definitions
    │   ├── App.tsx
    │   ├── App.css
    │   ├── main.tsx
    │   └── index.css
    ├── .env.example                  # Environment variables template
    ├── .eslintrc.json                # ESLint configuration
    ├── .gitignore                    # Git ignore rules
    ├── .prettierrc                   # Prettier configuration
    ├── index.html                    # Entry HTML
    ├── package.json
    ├── tsconfig.json                 # TypeScript config (app)
    ├── tsconfig.node.json            # TypeScript config (node/vite)
    └── vite.config.ts                # Vite configuration

└── mobile/                           # React Native + Expo (FDM + FSD-lite)
    ├── src/
    │   ├── app/                      # Expo Router pages
    │   ├── features/                 # Business logic modules
    │   ├── entities/                 # Business entities
    │   ├── navigation/               # Navigation configuration
    │   └── shared/                   # Shared resources
    ├── app.json
    └── tsconfig.json

## 🛠️ Tech Stack

### Backend

| Technology      | Version | Description                    |
| --------------- | ------- | ------------------------------ |
| Java            | 17+     | Programming Language           |
| Spring Boot     | 3.5.0   | Framework                      |
| Spring Security | -       | Authentication & Authorization |
| Spring Data JPA | -       | Database ORM                   |
| Maven           | 3.8+    | Build Tool                     |

### Frontend

| Technology   | Version | Description          |
| ------------ | ------- | -------------------- |
| React        | 18.2.0  | UI Library           |
| Vite         | 5.0.8   | Build Tool           |
| TypeScript   | 5.3.3   | Programming Language |
| React Router | 6.20.0  | Routing              |
| Axios        | 1.6.2   | HTTP Client          |
| ESLint       | 8.56.0  | Linting              |
| Prettier     | 3.1.1   | Code Formatting      |

### Mobile

| Technology   | Version | Description          |
| ------------ | ------- | -------------------- |
| React Native | 0.73+   | Mobile Framework     |
| Expo         | 50+     | Platform             |
| NativeWind   | 4.0+    | Styling (TailwindCSS)|
| Zustand      | 4.x     | State Management     |
| TanStack Query| 5.x    | Data Fetching        |
| Expo Router  | 3.x     | File-based routing   |
| TypeScript   | 5.x     | Programming Language |

## 🚀 Cách Bắt Đầu

### Prerequisites

- **Java 17+** (recommend: Eclipse Adoptium)
- **Maven 3.8+**
- **Node.js 18+**
- **npm 9+**

### Backend

```bash
cd backend

# Run application
mvn spring-boot:run

# Run with dev profile
mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests
```

Server sẽ chạy trên `http://localhost:8080`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

App sẽ chạy trên `http://localhost:3000`

### Mobile

```bash
cd mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

## 📐 Feature-Driven Modular Architecture

### Nguyên tắc chính

1. **Encapsulation**: Mỗi feature chứa tất cả code liên quan
2. **Isolation**: Features độc lập, ít phụ thuộc lẫn nhau
3. **Reusability**: Code dùng chung đặt trong `shared/` hoặc `common/`
4. **Scalability**: Dễ dàng thêm/xóa features

### Cấu trúc Feature cho Backend (Spring Boot)

```
features/[featureName]/
├── controller/          # REST Controllers
├── service/             # Business Logic
├── repository/          # Data Access Layer
├── entity/              # JPA Entities
└── dto/                 # Data Transfer Objects
```

### Cấu trúc Feature cho Frontend (React)

```
features/[featureName]/
├── components/          # Feature-specific components
├── pages/               # Feature pages/views
├── hooks/               # Feature-specific hooks
├── services/            # API calls for this feature
├── types/               # TypeScript types
└── index.ts             # Barrel export
```

### Cấu trúc Mobile (FDM + FSD-lite)

```
src/
├── app/                 # Layers: Pages & Presentation
├── features/            # Layers: Business Features
├── entities/            # Layers: Business Entities
├── navigation/          # Layers: App Navigation
└── shared/              # Layers: Shared Segments
```

## 📜 Scripts

### Backend (Maven)

```bash
mvn spring-boot:run                                 # Chạy ứng dụng
mvn spring-boot:run -Dspring-boot.run.profiles=dev  # Chạy với profile dev
mvn clean install                                   # Build project
mvn clean install -DskipTests                       # Build bỏ qua tests
mvn test                                            # Chạy tests
```

### Frontend (npm)

```bash
npm run dev       # Development mode (localhost:3000)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Format code with Prettier
```

### Mobile (npm/Expo)

```bash
npx expo start    # Start Expo Go
npx expo android  # Run on Android Emulator
npx expo ios      # Run on iOS Simulator
```

## ⚙️ Cấu Hình Môi Trường

### Backend (application.properties)

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/swd_db
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000
```

### Frontend (.env)

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=SWD Application
```

## 🎯 Path Aliases (Frontend)

Đã cấu hình các path aliases trong `tsconfig.json` và `vite.config.ts`:

| Alias           | Path                      |
| --------------- | ------------------------- |
| `@features/*`   | `src/features/*`          |
| `@shared/*`     | `src/shared/*`            |
| `@types/*`      | `src/types/*`             |
| `@hooks/*`      | `src/shared/hooks/*`      |
| `@utils/*`      | `src/shared/utils/*`      |
| `@components/*` | `src/shared/components/*` |
| `@services/*`   | `src/shared/services/*`   |

**Ví dụ sử dụng:**

```typescript
import { useAuth } from "@features/auth";
import { Button } from "@components/Button";
import { formatDate } from "@utils/helpers";
```

## ➕ Hướng Dẫn Thêm Feature Mới

### Backend

1. Tạo folder mới trong `features/[featureName]/`
2. Tạo các sub-folder: `controller`, `service`, `repository`, `entity`, `dto`
3. Implement: Entity → Repository → Service → Controller
4. Cập nhật Security config nếu cần

### Frontend

1. Tạo folder mới trong `src/features/[featureName]/`
2. Tạo các sub-folder: `components`, `pages`, `hooks`, `services`, `types`
3. Tạo file `index.ts` để barrel export
4. Import vào routing chính

### Mobile

1. Tạo feature mới trong `src/features/[featureName]/`
2. Tạo entity mới trong `src/entities/[entityName]/` (nếu cần)
3. Thêm page mới trong `src/app/`
4. Cập nhật `navigation` nếu cần

**Template cho feature mới:**

```bash
# Tạo structure cho feature mới
mkdir -p src/features/[featureName]/{components,pages,hooks,services,types}
touch src/features/[featureName]/index.ts
```

## 📝 Quy Tắc Đặt Tên

### Backend (Java)

| Type      | Convention       | Example                         |
| --------- | ---------------- | ------------------------------- |
| Classes   | PascalCase       | `AuthController`, `UserService` |
| Methods   | camelCase        | `getUserById`, `createUser`     |
| Variables | camelCase        | `userName`, `isActive`          |
| Constants | UPPER_SNAKE_CASE | `JWT_SECRET`, `MAX_RETRY`       |
| Packages  | lowercase        | `com.example.features.auth`     |

### Frontend (TypeScript/React)

| Type       | Convention           | Example                            |
| ---------- | -------------------- | ---------------------------------- |
| Components | PascalCase           | `LoginForm.tsx`, `UserProfile.tsx` |
| Files      | camelCase/PascalCase | `authService.ts`, `LoginPage.tsx`  |
| Hooks      | camelCase + `use`    | `useAuth`, `useUser`               |
| Functions  | camelCase            | `getUserById`, `formatDate`        |
| Constants  | UPPER_SNAKE_CASE     | `API_BASE_URL`                     |

## 🗄️ Database Setup

### PostgreSQL

```sql
CREATE DATABASE swd_db;
CREATE USER swd_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE swd_db TO swd_user;
```

## 🔧 Troubleshooting

### Port đã bị sử dụng

- **Backend**: Thay đổi `server.port` trong `application.properties`
- **Frontend**: Port được cấu hình trong `vite.config.ts` (mặc định: 3000)

### Maven build failed

```bash
mvn clean install -U  # Force update dependencies
```

### npm install failed

```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS issues

Đảm bảo đã cấu hình CORS trong `config/CorsConfig.java` hoặc `SecurityConfig.java`

---

## 👥 Team

- **Backend**: Spring Boot + Java
- **Frontend**: React + TypeScript + Vite
- **Mobile**: React Native + Expo

---

**Happy Coding!** 🚀
