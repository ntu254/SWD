# Frontend README

## Tong quan

`frontend/` la web app quan ly theo vai tro cho toan bo he thong. Ung dung phuc vu:

- dang nhap, dang ky, phan quyen
- dashboard cho `Citizen`, `Collector`, `Enterprise`, `Admin`
- quan ly bao cao, nhiem vu, collector, thong bao, phan thuong
- hien thi ban do, bieu do, bang du lieu va cac flow quan tri

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

## Cau truc thu muc chinh

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

## Yeu cau chay

- `Node.js 18+`
- backend dang chay tai `http://localhost:8080` hoac mot base URL khac ban cau hinh

## Cau hinh moi truong

File `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Luu y:

- khong them `/api`
- app se tu append `/api` trong layer axios

Vi du khi dung ngrok:

```env
VITE_API_BASE_URL=https://your-backend.ngrok-free.app
```

## Dung `ngrok` cho frontend web

Voi ngrok, frontend va backend thuong la hai URL rieng. Frontend chi can tro `VITE_API_BASE_URL` toi URL public cua backend.

### Truong hop 1: chi public backend

Frontend van chay local va chi can:

```powershell
ngrok http 8080
```

Sau do cap nhat:

```env
VITE_API_BASE_URL=https://abc123.ngrok-free.app
```

### Truong hop 2: public chinh frontend web

```powershell
ngrok http 5173
```

Khi do:

- ban co the chia se web app local qua URL public
- neu backend van o origin khac, nho them URL frontend public vao `CORS_ALLOWED_ORIGINS`

### Cac loi sai thuong gap voi `ngrok`

- ghi `VITE_API_BASE_URL=https://your-backend.ngrok-free.app/api`
- quen restart Vite sau khi doi `.env`
- public frontend bang domain moi nhung backend chua them domain do vao `CORS_ALLOWED_ORIGINS`
- nghi Expo tunnel se public luon backend cho web/mobile

## Chay du an

```powershell
cd frontend
npm install
npm run dev
```

App mac dinh chay tai `http://localhost:5173`.

## Scripts

```powershell
npm run dev
npm run build
npm run preview
npm run lint
```

## Tich hop API

- `axios` dung `VITE_API_BASE_URL`
- request auth tu gan `Bearer token` tu `localStorage`
- khi gap `401`, app thu refresh token roi retry request

File lien quan:

- `src/api/axios.ts`
- `vite.config.ts`

## Cac nhom man hinh chinh

### Auth

- dang nhap
- dang ky
- unauthorized page

### Citizen

- dashboard
- tao bao cao
- chi tiet bao cao
- danh sach bao cao
- phan thuong
- thong bao

### Collector

- dashboard
- danh sach task
- chi tiet task
- ban do
- hieu suat
- ho so
- thong bao

### Enterprise

- dashboard
- bao cao cho duyet
- nhiem vu
- chi tiet nhiem vu
- collector
- analytics
- reward rules
- capabilities
- thong bao

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

Thu muc output: `frontend/dist`

## Lint

```powershell
npm run lint
```

## Troubleshooting

### Web khong goi duoc API

- kiem tra backend dang chay
- kiem tra `VITE_API_BASE_URL`
- neu backend o domain public khac, kiem tra CORS ben backend

### Login xong bi da ve `/login`

- kiem tra access token va refresh token trong `localStorage`
- kiem tra backend tra `401` hay loi role-based route

### Map khong hien thi

- kiem tra tile/map network
- kiem tra component map co nhan dung lat/lng tu API
