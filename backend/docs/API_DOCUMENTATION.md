# API Documentation - Recycling Enterprise Platform

> **Phiên bản**: 1.1.0  
> **Cập nhật lần cuối**: 2026-01-31  
> **Base URL**: `http://localhost:8080/api`

---

## 📋 Mục lục

1. [ServiceArea (Khu vực)](#1-servicearea-khu-vực)
2. [WasteType (Loại rác)](#2-wastetype-loại-rác)
3. [Enterprise (Doanh nghiệp)](#3-enterprise-doanh-nghiệp)
4. [EnterpriseCapability (Năng lực xử lý)](#4-enterprisecapability-năng-lực-xử-lý)
5. [Task (Nhiệm vụ thu gom)](#5-task-nhiệm-vụ-thu-gom)
6. [WasteReport (Báo cáo rác)](#6-wastereport-báo-cáo-rác)
7. [RewardRule (Quy tắc điểm thưởng)](#7-rewardrule-quy-tắc-điểm-thưởng)
8. [Analytics (Thống kê)](#8-analytics-thống-kê)
9. [Complaint (Khiếu nại)](#9-complaint-khiếu-nại)
10. [Priority Scoring (Điểm ưu tiên)](#10-priority-scoring-điểm-ưu-tiên)

---

## 1. ServiceArea (Khu vực)

### 1.1 Tạo khu vực mới

```http
POST /api/service-areas
```

**Request Body:**
```json
{
  "name": "Quận 1",
  "description": "Khu vực trung tâm thành phố",
  "boundaryGeoJson": "{\"type\":\"Polygon\",\"coordinates\":[[[106.69,10.77],[106.71,10.77],[106.71,10.79],[106.69,10.79],[106.69,10.77]]]}",
  "status": "ACTIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo ServiceArea thành công",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Quận 1",
    "description": "Khu vực trung tâm thành phố",
    "boundaryGeoJson": "...",
    "status": "ACTIVE",
    "createdAt": "2026-01-31T10:00:00"
  },
  "timestamp": "2026-01-31T10:00:00"
}
```

### 1.2 Lấy danh sách khu vực

```http
GET /api/service-areas?page=0&size=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Quận 1",
        "status": "ACTIVE"
      }
    ],
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## 2. WasteType (Loại rác)

### 2.1 Tạo loại rác mới

```http
POST /api/waste-types
```

**Request Body:**
```json
{
  "name": "Nhựa tái chế",
  "description": "Chai nhựa, túi nhựa sạch",
  "basePointsPerKg": 10.0,
  "iconUrl": "https://example.com/icons/plastic.png"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo WasteType thành công",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Nhựa tái chế",
    "description": "Chai nhựa, túi nhựa sạch",
    "basePointsPerKg": 10.0,
    "iconUrl": "https://example.com/icons/plastic.png",
    "status": "ACTIVE",
    "createdAt": "2026-01-31T10:05:00"
  }
}
```

### 2.2 Lấy danh sách loại rác

```http
GET /api/waste-types
```

---

## 3. Enterprise (Doanh nghiệp)

### 3.1 Tạo doanh nghiệp mới

```http
POST /api/enterprises
```

**Headers:**
```
X-User-Id: 770e8400-e29b-41d4-a716-446655440002
```

**Request Body:**
```json
{
  "name": "Công ty Xanh Sạch",
  "description": "Chuyên thu gom và tái chế rác thải",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "0901234567",
  "email": "contact@xanhsach.vn",
  "taxCode": "0123456789",
  "primaryAreaId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tạo doanh nghiệp thành công",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "name": "Công ty Xanh Sạch",
    "ownerId": "770e8400-e29b-41d4-a716-446655440002",
    "ownerName": "Nguyễn Văn A",
    "primaryAreaId": "550e8400-e29b-41d4-a716-446655440000",
    "primaryAreaName": "Quận 1",
    "status": "ACTIVE",
    "createdAt": "2026-01-31T10:10:00"
  }
}
```

### 3.2 Lấy thông tin doanh nghiệp của tôi

```http
GET /api/enterprises/me
```

**Headers:**
```
X-User-Id: 770e8400-e29b-41d4-a716-446655440002
```

---

## 4. EnterpriseCapability (Năng lực xử lý)

### 4.1 Thêm năng lực xử lý cho doanh nghiệp

```http
POST /api/enterprises/{enterpriseId}/capabilities
```

**Request Body:**
```json
{
  "areaId": "550e8400-e29b-41d4-a716-446655440000",
  "wasteTypeId": "660e8400-e29b-41d4-a716-446655440001",
  "dailyCapacityKg": 500.0,
  "pricePerKg": 5.0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Thêm năng lực thành công",
  "data": {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "enterpriseId": "880e8400-e29b-41d4-a716-446655440003",
    "areaId": "550e8400-e29b-41d4-a716-446655440000",
    "areaName": "Quận 1",
    "wasteTypeId": "660e8400-e29b-41d4-a716-446655440001",
    "wasteTypeName": "Nhựa tái chế",
    "dailyCapacityKg": 500.0,
    "usedCapacityKg": 0.0,
    "availableCapacityKg": 500.0,
    "pricePerKg": 5.0,
    "status": "ACTIVE"
  }
}
```

---

## 5. Task (Nhiệm vụ thu gom)

### 5.1 Tạo nhiệm vụ mới

```http
POST /api/tasks
```

**Request Body:**
```json
{
  "enterpriseId": "880e8400-e29b-41d4-a716-446655440003",
  "areaId": "550e8400-e29b-41d4-a716-446655440000",
  "wasteTypeId": "660e8400-e29b-41d4-a716-446655440001",
  "estimatedWeightKg": 25.0,
  "locationText": "Số 45, Đường Lê Lợi, Quận 1",
  "lat": 10.7751,
  "lng": 106.7004,
  "notes": "Vui lòng gọi trước khi đến",
  "priority": "NORMAL",
  "scheduledAt": "2026-02-01T09:00:00"
}
```

### 5.2 Gán nhiệm vụ cho Collector

```http
POST /api/tasks/assign
```

### 5.3 Collector chấp nhận nhiệm vụ

```http
PATCH /api/tasks/assignments/{assignmentId}/accept
```

### 5.4 Collector hoàn thành nhiệm vụ

```http
PATCH /api/tasks/assignments/{assignmentId}/complete?collectedWeightKg=24.5
```

---

## 6. WasteReport (Báo cáo rác)

### 6.1 Citizen tạo báo cáo rác

```http
POST /api/waste-reports
```

### 6.2 Lấy danh sách báo cáo đang chờ xử lý

```http
GET /api/waste-reports/pending?page=0&size=10
```

### 6.3 Enterprise chấp nhận báo cáo

```http
PATCH /api/waste-reports/{id}/accept
```

### 6.4 Enterprise từ chối báo cáo

```http
PATCH /api/waste-reports/{id}/reject?reason=Khu vực không nằm trong phạm vi phục vụ
```

---

## 7. RewardRule (Quy tắc điểm thưởng)

### 7.1 Tạo quy tắc tính điểm

```http
POST /api/reward-rules
```

### 7.2 Tính điểm thưởng

```http
POST /api/reward-rules/calculate
```

### 7.3 Lấy các quy tắc đang hoạt động

```http
GET /api/reward-rules/active
```

---

## 8. Analytics (Thống kê)

### 8.1 Lấy dashboard thống kê của Enterprise

```http
GET /api/analytics/enterprise/{enterpriseId}/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTasks": 150,
      "completedTasks": 120,
      "pendingTasks": 30,
      "totalWeightKg": 5000.0,
      "totalRevenue": 25000.0
    },
    "wasteTypeBreakdown": [
      {"wasteTypeName": "Nhựa", "totalWeightKg": 2000.0, "percentage": 40.0}
    ],
    "areaBreakdown": [
      {"areaName": "Quận 1", "taskCount": 50, "totalWeightKg": 1500.0}
    ],
    "dailyStats": [
      {"date": "2026-01-30", "taskCount": 10, "weightKg": 250.0}
    ]
  }
}
```

---

## 9. Complaint (Khiếu nại)

### 9.1 Citizen tạo khiếu nại mới

```http
POST /api/complaints/citizen/{citizenId}
```

**Request Body:**
```json
{
  "title": "Collector không đến đúng lịch",
  "description": "Đã đặt lịch 9h nhưng collector không đến",
  "category": "SERVICE_ISSUE",
  "priority": "High",
  "collectorId": "bb0e8400-e29b-41d4-a716-446655440006",
  "taskAssignmentId": "cc0e8400-e29b-41d4-a716-446655440007"
}
```

### 9.2 Lấy danh sách khiếu nại theo Enterprise

```http
GET /api/complaints/enterprise/{enterpriseId}?page=0&size=10
```

### 9.3 Lấy danh sách khiếu nại theo Collector

```http
GET /api/complaints/collector/{collectorId}?page=0&size=10
```

### 9.4 Đếm số khiếu nại của Collector

```http
GET /api/complaints/collector/{collectorId}/count
```

### 9.5 Bắt đầu điều tra khiếu nại

```http
PATCH /api/complaints/{complaintId}/investigate?adminId={adminId}
```

### 9.6 Giải quyết khiếu nại

```http
PATCH /api/complaints/{complaintId}/resolve?adminId={adminId}&response={response}
```

### 9.7 Từ chối khiếu nại

```http
PATCH /api/complaints/{complaintId}/reject?adminId={adminId}&reason={reason}
```

### 9.8 Lấy thống kê khiếu nại (Admin)

```http
GET /api/complaints/admin/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "PENDING": 10,
    "INVESTIGATING": 5,
    "RESOLVED": 50,
    "REJECTED": 3,
    "total": 68
  }
}
```

---

## 10. Priority Scoring (Điểm ưu tiên)

### 10.1 Lấy danh sách báo cáo đề xuất theo ưu tiên

```http
GET /api/waste-reports/suggested?enterpriseId={id}&areaId={id}&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Danh sách báo cáo đề xuất theo độ ưu tiên",
  "data": [
    {
      "reportId": "ee0e8400-e29b-41d4-a716-446655440009",
      "citizenName": "Lê Thị C",
      "areaName": "Quận 1",
      "wasteTypeName": "Nhựa tái chế",
      "estimatedWeightKg": 45.0,
      "priority": "HIGH",
      "status": "PENDING",
      "priorityScore": 78.5,
      "priorityReason": "Khối lượng lớn, Ưu tiên cao từ người dùng",
      "createdAt": "2026-01-30T08:00:00"
    }
  ]
}
```

### 10.2 Tính điểm ưu tiên cho báo cáo

```http
GET /api/waste-reports/{id}/priority-score
```

**Response:**
```json
{
  "success": true,
  "message": "Điểm ưu tiên của báo cáo",
  "data": 78.5
}
```

> **Công thức tính điểm ưu tiên:**
> - Weight (30%): Khối lượng càng lớn → điểm cao hơn
> - Priority (25%): URGENT=100, HIGH=75, NORMAL=50, LOW=25
> - Age (25%): Báo cáo cũ hơn → điểm cao hơn (max 7 ngày = 100)
> - WasteType (20%): Loại rác giá trị cao → điểm cao hơn

---

## 📌 Mã lỗi phổ biến

| HTTP Code | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| 400 | Bad Request | Thiếu trường bắt buộc |
| 401 | Unauthorized | Thiếu X-User-Id header |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | ID không tồn tại |
| 409 | Conflict | Tên đã tồn tại |
| 500 | Internal Server Error | Lỗi hệ thống |

---

## 📌 Luồng trạng thái

### Task Status Flow
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
                 ↘ CANCELLED
```

### WasteReport Status Flow
```
PENDING → ACCEPTED → (tạo Task)
       ↘ REJECTED
       ↘ CANCELLED (by Citizen)
```

### Complaint Status Flow
```
PENDING → INVESTIGATING → RESOLVED
                       ↘ REJECTED
```

---

## 📌 Ghi chú quan trọng

1. **UUID Format**: Tất cả ID sử dụng định dạng UUID v4
2. **Pagination**: Sử dụng `page` (0-indexed) và `size` (default: 10)
3. **Date Format**: ISO 8601 (`2026-01-31T10:00:00`)
4. **Daily Capacity Reset**: usedCapacityKg reset về 0 lúc 00:00 (Asia/Ho_Chi_Minh)
