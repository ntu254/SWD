# Mobile README

## Tong quan

`mobile/` la ung dung Expo React Native dung cho cac flow mobile cua he thong:

- `Citizen`: tao report, xem lich su, xem chi tiet bao cao, nhan goi y AI bubble
- `Collector`: xem task, vao man chi tiet, chup minh chung, nhap can nang, hoan tat nhiem vu
- `Enterprise` va `Admin`: cac flow mobile dang co san theo router hien tai

Ung dung dung `Expo Router` voi cau truc route theo nhom vai tro.

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

## Cau truc thu muc chinh

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

## Yeu cau chay

- `Node.js 18+`
- `npm`
- `Expo Go` neu chay tren dien thoai that
- backend dang chay va reachable tu thiet bi

## Cau hinh moi truong

File `mobile/.env`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Luu y quan trong:

- mobile can `EXPO_PUBLIC_API_BASE_URL` co `/api`
- web frontend thi nguoc lai, khong co `/api`

Các bien khac app cung ho tro:

- `EXPO_PUBLIC_MAP_PROVIDER`
- `EXPO_PUBLIC_API_TIMEOUT_MS`
- `EXPO_PUBLIC_DEMO_PASSWORD`
- `EXPO_PUBLIC_ADMIN_SETUP_SECRET`
- `EXPO_PUBLIC_DEMO_ACCOUNT_PREFIX`

## Chay du an

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

## Chay theo moi truong

### Android emulator

Fallback API mac dinh la `http://10.0.2.2:8080/api` neu ban chua set `EXPO_PUBLIC_API_BASE_URL`.

### iOS simulator / local web

Fallback mac dinh la `http://localhost:8080/api`.

### Dien thoai that

Ban nen:

1. public backend local bang ngrok:

```powershell
ngrok http 8080
```

2. sua `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app/api
```

3. chay Expo:

```powershell
npm run start:tunnel
```

## Ngrok + Expo tunnel

Day la cach on dinh nhat khi muon quet app tren dien thoai that:

1. backend chay local port `8080`
2. tao public URL cho backend bang ngrok
3. set `EXPO_PUBLIC_API_BASE_URL` sang URL public co `/api`
4. chay Expo bang `start:tunnel`

Vi du:

```env
EXPO_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app/api
```

### Lenh mau dung

```powershell
ngrok http 8080
```

Sau do cap nhat `mobile/.env`, roi restart Expo:

```powershell
npm run start:tunnel
```

### Cac loi sai thuong gap voi mobile + ngrok

- dung `http://localhost:8080/api` tren dien thoai that
- thieu `/api` o cuoi `EXPO_PUBLIC_API_BASE_URL`
- sua `.env` nhung khong restart Expo
- tuong chi can Expo tunnel la du
- restart ngrok nhung app van dung URL cu

## Ban do va vi tri

- app co tich hop Google Maps key qua `app.config.js`
- neu khong co key hoac doi provider, kiem tra `EXPO_PUBLIC_MAP_PROVIDER`
- cac flow report/task detail phu thuoc lat/lng tu backend

## Kiem tra chat luong

### Lint

```powershell
npm run lint
```

### Type check

```powershell
npx tsc --noEmit
```

## Troubleshooting

### Mobile khong fetch duoc API

- kiem tra `EXPO_PUBLIC_API_BASE_URL`
- neu chay tren dien thoai that, khong dung `localhost`
- thu ngrok hoac mot public tunnel khac

### Quet QR duoc nhung app khong load data

- Expo dev server va backend la hai van de khac nhau
- Expo nen chay `start:tunnel`
- backend nen co public URL rieng

### Map khong hien

- kiem tra `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`
- restart Expo sau khi doi `.env`

### Anh khong upload duoc

- kiem tra backend Cloudinary
- kiem tra quyen camera/photo library tren thiet bi
