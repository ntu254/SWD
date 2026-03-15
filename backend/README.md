# Backend README

## Tong quan

`backend/` la Spring Boot API cho toan bo nen tang quan ly thu gom rac. Ung dung chiu trach nhiem:

- xac thuc va phan quyen bang JWT
- quan ly user theo vai tro
- nhan va xu ly bao cao rac
- dieu phoi nhiem vu cho collector
- quan ly thong bao, phan thuong, khieu nai, cau hinh he thong
- upload anh qua Cloudinary

## Stack

- `Java 21`
- `Spring Boot 3.2.3`
- `Spring Security`
- `Spring Data JPA`
- `PostgreSQL`
- `JWT`
- `Springdoc OpenAPI`
- `Cloudinary`

## Cau truc thu muc chinh

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

## Cac controller chinh

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

## Yeu cau chay

- `Java 21`
- `PostgreSQL` hoac Supabase PostgreSQL
- Maven wrapper co san trong repo

## Cau hinh moi truong

File local dang dung la `backend/.env`. Cac bien quan trong:

| Bien | Y nghia |
| --- | --- |
| `DB_HOST` | Host PostgreSQL |
| `DB_PORT` | Port PostgreSQL |
| `DB_NAME` | Ten database |
| `DB_USERNAME` | User database |
| `DB_PASSWORD` | Password database |
| `SERVER_PORT` | Port chay API |
| `JWT_SECRET` | Secret ky access/refresh token |
| `JWT_ACCESS_EXPIRY` | TTL access token |
| `JWT_REFRESH_EXPIRY` | TTL refresh token |
| `CORS_ALLOWED_ORIGINS` | Danh sach origin cho web frontend |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `ADMIN_SETUP_SECRET` | Secret cho luong setup admin |

## Luu y cau hinh database

Ung dung hien chay voi:

- `spring.jpa.hibernate.ddl-auto=validate`
- `spring.flyway.enabled=false`

Dieu nay co nghia:

- backend khong tu tao schema
- backend chi chay neu schema hien tai khop voi entity
- khi doi entity, can tu xu ly migration database

## Chay du an

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

API mac dinh: `http://localhost:8080`

## Cac lenh huu ich

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

## Phan quyen

Các nhom quyen chinh:

- `/api/auth/**`: public
- `/api/admin/**`: `ADMIN`
- `/api/enterprise/**`: `ENTERPRISE`, `ADMIN`
- `/api/collector/**`: `COLLECTOR`, `ADMIN`
- mot so GET public nhu `waste-types`, `service-areas`

## Ket noi voi frontend va mobile

### Frontend web

Frontend goi backend root URL, vi du:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Neu frontend chay o public domain, them domain do vao:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8081,https://your-frontend.ngrok-free.app
```

### Mobile Expo

Mobile native khong phu thuoc CORS nhu browser nhung can backend phai reachable tu thiet bi. Neu dung dien thoai that, nen public backend bang ngrok va cau hinh:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.ngrok-free.app/api
```

## Dung `ngrok` voi backend

### Public backend local

```powershell
ngrok http 8080
```

Vi du URL thu duoc:

```text
https://abc123.ngrok-free.app
```

Khi do:

- mobile dung `https://abc123.ngrok-free.app/api`
- frontend dung `https://abc123.ngrok-free.app`

### Cac loi sai thuong gap

- public backend xong nhung mobile van de `http://localhost:8080/api`
- public frontend bang domain public nhung quen them origin vao `CORS_ALLOWED_ORIGINS`
- sua `.env` backend nhung khong restart Spring Boot
- restart ngrok nhung mobile/frontend van dung URL cu

## Troubleshooting

### Loi database/schema

- kiem tra DB dang dung dung schema
- kiem tra schema da duoc tao dung truoc khi chay app
- vi `ddl-auto=validate`, chi can lech cot hoac enum la app se fail khi start

### Loi upload anh

- kiem tra 3 bien Cloudinary
- kiem tra network outbound tu backend

### Loi CORS o frontend

- them origin web vao `CORS_ALLOWED_ORIGINS`
- restart backend sau khi doi `.env`

### Loi 401

- kiem tra `JWT_SECRET`
- kiem tra access token gui dung header `Authorization: Bearer ...`
