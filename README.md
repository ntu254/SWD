# SWD - Crowdsourced Waste Collection & Recycling Platform

> **Nền tảng kết nối người dân, doanh nghiệp tái chế và dịch vụ thu gom rác theo khu vực**

Project này sử dụng **Feature-Driven Modular Architecture** cho cả Backend và Frontend.

---

## 📖 Tổng Quan Dự Án

### 🎯 Chủ Đề

**Crowdsourced Waste Collection & Recycling Platform** - Nền tảng kết nối người dân, doanh nghiệp tái chế và dịch vụ thu gom rác theo khu vực.

### 🌍 Bối Cảnh

Quản lý rác thải đô thị tại Việt Nam đang đối mặt với nhiều thách thức như:

- **Lịch thu gom không ổn định** - Thiếu tính nhất quán trong việc thu gom rác hàng ngày
- **Tỷ lệ phân loại rác tại nguồn thấp** - Người dân chưa có thói quen phân loại rác đúng cách
- **Sự phối hợp rời rạc** - Thiếu liên kết giữa người dân, đơn vị thu gom và doanh nghiệp tái chế
- **Quy định mới từ năm 2025** - Bắt buộc phân loại rác tại nguồn đòi hỏi giải pháp công nghệ

> **Nhu cầu cấp thiết:** Một nền tảng số hỗ trợ kết nối, điều phối và giám sát toàn bộ quy trình thu gom – tái chế theo khu vực một cách hiệu quả và minh bạch.

### ❗ Vấn Đề Cần Giải Quyết

Hiện chưa có một hệ thống số hóa tập trung cho phép:

- ✅ Người dân **báo cáo rác** và **theo dõi thu gom** theo thời gian thực
- ✅ **Khuyến khích phân loại đúng** thông qua cơ chế điểm thưởng
- ✅ Doanh nghiệp tái chế và cơ quan quản lý **tiếp cận dữ liệu vận hành** theo thời gian thực
- ✅ **Điều phối và phân tích dữ liệu** để tối ưu hóa hiệu quả thu gom

**Hậu quả:** Hiệu quả thu gom thấp, chi phí tăng cao và làm giảm cơ hội phát triển kinh tế tuần hoàn.

---

## 👥 Các Vai Trò Chính

| Vai trò | Mô tả |
|---------|-------|
| **Citizen (Người dân)** | Báo cáo rác, phân loại tại nguồn, nhận điểm thưởng |
| **Recycling Enterprise (Doanh nghiệp tái chế)** | Tiếp nhận, điều phối và quản lý thu gom rác |
| **Collector (Nhân viên thu gom)** | Thực hiện thu gom theo yêu cầu được phân công |
| **Administrator (Quản trị viên)** | Quản lý hệ thống, giám sát hoạt động tổng thể |

---

## ⚙️ Yêu Cầu Chức Năng

### 👤 Citizen (Người dân)

#### Báo cáo và Theo dõi
- **Báo cáo rác/tái chế** cần thu gom với:
  - 📸 Hình ảnh rác thải
  - 📍 Vị trí GPS tự động
  - 📝 Mô tả chi tiết
- **Theo dõi trạng thái** thu gom của từng báo cáo:
  - `Pending` → `Accepted` → `Assigned` → `Collected`
- **Thực hiện phân loại rác tại nguồn** khi tạo báo cáo

#### Điểm thưởng và Khuyến khích
- **Nhận điểm thưởng** khi:
  - Báo cáo hợp lệ được xác nhận
  - Phân loại rác đúng cách
  - Đánh giá tích cực từ Collector
- **Xem lịch sử điểm thưởng** và chi tiết giao dịch
- **Bảng xếp hạng theo khu vực** để tạo động lực cộng đồng
- **Đổi điểm thưởng** lấy phần thưởng

#### Phản hồi
- **Gửi phản hồi hoặc khiếu nại** khi việc thu gom không đúng cam kết

---

### 🏢 Recycling Enterprise (Doanh nghiệp tái chế)

#### Quản lý Năng lực
- **Đăng ký và quản lý năng lực** xử lý rác:
  - 🗑️ Loại rác tiếp nhận
  - ⚡ Công suất xử lý
  - 📍 Khu vực phục vụ

#### Quản lý Yêu cầu
- **Nhận và quyết định** tiếp nhận/từ chối yêu cầu thu gom trong phạm vi hoạt động
- **Xem danh sách yêu cầu** được gợi ý ưu tiên dựa trên tiêu chí cấu hình *(optional)*
- **Gán và điều phối** yêu cầu cho Collector thuộc doanh nghiệp

#### Theo dõi và Báo cáo
- **Theo dõi tiến độ xử lý** và trạng thái thu gom theo thời gian thực
- **Xem báo cáo** khối lượng rác đã thu gom và tái chế:
  - 📊 Theo loại rác
  - 📍 Theo khu vực
  - 📅 Theo thời gian

#### Cấu hình KPI và Điểm thưởng
- **Tạo và cấu hình quy tắc** tính điểm thưởng cho Citizen:
  - Theo loại rác
  - Theo chất lượng báo cáo
  - Theo thời gian xử lý
- **Cấu hình KPI cho Collector:**
  - Số lượng báo cáo tối đa/tối thiểu trong 1 ngày
  - Khối lượng tối thiểu phải thu gom (kg)
  - Cơ chế bonus khi hoàn thành đúng KPI
- **Quản lý khiếu nại** liên quan đến Collector

---

### 🚛 Collector (Nhân viên thu gom)

#### Nhận và Thực hiện Công việc
- **Nhận yêu cầu thu gom** được phân công từ Recycling Enterprise
- **Cập nhật trạng thái** theo thời gian thực:
  - `Assigned` → `On the way` → `Collected`
- **Xác nhận hoàn tất thu gom** với:
  - 📸 Hình ảnh xác nhận
  - ℹ️ Thông tin trạng thái (khối lượng, tình trạng phân loại)

#### Đánh giá và Theo dõi
- **Đánh giá chất lượng phân loại** của Citizen theo các tiêu chí:
  - Độ chính xác phân loại
  - Chất lượng rác tái chế
- **Xem lịch sử công việc** và số lượng yêu cầu đã hoàn thành
- **Theo dõi KPI cá nhân** và bonus điểm thưởng để tăng rank

---

### 🛡️ Administrator (Quản trị viên)

#### Quản lý Người dùng
- **Quản lý tài khoản** người dùng và phân quyền (CRUD)
  - *Phụ trách: Tín, Tú*

#### Giám sát Hệ thống
- **Dashboard tổng quan** hiển thị:
  - 📈 Tổng số báo cáo theo trạng thái (Pending, Accepted, Assigned, Collected)
  - 📊 Thống kê báo cáo theo khu vực và thời gian
  - 🏢 Hiệu suất xử lý của các Recycling Enterprise
  - 🚛 Hiệu suất làm việc của Collector
  - 🎁 Thống kê điểm thưởng và khiếu nại

#### Quản lý Nội dung
- **Quản lý khiếu nại** liên quan đến hệ thống (CRUD)
  - Ví dụ: cộng điểm sai, bug hệ thống
  - *Phụ trách: Tú, Khôi*
- **Quản lý thông báo** (CRUD)
  - *Phụ trách: Tú, Khôi*
- **Quản lý năng lực xử lý** của doanh nghiệp (CRUD)
  - *Phụ trách: Đạt, Quốc, Bình*
- **Quản lý phần thưởng** đổi điểm (CRUD)
  - *Phụ trách: Đạt, Bình, Tín*

#### Cấu hình
- **Settings** - Cấu hình API, thông số hệ thống, etc.

---

## 🤖 Tính Năng Tùy Chọn

### AI Hỗ trợ Phân loại Rác (Decision Support)

- **Input:** Ảnh rác do Citizen upload
- **Output:** Gợi ý loại rác:
  - ♻️ Organic (Hữu cơ)
  - 📦 Recyclable (Tái chế được)
  - ⚠️ Hazardous (Nguy hại)
  - 🗑️ Other (Khác)
- **Xác nhận:** Người dùng xác nhận lại trước khi gửi

---

## 🎯 Tính Năng Bổ Sung

### Cơ chế KPI và Bonus

1. **Cấu hình KPI cho Collector:**
   - Doanh nghiệp có thể thiết lập:
     - Số lượng báo cáo tối đa/tối thiểu trong 1 ngày
     - Khối lượng tối thiểu phải thu gom (kg)
   - Collector hoàn thành đúng KPI trong khoảng thời gian → **Bonus điểm thưởng** → Tăng rank

2. **Cấu hình nhận Request tự động:**
   - Thiết lập điều kiện tự động nhận báo cáo
   - Giới hạn số lượng báo cáo mỗi Collector có thể nhận trong 1 ngày

3. **Đánh giá chất lượng phân loại:**
   - Nếu Citizen hoàn thành đổi rác và phân loại đúng → **Cộng điểm tự động**
   - Nếu chưa phân loại đúng → Collector đánh giá dựa trên tiêu chí → Cộng điểm theo đánh giá

---

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
```

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

## 🚀 Cách Bắt Đầu

### Prerequisites

- **Java 17+** (recommend: Eclipse Adoptium)
- **Maven 3.8+**
- **Node.js 18+**
- **npm 9+**
- **PostgreSQL 14+** (optional - chỉ cần nếu dùng profile `local` hoặc `prod`)

### Backend

```bash
cd backend

# Chạy với H2 (mặc định - không cần setup database)
mvn spring-boot:run

# Chạy với PostgreSQL local
mvn spring-boot:run -Dspring.profiles.active=local
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

## 📜 Scripts

### Backend (Maven)

```bash
mvn spring-boot:run                                   # Chạy với H2 (mặc định)
mvn spring-boot:run -Dspring.profiles.active=local    # Chạy với PostgreSQL
mvn clean install                                     # Build project
mvn clean install -DskipTests                         # Build bỏ qua tests
mvn test                                              # Chạy tests
```

### Frontend (npm)

```bash
npm run dev       # Development mode (localhost:3000)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # ESLint check
npm run format    # Format code with Prettier
```

## ⚙️ Cấu Hình Môi Trường

### Backend Profiles

Backend hỗ trợ nhiều profile khác nhau:

| Profile          | Database     | Mô tả                                |
| ---------------- | ------------ | ------------------------------------ |
| `dev` (mặc định) | H2 In-Memory | Không cần setup, dữ liệu mất khi tắt |
| `local`          | PostgreSQL   | Development với PostgreSQL local     |
| `prod`           | PostgreSQL   | Production                           |

**Chạy với profile cụ thể:**

```bash
# Mặc định (H2)
mvn spring-boot:run

# Với PostgreSQL local
mvn spring-boot:run -Dspring.profiles.active=local
```

### Backend Configuration Files

```
backend/src/main/resources/
├── application.properties           # Cấu hình chung
├── application-dev.properties       # H2 (development)
├── application-local.properties     # PostgreSQL local (copy từ .example)
└── application-prod.properties      # PostgreSQL production
```

### Setup PostgreSQL Local

1. Tạo database:

```sql
CREATE DATABASE swd_db;
```

2. Copy file cấu hình:

```bash
cp application-local.properties.example application-local.properties
```

3. Sửa password trong `application-local.properties`

4. Chạy:

```bash
mvn spring-boot:run -Dspring.profiles.active=local
```

### Backend Environment Variables (Production)

```properties
# Server
server.port=8080

# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/swd_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000
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

---

**Happy Coding!** 🚀
