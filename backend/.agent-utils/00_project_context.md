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
Hệ thống quản lý thu gom rác thải thông minh (Smart Waste Disposal), 
cho phép Citizen báo cáo rác, Enterprise điều phối thu gom, 
Collector thực hiện thu gom, và Administrator quản lý toàn bộ hệ thống.
Bao gồm quản lý phần thưởng đổi điểm cho người dùng.
```

---

## 2. Business Domain

### Domain Overview
```
Waste Management / Environmental Services - Thu gom và tái chế rác thải
```

### Key Terminology

| Term | Definition |
|------|------------|
| `Citizen` | Người dân báo cáo rác cần thu gom |
| `Enterprise` | Doanh nghiệp tái chế xử lý rác |
| `Collector` | Nhân viên thu gom thuộc Enterprise |
| `Waste Report` | Báo cáo rác do Citizen tạo |
| `Collection Request` | Yêu cầu thu gom được tạo từ Report |
| `Complaint` | Khiếu nại từ user về hệ thống hoặc collector |
| `Notification` | Thông báo hệ thống |
| `Reward Item` | Phần thưởng có thể đổi bằng điểm |
| `Reward Redemption` | Lịch sử đổi thưởng của Citizen |
| `SSE` | Server-Sent Events - realtime notifications |

---

## 3. User Roles & Personas

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `ADMIN` | Quản trị viên hệ thống | CRUD users, enterprises, rewards, complaints, notifications, dashboard |
| `CITIZEN` | Người dân sử dụng app | Tạo report, theo dõi trạng thái, đổi điểm thưởng, gửi complaint |
| `COLLECTOR` | Nhân viên thu gom | Nhận/cập nhật collection requests |
| `ENTERPRISE` | Doanh nghiệp tái chế | Quản lý collectors, tiếp nhận requests |

---

## 4. Core Features

### Feature 1: `Authentication`
- **Description**: Đăng ký, đăng nhập với JWT token
- **Status**: `Done`
- **Priority**: `High`
- **Endpoints**: `/api/auth/register`, `/api/auth/login`

### Feature 2: `Complaint Management`
- **Description**: CRUD complaints với filter, pagination, statistics
- **Status**: `Done`
- **Priority**: `High`
- **Roles**: CITIZEN (create), ADMIN (manage)

### Feature 3: `Notification Management`
- **Description**: CRUD notifications với target audience, SSE broadcast
- **Status**: `Done`
- **Priority**: `High`
- **Roles**: ADMIN (create/manage), USER (view)

### Feature 4: `Server-Sent Events (SSE)`
- **Description**: Real-time thông báo via SSE
- **Status**: `Done`
- **Priority**: `Medium`

### Feature 5: `Reward Redemption Management` ⭐ CURRENT
- **Description**: Admin quản lý phần thưởng đổi điểm (CRUD RewardItem, approve/reject RewardRedemption)
- **Status**: `In Progress`
- **Priority**: `High`
- **Tables**: `reward_item`, `reward_redemption`

### Feature 6: `Waste Report Management`
- **Description**: Citizen báo cáo rác với ảnh, GPS, phân loại
- **Status**: `Planned`
- **Priority**: `High`

### Feature 7: `Collection Request Management`
- **Description**: Enterprise tiếp nhận và phân công collector
- **Status**: `Planned`
- **Priority**: `High`

---

## 5. Development Environment

### Sample Users (Dev Profile)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| john@example.com | citizen123 | CITIZEN |
| jane@example.com | citizen123 | CITIZEN |
| bob@example.com | citizen123 | CITIZEN |

### Database Configuration

| Profile | Database | URL |
|---------|----------|-----|
| `dev` | PostgreSQL (local) | `jdbc:postgresql://localhost:5432/swd_dev` |
| `deploy` | PostgreSQL (cloud) | Environment variable `DATABASE_URL` |

---

## 6. External Dependencies

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| `PostgreSQL 15+` | Database chính | JDBC |
| `SSE (Server-Sent Events)` | Real-time notifications | Built-in |
| `JWT (jjwt 0.11.5)` | Authentication | Library |
| `SpringDoc OpenAPI 2.3.0` | API Documentation | Library |

---

## 7. Project Constraints

- **Performance**: Response time < 500ms
- **Security**: JWT authentication, Role-based access control, BCrypt password
- **CORS**: Configured for `localhost:3000`, `localhost:5173`

---

## 8. Contact & Resources

| Resource | Link/Contact |
|----------|--------------|
| **Repository** | `https://github.com/ntu254/SWD.git` |
| **Swagger UI** | `http://localhost:8080/swagger-ui.html` |
| **API Docs** | `http://localhost:8080/v3/api-docs` |
