# SWD V2 - Waste Collection Platform

Nen tang quan ly bao cao rac va dieu phoi thu gom gom 3 ung dung:

- `backend`: Spring Boot API
- `frontend`: React + Vite web app
- `mobile`: Expo React Native app

He thong phuc vu 4 vai tro chinh:

- `Citizen`: tao bao cao rac, theo doi trang thai, tich diem
- `Collector`: nhan nhiem vu, di chuyen, can rac, hoan tat task
- `Enterprise`: duyet bao cao, phan cong collector, quan ly nang luc phuc vu
- `Admin`: quan ly nguoi dung, doanh nghiep, thong bao, phan thuong, cau hinh

## Kien truc tong the

```text
.
|-- backend/    Spring Boot + PostgreSQL + JWT + Cloudinary
|-- frontend/   React 19 + Vite + Tailwind CSS + React Query
|-- mobile/     Expo Router + React Native + React Query
|-- README.md
`-- SWD392-API.postman_collection.json
```

## Tech stack

| Thanh phan | Cong nghe chinh |
| --- | --- |
| Backend | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA, PostgreSQL |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, React Query, Zustand |
| Mobile | Expo 54, React Native 0.81, Expo Router 6, React Query, Zustand |
| Ha tang ngoai | PostgreSQL/Supabase, Cloudinary, Google Maps |

## Yeu cau moi truong

- `Java 21`
- `Node.js 18+`
- `npm`
- `PostgreSQL` hoac Supabase PostgreSQL
- `Expo Go` neu chay mobile tren dien thoai that
- `ngrok` neu can public backend local cho mobile/web

## Chay nhanh toan bo du an

### 1. Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API mac dinh chay tai `http://localhost:8080`.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Web mac dinh chay tai `http://localhost:5173`.

### 3. Mobile

```powershell
cd mobile
npm install
npm run start
```

Neu chay tren dien thoai that, nen dung:

```powershell
npm run start:tunnel
```

## Cau hinh moi truong

### Backend

Các biến chính nam trong `backend/.env`:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`
- `SERVER_PORT`
- `JWT_SECRET`, `JWT_ACCESS_EXPIRY`, `JWT_REFRESH_EXPIRY`
- `CORS_ALLOWED_ORIGINS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_SETUP_SECRET`

Luu y:

- `spring.jpa.hibernate.ddl-auto=validate`
- `spring.flyway.enabled=false`

Nghia la schema database phai ton tai san va khop voi entity hien tai.

### Frontend

File `frontend/.env` dung:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Gia tri nay la base URL backend khong co `/api`.

### Mobile

File `mobile/.env` co the dung:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

Luu y:

- Mobile can URL co `/api`
- Frontend web thi nguoc lai, khong co `/api`
- Khi chay tren Android emulator, app co fallback `10.0.2.2`
- Khi chay tren dien thoai that, nen dung public URL nhu ngrok

## Ngrok + Expo cho dien thoai that

Neu backend chay local nhung mobile quet QR tren dien thoai that:

1. Public backend local:

```powershell
ngrok http 8080
```

2. Lay HTTPS forwarding URL, vi du `https://abc123.ngrok-free.app`
3. Set trong `mobile/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=https://abc123.ngrok-free.app/api
```

4. Khoi dong Expo bang:

```powershell
cd mobile
npm run start:tunnel
```

Neu frontend web cung can goi backend qua ngrok:

```env
VITE_API_BASE_URL=https://abc123.ngrok-free.app
```

## Huong dan dung `ngrok`

`Expo tunnel` va `ngrok` la hai viec khac nhau:

- `npm run start:tunnel`: public Expo dev server de dien thoai mo app qua QR
- `ngrok http 8080`: public backend local de mobile/web goi duoc API

### Public backend local

```powershell
ngrok http 8080
```

Vi du URL nhan duoc:

```text
https://abc123.ngrok-free.app
```

Khi do:

- mobile dung `https://abc123.ngrok-free.app/api`
- frontend dung `https://abc123.ngrok-free.app`

### Public frontend web khi can

Neu ban muon nguoi khac hoac thiet bi khac mo web app local cua ban:

```powershell
ngrok http 5173
```

Luu y:

- frontend va backend thuong la hai URL public rieng
- neu frontend co URL public moi, them origin do vao `CORS_ALLOWED_ORIGINS`

### Cac loi sai thuong gap voi `ngrok`

- dung `localhost` tren dien thoai that
- mobile thieu `/api` o cuoi `EXPO_PUBLIC_API_BASE_URL`
- frontend lai them `/api` vao `VITE_API_BASE_URL`
- doi `.env` xong nhung khong restart Expo hoac Vite
- nghi Expo tunnel se tu public luon backend API
- public frontend bang domain moi nhung backend chua them domain do vao `CORS_ALLOWED_ORIGINS`
- restart ngrok nhung quen cap nhat URL moi trong `.env`

## Tai lieu chi tiet tung app

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Mobile README](./mobile/README.md)

## API va cong cu ho tro

- Postman collection: [SWD392-API.postman_collection.json](./SWD392-API.postman_collection.json)
- Script test nhanh: `test-api.ps1`, `test-full.ps1`
- Swagger UI mac dinh: `http://localhost:8080/swagger-ui.html`

## Cac lenh huu ich

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

## Goi y onboarding nhanh

1. Chay backend truoc
2. Kiem tra Swagger hoat dong
3. Chay frontend de xac nhan login va dashboard
4. Chay mobile bang Expo
5. Neu dung dien thoai that, cau hinh `EXPO_PUBLIC_API_BASE_URL` sang public URL cua ngrok

## Luu y bao mat

- Khong nen commit secret that vao repo dung chung
- Nen xoay vong cac khoa Cloudinary, JWT, database neu repo da lo thong tin
