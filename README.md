# SWD V2 - Waste Collection Platform

Nền tảng quản lý báo cáo rác và điều phối thu gom gồm 3 ứng dụng:

- `backend`: Spring Boot API
- `frontend`: React + Vite web app
- `mobile`: Expo React Native app

Hệ thống phục vụ 4 vai trò chính:

- `Citizen`: tạo báo cáo rác, theo dõi trạng thái, tích điểm
- `Collector`: nhận nhiệm vụ, di chuyển, cân rác, hoàn tất task
- `Enterprise`: duyệt báo cáo, phân công collector, quản lý năng lực phục vụ
- `Admin`: quản lý người dùng, doanh nghiệp, thông báo, phần thưởng, cấu hình

## Kiến trúc tổng thể

```text
.
|-- backend/    Spring Boot + PostgreSQL + JWT + Cloudinary
|-- frontend/   React 19 + Vite + Tailwind CSS + React Query
|-- mobile/     Expo Router + React Native + React Query
|-- README.md
|-- SWD392-API.postman_collection.json
```

## Tech stack

| Thành phần | Công nghệ chính |
| --- | --- |
| Backend | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA, PostgreSQL |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Query, Zustand |
| Mobile | Expo 54, React Native 0.81, Expo Router 6, React Query, Zustand |
| Hạ tầng ngoài | PostgreSQL/Supabase, Cloudinary, Google Maps |

## Yêu cầu môi trường

- `Java 21`
- `Node.js 18+`
- `npm`
- `PostgreSQL` hoặc Supabase PostgreSQL
- `Expo Go` nếu chạy mobile trên điện thoại thật

## Chạy nhanh toàn bộ dự án

### 1. Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API mặc định chạy tại `http://localhost:8080`.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Web mặc định chạy tại `http://localhost:5173`.

### 3. Mobile

```powershell
cd mobile
npm install
npm run start
```

Nếu chạy trên điện thoại thật, nên dùng:

```powershell
npm run start:tunnel
```

## Cấu hình môi trường

### Backend

Các biến chính nằm trong `backend/.env`:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `SERVER_PORT`
- `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
- `CORS_ALLOWED_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_SETUP_SECRET`

Lưu ý:

- `spring.jpa.hibernate.ddl-auto=validate`
- `spring.flyway.enabled=false`

Nghĩa là schema database phải tồn tại sẵn và khớp entity hiện tại.

### Frontend

File `frontend/.env` dùng:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Giá trị này là base URL backend không có `/api`.

### Mobile

File `mobile/.env` có thể dùng:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Lưu ý:

- Mobile cần URL có `/api`
- Khi chạy trên Android emulator, app có fallback `10.0.2.2`
- Khi chạy trên điện thoại thật, nên dùng public URL như Slim hoặc tunnel khác

## Slim + Expo cho điện thoại thật

Nếu backend chạy local nhưng mobile quét QR trên điện thoại thật:

1. Public backend local bằng Slim, ví dụ `https://your-backend.slim.show`
2. Set trong `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.slim.show/api
```

3. Khởi động Expo bằng:

```powershell
cd mobile
npm run start:tunnel
```

Nếu frontend web cũng cần gọi backend qua Slim:

```env
VITE_API_BASE_URL=https://your-backend.slim.show
```

## Tài liệu chi tiết từng app

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Mobile README](./mobile/README.md)

## API và công cụ hỗ trợ

- Postman collection: [SWD392-API.postman_collection.json](./SWD392-API.postman_collection.json)
- Script test nhanh: `test-api.ps1`, `test-full.ps1`
- Swagger UI mặc định: `http://localhost:8080/swagger-ui.html`

## Các lệnh hữu ích

### Backend

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd -DskipTests compile
```

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

### Mobile

```powershell
cd mobile
npm run lint
npx tsc --noEmit
```

## Gợi ý onboarding nhanh

1. Chạy backend trước
2. Kiểm tra Swagger hoạt động
3. Chạy frontend để xác nhận login và dashboard
4. Chạy mobile bằng Expo
5. Nếu dùng điện thoại thật, cấu hình `EXPO_PUBLIC_API_BASE_URL` sang public URL

## Lưu ý bảo mật

- Không nên commit secret thật vào repo dùng chung
- Nên xoay vòng các khóa Cloudinary, JWT, database nếu repo đã lộ thông tin

