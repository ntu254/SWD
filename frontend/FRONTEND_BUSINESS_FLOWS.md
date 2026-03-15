# TAI LIEU LUONG NGHIEP VU FRONTEND (WEB)

## 1. Pham vi tai lieu
- Nguon phan tich: `frontend/src` (web app React + React Router + React Query + Zustand).
- Khong bao gom `mobile/expo`.
- Tai lieu nay mo ta **luong nghiep vu hien co tren UI frontend**, bao gom ca cac man hinh placeholder/chua trien khai.

## 2. Tong quan kien truc luong
- Dang nhap/dang ky thanh cong -> luu `accessToken`, `refreshToken`, `userId`, `email`, `role` vao store + localStorage.
- Route duoc bao ve bang `ProtectedRoute` theo role:
  - `CITIZEN`
  - `COLLECTOR`
  - `ENTERPRISE`
  - `ADMIN`
- 401 tu API (khong phai endpoint `/auth/*`) -> tu dong goi refresh token.
- Refresh thanh cong -> retry request cu.
- Refresh that bai -> clear localStorage + redirect `/login`.
- Sai role -> redirect `/unauthorized`.

## 3. Ma tran route theo vai tro

### Public
- `/login`
- `/register`
- `/unauthorized`
- `/mobile-app` (demo UI)

### Citizen
- `/citizen/dashboard`
- `/citizen/report`
- `/citizen/reports`
- `/citizen/reports/:id`
- `/citizen/notifications`
- `/citizen/rewards`

### Collector
- `/collector/dashboard`
- `/collector/notifications`
- `/collector/tasks`
- `/collector/tasks/:taskId`
- `/collector/map`
- `/collector/performance`
- `/collector/profile` (placeholder)

### Enterprise
- `/enterprise/dashboard`
- `/enterprise/reports`
- `/enterprise/tasks`
- `/enterprise/capabilities`
- `/enterprise/notifications`
- `/enterprise/collectors`
- `/enterprise/reward-rules`
- `/enterprise/analytics`
- `/enterprise/pickup` (placeholder)
- `/enterprise/profile` (placeholder)

### Admin
- `/admin/dashboard`
- `/admin/users`
- `/admin/enterprises`
- `/admin/complaints`
- `/admin/notifications`
- `/admin/reward-items`
- `/admin/settings`

## 4. Luong nghiep vu dung chung

### 4.1 Dang nhap
1. User nhap email/password.
2. Frontend validate form.
3. Goi `POST /api/auth/login`.
4. Neu thanh cong: luu auth state + dieu huong theo role:
   - CITIZEN -> `/citizen`
   - COLLECTOR -> `/collector`
   - ENTERPRISE -> `/enterprise`
   - ADMIN -> `/admin`
5. Neu that bai: hien toast loi.

### 4.2 Dang ky
1. User nhap thong tin ca nhan (mac dinh role `CITIZEN`).
2. Goi `POST /api/auth/register`.
3. Thanh cong: luu auth state, thong bao, dieu huong `/citizen`.
4. That bai: hien toast loi.

### 4.3 Dang xuat
1. User bam `Sign out` tren sidebar.
2. Frontend clear store + clear token localStorage.
3. Dieu huong ve `/login`.

### 4.4 Bao ve route
1. Moi route role-protected di qua `ProtectedRoute`.
2. Khong co token -> `/login`.
3. Co token nhung sai role -> `/unauthorized`.

## 5. Luong nghiep vu CITIZEN

### 5.1 Dashboard citizen
- Muc tieu: xem tong quan bao cao cua chinh minh.
- API: `GET /api/reports/mine`.
- Ket qua: tong so report, danh sach report gan day, chuyen den chi tiet report.

### 5.2 Tao bao cao rac (core flow)
1. Citizen vao `/citizen/report`.
2. Frontend tai danh muc:
   - `GET /api/waste-types`
   - `GET /api/service-areas`
3. Citizen upload anh (optional):
   - uu tien `POST /api/reports/upload-photo`
   - fallback local preview neu upload host khong san sang.
4. Citizen chon vi tri tren map hoac lay GPS hien tai.
5. Citizen nhap thong tin:
   - wasteTypeId
   - areaId
   - description
   - latitude/longitude
6. Submit -> `POST /api/reports`.
7. Thanh cong: toast + quay ve dashboard.
8. That bai: toast loi.

### 5.3 Xem danh sach report cua toi
- Route: `/citizen/reports`.
- API: `GET /api/reports/mine`.
- Hanh vi: click tung dong de vao `/citizen/reports/:id`.

### 5.4 Xem chi tiet report + theo doi tien trinh
- Route: `/citizen/reports/:id`.
- API: `GET /api/reports/{reportId}`.
- Hien timeline trang thai report:
  - `PENDING -> ACCEPTED -> ASSIGNED -> ON_THE_WAY -> COLLECTED`
  - Nhanh loi/ket thuc: `REJECTED` hoac `CANCELLED`.

### 5.5 Doi thuong
1. Frontend tai du lieu reward:
   - `GET /api/rewards/balance`
   - `GET /api/rewards/items`
   - `GET /api/rewards/transactions`
2. Citizen bam redeem -> `POST /api/rewards/redeem`.
3. Thanh cong -> refetch balance/items/transactions.
4. Khong du diem/het hang -> button disabled hoac API loi.

## 6. Luong nghiep vu COLLECTOR

### 6.1 Danh sach task duoc giao
- Route: `/collector/tasks`.
- API: `GET /api/collector/tasks` (polling 30s).
- Muc tieu: xem status, priority, ngay, vao chi tiet task.

### 6.2 Xu ly task thu gom (core flow)
1. Mo task: `GET /api/collector/tasks/{taskId}`.
2. Tai report lien quan: `GET /api/reports/{reportId}`.
3. Neu task dang `ASSIGNED`:
   - bam `Start route`
   - `PUT /api/collector/tasks/{taskId}/status?status=ON_THE_WAY`
4. Dien form hoan tat:
   - anh chung minh (bat buoc)
   - measured weight > 0 (bat buoc, sau khi can rac)
   - sorting level
   - collector note
5. Upload chung cu:
   - uu tien `POST /api/collector/evidence/upload`
   - fallback local preview neu host upload loi.
6. Submit complete:
   - `POST /api/collector/tasks/{taskId}/complete`
   - payload gom `visitStatus`, `collectorNote`, `photoUrls`, `wasteItems`.
7. Thanh cong:
   - refetch task list/task detail
   - refetch citizen reports lien quan
   - quay ve `/collector/tasks`.

### 6.3 Ban do, dashboard, performance
- `/collector/dashboard`: dashboard tong quan (hien dung mock data).
- `/collector/map`: route map (hien dung mock data).
- `/collector/performance`: bieu do hieu suat (hien dung mock data).
- `/collector/profile`: placeholder, chua co update profile collector.

## 7. Luong nghiep vu ENTERPRISE

### 7.1 Dashboard enterprise
- API:
  - `GET /api/enterprise/reports/pending`
  - `GET /api/enterprise/tasks`
- Muc tieu: nhin nhanh queue pending + tong task.

### 7.2 Duyet report den (core flow)
1. Route `/enterprise/reports` tai danh sach pending:
   - `GET /api/enterprise/reports/pending` (polling 30s).
2. Enterprise mo detail report.
3. Lua chon:
   - Accept: `PUT /api/enterprise/reports/{reportId}/accept`.
   - Reject: `PUT /api/enterprise/reports/{reportId}/reject?reason=...`.
4. Sau action: invalidate query pending/tasks.

### 7.3 Dieu phoi task va gan collector (core flow)
1. Route `/enterprise/tasks` tai queue task:
   - `GET /api/enterprise/tasks?status=...`.
2. Tai danh sach collector:
   - `GET /api/enterprise/collectors`.
3. Gan hoac doi collector:
   - `POST /api/enterprise/tasks/{taskId}/assign`.
4. Hien filter theo status va thong ke pending/active/completed.

### 7.4 Quan ly collector cua enterprise (CRUD)
1. Xem danh sach: `GET /api/enterprise/collectors`.
2. Tao moi collector:
   - dung auth register voi role `COLLECTOR`
   - `POST /api/auth/register` + `enterpriseUserId`.
3. Sua thong tin collector:
   - `PUT /api/enterprise/collectors/{collectorUserId}`.
4. Vo hieu hoa collector:
   - `DELETE /api/enterprise/collectors/{collectorUserId}`.

### 7.5 Quan ly reward rule enterprise (CRUD)
1. Tai rule: `GET /api/enterprise/reward-rules`.
2. Tai waste type de map rule: `GET /api/waste-types`.
3. Tao rule: `POST /api/enterprise/reward-rules`.
4. Sua rule: `PUT /api/enterprise/reward-rules/{ruleId}`.
5. Xoa rule: `DELETE /api/enterprise/reward-rules/{ruleId}`.

### 7.6 Analytics enterprise
- API: `GET /api/enterprise/tasks`.
- Frontend tu tong hop chart:
  - phan bo status
  - xu huong created/completed theo ngay
  - top collector
  - khu vuc co nhieu task.

### 7.7 Dang ky coverage/khu vuc enterprise
- Route: `/enterprise/capabilities`.
- API:
  - `GET /api/enterprise/capabilities`
  - `POST /api/enterprise/capabilities`
  - `DELETE /api/enterprise/capabilities/{capabilityId}`
  - `GET /api/service-areas`
  - `GET /api/waste-types`
- Muc tieu: dang ky khu vuc phuc vu + loai rac + cong suat/ngay de enterprise co the nhan report dung pham vi van hanh.

### 7.8 Pickup/Profile
- `/enterprise/pickup`: placeholder (chua co luong tao pickup thuc te).
- `/enterprise/profile`: placeholder (chua co luong sua profile enterprise).

## 8. Luong nghiep vu ADMIN

### 8.1 Dashboard he thong
- API: `GET /api/admin/dashboard` (refresh 60s).
- Muc tieu: tong quan users/reports/tasks/complaints/reward points.

### 8.2 Quan ly user (CRUD + governance)
1. Tai user theo role filter:
   - `GET /api/admin/users?role=...`.
2. Chuyen role:
   - `PUT /api/admin/users/{userId}/role?role=...`.
3. Bat/tat tai khoan:
   - `PUT /api/admin/users/{userId}/status?status=ACTIVE|DISABLED`.
4. Xoa user:
   - `DELETE /api/admin/users/{userId}`.

### 8.3 Quan ly enterprise account
1. Tai danh sach enterprise:
   - `GET /api/admin/enterprises`.
2. Bat/tat trang thai enterprise:
   - `PUT /api/admin/users/{userId}/status?...`.
3. Xoa enterprise account:
   - `DELETE /api/admin/users/{userId}`.

### 8.4 Xu ly khieu nai (complaints)
1. Tai complaints theo tab:
   - `GET /api/complaints?status=...`.
2. Resolve complaint:
   - `PUT /api/complaints/{complaintId}/resolve`
   - payload gom decision/note/isAccepted/adminResponse.

### 8.5 Nhan notification theo role
1. Citizen/Collector/Enterprise vao route notification rieng trong workspace.
2. Frontend goi `GET /api/notifications`.
3. Hien danh sach thong bao active theo dung target audience tu backend.
4. Co search + refresh de xem nhanh thong bao hien hanh.

### 8.6 Notification center
1. Tai danh sach:
   - `GET /api/admin/notifications`.
2. Tao moi thong bao:
   - `POST /api/admin/notifications`.
3. Vo hieu hoa:
   - `PUT /api/admin/notifications/{notificationId}/deactivate`.

### 8.7 Reward catalog (CRUD)
1. Tai item:
   - `GET /api/admin/reward-items`.
2. Tao item:
   - `POST /api/admin/reward-items`.
3. Sua item:
   - `PUT /api/admin/reward-items/{itemId}`.
4. Deactivate item:
   - `DELETE /api/admin/reward-items/{itemId}`.

### 8.8 System settings (CRUD)
1. Tai settings:
   - `GET /api/admin/settings`.
2. Tao setting:
   - `POST /api/admin/settings`.
3. Sua value:
   - `PUT /api/admin/settings/{key}`.
4. Xoa setting:
   - `DELETE /api/admin/settings/{key}`.

## 9. Chuoi chuyen trang thai nghiep vu chinh

### 9.1 Waste report lifecycle
`PENDING -> ACCEPTED -> ASSIGNED -> ON_THE_WAY -> COLLECTED`

Nhanh ngoai le:
- `PENDING -> REJECTED`
- `PENDING -> CANCELLED` (co type va timeline support, nhung hien tai web UI chua co nut cancel).

### 9.2 Task lifecycle
`PENDING_ENTERPRISE_APPROVAL -> ASSIGNED -> ON_THE_WAY/IN_PROGRESS -> COMPLETED`

Ghi chu mapping tren UI collector:
- `IN_PROGRESS` duoc hien thi nhu `ON_THE_WAY`.
- `COLLECTED` duoc normalize ve `COMPLETED` o chi tiet task.

## 10. Luong/chuc nang da co API nhung chua duoc dua day du len web UI
- `reportsApi.cancel(reportId)` co wrapper, nhung web citizen chua co nut cancel report.
- `complaintsApi.create/getMine/getById` co wrapper, nhung web citizen/collector/enterprise chua co man tao/xem complaint cua toi.
- `userApi.getProfile/updateProfile/uploadAvatar` co wrapper, nhung cac man profile web hien tai chua implement chinh thuc.
- `serviceAreasApi` va `wasteTypesApi` admin CRUD co wrapper, nhung web admin chua co page quan tri rieng cho 2 danh muc nay.
- `enterpriseKpiApi.calculateKpi/getCollectorKpi` co wrapper, nhung UI web chua co full flow thao tac.

## 11. Ghi chu ve du lieu mock/placeholder
- Collector: `dashboard`, `map`, `performance` dang co phan du lieu mock.
- Enterprise: `pickup`, `profile` la placeholder.
- Collector: `profile` la placeholder.

---
Tai lieu duoc tong hop tu source frontend hien tai va phu hop voi route/API dang duoc web app goi thuc te.
