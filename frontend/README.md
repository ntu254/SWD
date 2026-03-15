# Frontend README

## Tổng quan

`frontend/` là web app quản lý theo vai trò cho toàn bộ hệ thống. Ứng dụng phục vụ:

- đăng nhập, đăng ký, phân quyền
- dashboard cho `Citizen`, `Collector`, `Enterprise`, `Admin`
- quản lý báo cáo, nhiệm vụ, collector, thông báo, phần thưởng
- hiển thị bản đồ, biểu đồ, bảng dữ liệu và các flow quản trị

## Stack

- `React 19`
- `TypeScript`
- `Vite 7`
- `Tailwind CSS 4`
- `React Router`
- `TanStack React Query`
- `Zustand`
- `Axios`
- `Leaflet`
- `Recharts`

## Cấu trúc thư mục chính

```text
frontend/
|-- src/
|   |-- api/
|   |-- components/
|   |-- lib/
|   |-- pages/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- citizen/
|   |   |-- collector/
|   |   |-- enterprise/
|   |   `-- shared/
|   |-- store/
|   `-- types.ts
|-- .env
|-- package.json
`-- vite.config.ts
```

## Yêu cầu chạy

- `Node.js 18+`
- backend đang chạy tại `http://localhost:8080` hoặc một base URL khác bạn cấu hình

## Cấu hình môi trường

File `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Lưu ý:

- không thêm `/api`
- app sẽ tự append `/api` trong layer axios

Ví dụ khi dùng Slim:

```env
VITE_API_BASE_URL=https://your-backend.slim.show
```

## Chạy dự án

```powershell
cd frontend
npm install
npm run dev
```

App mặc định chạy tại `http://localhost:5173`.

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Tích hợp API

- `axios` dùng `VITE_API_BASE_URL`
- request auth tự gắn `Bearer token` từ `localStorage`
- khi gặp `401`, app thử refresh token rồi retry request

File liên quan:

- `src/api/axios.ts`
- `vite.config.ts`

## Các nhóm màn hình chính

### Auth

- đăng nhập
- đăng ký
- unauthorized page

### Citizen

- dashboard
- tạo báo cáo
- chi tiết báo cáo
- danh sách báo cáo
- phần thưởng
- thông báo

### Collector

- dashboard
- danh sách task
- chi tiết task
- bản đồ
- hiệu suất
- hồ sơ
- thông báo

### Enterprise

- dashboard
- báo cáo chờ duyệt
- nhiệm vụ
- chi tiết nhiệm vụ
- collector
- analytics
- reward rules
- capabilities
- thông báo

### Admin

- dashboard
- users
- enterprises
- complaints
- notifications
- reward items
- settings

## Build production

```powershell
cd frontend
npm run build
```

Thư mục output: `frontend/dist`

## Lint

```powershell
npm run lint
```

## Troubleshooting

### Web không gọi được API

- kiểm tra backend đang chạy
- kiểm tra `VITE_API_BASE_URL`
- nếu backend ở domain public khác, kiểm tra CORS bên backend

### Login xong bị đá về `/login`

- kiểm tra access token và refresh token trong `localStorage`
- kiểm tra backend trả `401` hay lỗi role-based route

### Map không hiển thị

- kiểm tra tile/map network
- kiểm tra component map có nhận đúng lat/lng từ API

