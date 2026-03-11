# Project Context

> **Hướng dẫn sử dụng**: File này chứa thông tin context của dự án SWD Backend Service.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project Name** | `SWD Backend Service (Smart Waste Disposal)` |
| **Version** | `0.0.1-SNAPSHOT` |
| **Type** | `Backend API` |
| **Status** | `Development` |
| **Framework** | `Spring Boot 3.5.0` |
| **Java Version** | `21` |

### Description
```
Hệ thống quản lý thu gom rác thải thông minh (Smart Waste Disposal).
Mô hình User tập trung (User Base) mở rộng ra các role (Citizen, Collector, Admin).
Quản lý quy trình từ Báo cáo rác (Waste Report) -> Lập nhiệm vụ (Task) -> Thu gom (Collection Visit) -> Đánh giá & Thưởng (Rewards/KPI).
```

---

## 2. Business Domain

### Domain Overview
```
Waste Management / Environmental Services - Thu gom, tái chế và quản lý hiệu suất nhân viên.
```

### Key Terminology

| Term | Definition |
|------|------------|
| `Service Area` | Khu vực hoạt động, được quản lý bởi Admin/Manager, có biên giới địa lý (geo_boundary). |
| `Citizen` | Người dân thuộc một khu vực, tạo báo cáo rác. |
| `Collector` | Nhân viên thu gom, được gán vào Service Area và nhận Task. |
| `Waste Report` | Báo cáo rác từ Citizen (Location, Weight, Image). |
| `Task` | Nhiệm vụ thu gom sinh ra từ Report, gán cho Collector. |
| `Collection Visit` | Lần thực hiện thu gom thực tế của Collector cho một Task. |
| `KPI` | Chỉ số hiệu suất collector (Weight collected, On-time rate). |
| `Waste Score/Reward` | Hệ thống điểm thưởng dựa trên loại rác và khối lượng. |

---

## 3. User Roles & Personas (Schema: User Base + Extensions)

| Role | Extension Table | Description |
|------|-----------------|-------------|
| **USER** | `users` | Bảng lõi: Login info, status, points. Tất cả role khác tham chiếu vào đây. |
| `ADMIN` | `admin_profile` | Quản trị hệ thống, xử lý khiếu nại (Complaint Resolution), quản lý Service Area. |
| `CITIZEN` | `citizen_profile` | Người dân. Gắn với `Service Area`. Tạo Report, nhận điểm thưởng. |
| `COLLECTOR` | `collector_profile` | Nhân viên thu gom. Gắn với `Service Area`. Nhận Task, cập nhật Collection Visit. |

---

## 4. Core Features

### Feature 1: `User & Identity Management`
- **Schema**: `users`, `citizen_profile`, `collector_profile`, `admin_profile`
- **Logic**: Centralized auth, role-based profiles.

### Feature 2: `Service Area & Capability Management`
- **Schema**: `service_area`, `enterprise_capability`, `enterprise_waste_type`
- **Logic**: 
  1. Admin/Enterprise quản lý Service Area (biên giới, hoạt động).
  2. Cấu hình `EnterpriseCapability`: Loại rác tiếp nhận, công suất handling (kg/day).
  3. Quản lý đội ngũ Collector thuộc khu vực.

### Feature 3: `Waste Reporting & Collection Decision`
- **Schema**: `waste_report` -> `task`
- **Logic**: 
  1. Citizen tạo Report.
  2. Enterprise xem danh sách Report trong khu vực (có gợi ý ưu tiên).
  3. Quyết định: **Accept** (tạo Task) hoặc **Reject** (từ chối, lý do).

### Feature 4: `Task Assignment & Coordination`
- **Schema**: `task`, `task_assignment`
- **Logic**: 
  1. Gán Task cho Collector (manual hoặc auto-suggest).
  2. Theo dõi trạng thái Task realtime (Pending -> Assigned -> In Progress -> Completed).
  3. Điều phối lại nếu Collector quá tải hoặc gặp sự cố.

### Feature 5: `Collection Execution & Evidence`
- **Schema**: `collection_visit`, `evidence_photo`
- **Logic**: Collector thực hiện thu gom, upload ảnh, cập nhật khối lượng thực tế.

### Feature 6: `Rewards & Rules Configuration`
- **Schema**: `waste_score_system`, `citizen_reward_rule`, `reward_transaction`
- **Logic**: 
  1. Enterprise cấu hình `CitizenRewardRule` (điểm/kg, thưởng thêm theo loại rác/thời gian).
  2. Hệ thống tự động tính điểm thưởng cho Citizen khi Task hoàn thành.

### Feature 7: `Performance & Complaints`
- **Schema**: `complaint`, `complaint_resolution`, `collector_kpi_daily`
- **Logic**: 
  1. Xử lý khiếu nại về Collector.
  2. Xem báo cáo KPI Collector (hiệu suất, đúng giờ).

### Feature 8: `Enterprise Analytics`
- **Schema**: Aggregated data from `collection_visit`, `waste_report`
- **Logic**: 
  1. Thống kê khối lượng thu gom theo Loại rác / Khu vực / Thời gian.
  2. Biểu đồ tỉ lệ tái chế.

---

## 5. Development Environment

### Sample Users (Dev Profile)

| Email | Role | Note |
|-------|------|------|
| admin@example.com | ADMIN | Quản lý Service Area HN |
| collector01@example.com | COLLECTOR | Phụ trách khu vực Cầu Giấy |
| citizen01@example.com | CITIZEN | Cư dân khu vực Cầu Giấy |

### Database Configuration

| Profile | Database | URL |
|---------|----------|-----|
| `dev` | PostgreSQL (local) | `jdbc:postgresql://localhost:5432/swd_dev` |
| `deploy` | PostgreSQL (cloud) | Environment variable `DATABASE_URL` |

---

## 6. Project Constraints

- **Geo-Location**: Xử lý tọa độ (lat/long) cho Report và Service Area.
- **Real-time**: Cập nhật trạng thái Task cho Collector.
- **Data Integrity**: Điểm thưởng phải khớp với Collection Visit.

---

## 7. Contact & Resources

| Resource | Link/Contact |
|----------|--------------|
| **Repository** | `https://github.com/ntu254/SWD.git` |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` |
