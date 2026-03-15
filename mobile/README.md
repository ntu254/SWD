# Mobile README

## Tổng quan

`mobile/` là ứng dụng Expo React Native dùng cho các flow mobile của hệ thống:

- `Citizen`: tạo report, xem lịch sử, xem chi tiết báo cáo, nhận gợi ý AI bubble
- `Collector`: xem task, vào màn chi tiết, chụp minh chứng, nhập cân nặng, hoàn tất nhiệm vụ
- `Enterprise` và `Admin`: các flow mobile đang có sẵn theo router hiện tại

Ứng dụng dùng `Expo Router` với cấu trúc route theo nhóm vai trò.

## Stack

- `Expo 54`
- `React Native 0.81`
- `React 19`
- `Expo Router 6`
- `TanStack React Query`
- `Zustand`
- `react-native-maps`
- `expo-location`
- `expo-image-picker`

## Cấu trúc thư mục chính

```text
mobile/
|-- app/
|   |-- (auth)/
|   |-- (citizen)/
|   |-- (collector)/
|   |-- (enterprise)/
|   |-- (admin)/
|   `-- _layout.tsx
|-- components/
|   |-- api/
|   |-- maps/
|   |-- store/
|   |-- types/
|   `-- ...
|-- .env
|-- app.json
|-- app.config.js
`-- package.json
```

## Yêu cầu chạy

- `Node.js 18+`
- `npm`
- `Expo Go` nếu chạy trên điện thoại thật
- backend đang chạy và reachable từ thiết bị

## Cấu hình môi trường

File `mobile/.env`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Lưu ý quan trọng:

- mobile cần `EXPO_PUBLIC_API_BASE_URL` có `/api`
- web frontend thì ngược lại, không có `/api`

Các biến khác app cũng hỗ trợ:

- `EXPO_PUBLIC_MAP_PROVIDER`
- `EXPO_PUBLIC_API_TIMEOUT_MS`
- `EXPO_PUBLIC_DEMO_PASSWORD`
- `EXPO_PUBLIC_ADMIN_SETUP_SECRET`
- `EXPO_PUBLIC_DEMO_ACCOUNT_PREFIX`

## Chạy dự án

```powershell
cd mobile
npm install
npm run start
```

## Scripts

```powershell
npm run start
npm run start:localhost
npm run start:tunnel
npm run android
npm run ios
npm run web
npm run lint
```

## Chạy theo môi trường

### Android emulator

Fallback API mặc định là `http://10.0.2.2:8080/api` nếu bạn chưa set `EXPO_PUBLIC_API_BASE_URL`.

### iOS simulator / local web

Fallback mặc định là `http://localhost:8080/api`.

### Điện thoại thật

Bạn nên:

1. public backend local bằng Slim
2. sửa `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.slim.show/api
```

3. chạy Expo:

```powershell
npm run start:tunnel
```

## Slim + Expo tunnel

Đây là cách ổn định nhất khi muốn quét app trên điện thoại thật:

1. backend chạy local port `8080`
2. tạo public URL cho backend bằng Slim
3. set `EXPO_PUBLIC_API_BASE_URL` sang URL public có `/api`
4. chạy Expo bằng `start:tunnel`

Ví dụ:

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend.slim.show/api
```

## Bản đồ và vị trí

- app có tích hợp Google Maps key qua `app.config.js`
- nếu không có key hoặc đổi provider, kiểm tra `EXPO_PUBLIC_MAP_PROVIDER`
- các flow report/task detail phụ thuộc lat/lng từ backend

## Kiểm tra chất lượng

### Lint

```powershell
npm run lint
```

### Type check

```powershell
npx tsc --noEmit
```

## Troubleshooting

### Mobile không fetch được API

- kiểm tra `EXPO_PUBLIC_API_BASE_URL`
- nếu chạy trên điện thoại thật, không dùng `localhost`
- thử Slim hoặc một public tunnel khác

### Quét QR được nhưng app không load data

- Expo dev server và backend là hai vấn đề khác nhau
- Expo nên chạy `start:tunnel`
- backend nên có public URL riêng

### Map không hiện

- kiểm tra `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- restart Expo sau khi đổi `.env`

### Ảnh không upload được

- kiểm tra backend Cloudinary
- kiểm tra quyền camera/photo library trên thiết bị

