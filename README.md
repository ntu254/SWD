# SWD - Feature-Based Project

Project này sử dụng **Feature-Based Architecture** cho cả Backend và Frontend.

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
    ├── src/
    │   ├── features/                 # Feature modules
    │   │   └── auth/
    │   │       ├── components/
    │   │       ├── hooks/
    │   │       ├── pages/
    │   │       ├── services/
    │   │       ├── types.ts
    │   │       └── index.ts
    │   ├── shared/                   # Shared components, hooks, services
    │   ├── types/                    # Global type definitions
    │   ├── App.tsx
    │   └── main.tsx
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

## 🛠️ Tech Stack

### Backend

| Technology      | Version | Description                    |
| --------------- | ------- | ------------------------------ |
| Java            | 17      | Programming Language           |
| Spring Boot     | 3.5.0   | Framework                      |
| Spring Security | -       | Authentication & Authorization |
| Spring Data JPA | -       | Database ORM                   |
| Maven           | -       | Build Tool                     |

### Frontend

| Technology   | Version | Description          |
| ------------ | ------- | -------------------- |
| React        | 18.2.0  | UI Library           |
| Vite         | 5.0.8   | Build Tool           |
| TypeScript   | 5.3.3   | Programming Language |
| React Router | 6.20.0  | Routing              |
| Axios        | 1.6.2   | HTTP Client          |

## 🚀 Cách Bắt Đầu

### Prerequisites

- **Java 17+** (recommend: Eclipse Adoptium)
- **Maven 3.8+**
- **Node.js 18+**
- **npm 9+**

### Backend

```bash
cd backend

# Set environment variables (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"
$env:MAVEN_HOME = "$env:USERPROFILE\tools\maven"
$env:Path = "$env:JAVA_HOME\bin;$env:MAVEN_HOME\bin;$env:Path"

# Run application
mvn spring-boot:run -Dspring-boot.run.profiles=dev -DskipTests
```

Server sẽ chạy trên `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App sẽ chạy trên `http://localhost:5173`

## 📐 Feature-Based Architecture

### Cấu trúc Feature cho Backend (Spring Boot)

```
features/[featureName]/
├── controller/          # REST Controllers
├── service/             # Business Logic
├── repository/          # Data Access Layer
├── entity/              # JPA Entities
└── dto/                 # Data Transfer Objects
```

Ví dụ: Feature `auth`

```
features/auth/
├── controller/
│   └── AuthController.java
├── service/
│   ├── AuthService.java
│   └── AuthServiceImpl.java
├── repository/
│   └── UserRepository.java
├── entity/
│   └── User.java
└── dto/
    ├── LoginRequest.java
    ├── RegisterRequest.java
    └── AuthResponse.java
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

## 📜 Scripts Hữu Ích

### Backend (Maven)

```bash
mvn spring-boot:run                              # Chạy ứng dụng
mvn spring-boot:run -Dspring-boot.run.profiles=dev  # Chạy với profile dev
mvn clean install                                # Build project
mvn clean install -DskipTests                    # Build bỏ qua tests
mvn test                                         # Chạy tests
```

### Frontend (npm)

```bash
npm run dev       # Development mode
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Format code with Prettier
```

## ⚙️ Cấu Hình Môi Trường

### Backend (application.properties / application-dev.properties)

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

```
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=SWD Application
```

## ➕ Hướng Dẫn Thêm Feature Mới

### Backend

1. Tạo folder mới trong `features/[featureName]/`
2. Tạo các sub-folder: `controller`, `service`, `repository`, `entity`, `dto`
3. Implement Entity → Repository → Service → Controller
4. Thêm endpoint vào Security config nếu cần

### Frontend

1. Tạo folder mới trong `features/[featureName]/`
2. Tạo các sub-folder: `components`, `pages`, `hooks`, `services`
3. Implement logic của feature
4. Export từ `index.ts`
5. Import vào routing chính

## 📝 Quy Tắc Đặt Tên

### Backend (Java)

- **Classes**: PascalCase (`AuthController`, `UserService`)
- **Methods**: camelCase (`getUserById`, `createUser`)
- **Variables**: camelCase (`userName`, `isActive`)
- **Constants**: UPPER_SNAKE_CASE (`JWT_SECRET`, `MAX_RETRY`)
- **Packages**: lowercase (`com.example.backendservice.features.auth`)

### Frontend (TypeScript/React)

- **Files**: camelCase (`authService.ts`) hoặc PascalCase cho components (`LoginForm.tsx`)
- **Components**: PascalCase (`LoginForm`, `UserProfile`)
- **Hooks**: camelCase với prefix `use` (`useAuth`, `useUser`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

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
- **Frontend**: Thay đổi port trong `vite.config.ts`

### Maven build failed

```bash
mvn clean install -U  # Force update dependencies
```

### CORS issues

Đảm bảo đã cấu hình CORS trong `security/config/CorsConfig.java`

---

## 👥 Team

- **Backend**: Spring Boot + Java
- **Frontend**: React + TypeScript + Vite

---

**Happy Coding!** 🚀
