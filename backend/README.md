# Backend README

## Tổng quan

`backend/` là Spring Boot API cho toàn bộ nền tảng quản lý thu gom rác. Ứng dụng chịu trách nhiệm:

- xác thực và phân quyền bằng JWT
- quản lý user theo vai trò
- nhận và xử lý báo cáo rác
- điều phối nhiệm vụ cho collector
- quản lý thông báo, phần thưởng, khiếu nại, cấu hình hệ thống
- upload ảnh qua Cloudinary

## Stack

- `Java 21`
- `Spring Boot 3.2.3`
- `Spring Security`
- `Spring Data JPA`
- `PostgreSQL`
- `JWT`
- `Springdoc OpenAPI`
- `Cloudinary`

## Cấu trúc thư mục chính

```text
backend/
|-- src/main/java/com/wastecollection/
|   |-- config/
|   |-- controller/
|   |-- dto/
|   |-- entity/
|   |-- exception/
|   |-- repository/
|   |-- security/
|   `-- service/
|-- src/main/resources/
|   `-- application.yml
|-- .env
`-- pom.xml
```

## Các controller chính

- `AuthController`
- `UserController`
- `WasteReportController`
- `CollectorController`
- `EnterpriseTaskController`
- `EnterpriseCapabilityController`
- `EnterpriseRewardRuleController`
- `AdminController`
- `NotificationController`
- `ComplaintController`
- `RewardController`

## Yêu cầu chạy

- `Java 21`
- `PostgreSQL` hoặc Supabase PostgreSQL
- Maven wrapper có sẵn trong repo

## Cấu hình môi trường

File local đang dùng là `backend/.env`. Các biến quan trọng:

| Biến | Ý nghĩa |
| --- | --- |
| `DB_HOST` | Host PostgreSQL |
| `DB_PORT` | Port PostgreSQL |
| `DB_NAME` | Tên database |
| `DB_USERNAME` | User database |
| `DB_PASSWORD` | Password database |
| `SERVER_PORT` | Port chạy API |
| `JWT_SECRET` | Secret ký access/refresh token |
| `JWT_ACCESS_EXPIRY` | TTL access token |
| `JWT_REFRESH_EXPIRY` | TTL refresh token |
| `CORS_ALLOWED_ORIGINS` | Danh sách origin cho web frontend |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `ADMIN_SETUP_SECRET` | Secret cho luồng setup admin |

## Lưu ý cấu hình database

Ứng dụng hiện chạy với:

- `spring.jpa.hibernate.ddl-auto=validate`
- `spring.flyway.enabled=false`

Điều này có nghĩa:

- backend không tự tạo schema
- backend chỉ chạy nếu schema hiện tại khớp với entity
- khi đổi entity, cần tự xử lý migration database

## Chạy dự án

### Windows

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

### macOS/Linux

```bash
cd backend
./mvnw spring-boot:run
```

API mặc định: `http://localhost:8080`

## Các lệnh hữu ích

### Compile

```powershell
.\mvnw.cmd -DskipTests compile
```

### Test

```powershell
.\mvnw.cmd test
```

### Build

```powershell
.\mvnw.cmd clean package
```

## API docs

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`
- Health endpoint: `http://localhost:8080/actuator/health`

## Phân quyền

Các nhóm quyền chính:

- `/api/auth/**`: public
- `/api/admin/**`: `ADMIN`
- `/api/enterprise/**`: `ENTERPRISE`, `ADMIN`
- `/api/collector/**`: `COLLECTOR`, `ADMIN`
- một số GET public như `waste-types`, `service-areas`

## Kết nối với frontend và mobile

### Frontend web

Frontend gọi backend root URL, ví dụ:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Nếu frontend chạy ở public domain, thêm domain đó vào:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,https://your-frontend.slim.show
```

### Mobile Expo

Mobile native không phụ thuộc CORS nhưng cần backend phải reachable từ thiết bị. Nếu dùng điện thoại thật, nên public backend bằng Slim và cấu hình:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.slim.show/api
```

## Dùng `slim.sh` với backend

### Public backend local

```powershell
slim login
slim share --port 8080 --subdomain swd392-api
```

Ví dụ URL thu được:

```text
https://swd392-api.slim.show
```

Khi đó:

- mobile dùng `https://swd392-api.slim.show/api`
- frontend dùng `https://swd392-api.slim.show`

### Các lỗi sai thường gặp

- public backend xong nhưng mobile vẫn để `http://localhost:8080/api`
- public frontend bằng domain public nhưng quên thêm origin vào `CORS_ALLOWED_ORIGINS`
- bật `--password` khi mobile/web cần gọi API trực tiếp
- sửa `.env` backend nhưng không restart Spring Boot

## Troubleshooting

### Lỗi database/schema

- kiểm tra DB đang dùng đúng schema
- kiểm tra schema đã được tạo đúng trước khi chạy app
- vì `ddl-auto=validate`, chỉ cần lệch cột hoặc enum là app sẽ fail khi start

### Lỗi upload ảnh

- kiểm tra 3 biến Cloudinary
- kiểm tra network outbound từ backend

### Lỗi CORS ở frontend

- thêm origin web vào `CORS_ALLOWED_ORIGINS`
- restart backend sau khi đổi `.env`

### Lỗi 401

- kiểm tra `JWT_SECRET`
- kiểm tra access token gửi đúng header `Authorization: Bearer ...`
