# Feature Documentation: Complaint & Notification

## 📋 Mục lục

1. [Domain Overview](#1-domain-overview)
2. [Business Rules](#2-business-rules)
3. [API Contract - Complaint](#3-api-contract---complaint)
4. [API Contract - Notification](#4-api-contract---notification)
5. [Test Cases](#5-test-cases)

---

# 1. Domain Overview

## 1.1 Tổng quan hệ thống

Hệ thống SWD (Smart Waste Disposal) cung cấp các chức năng quản lý khiếu nại (Complaint) và thông báo (Notification) để hỗ trợ giao tiếp giữa người dùng và quản trị viên.

## 1.2 Actors (Các vai trò)

| Actor | Mô tả | Quyền hạn |
|-------|-------|-----------|
| **CITIZEN** | Người dân sử dụng dịch vụ | Tạo/xem khiếu nại của mình, nhận thông báo |
| **COLLECTOR** | Nhân viên thu gom | Nhận thông báo công việc |
| **ENTERPRISE** | Doanh nghiệp đối tác | Nhận thông báo hợp tác |
| **ADMIN** | Quản trị viên hệ thống | Quản lý toàn bộ khiếu nại và thông báo |

## 1.3 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    USER     │       │   CITIZEN   │       │  COMPLAINT  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │◄──────│ user_id     │◄──────│ citizen_id  │
│ email       │  1:1  │ address     │  1:N  │ title       │
│ password    │       │ points      │       │ description │
│ firstName   │       │ tier        │       │ category    │
│ lastName    │       └─────────────┘       │ status      │
│ role        │                             │ priority    │
│ createdAt   │                             │ adminResponse│
└─────────────┘                             │ resolvedBy  │──────┐
      │                                     │ resolvedAt  │      │
      │                                     └─────────────┘      │
      │                                                          │
      │ 1:N  ┌─────────────────┐                                │
      └─────►│  NOTIFICATION   │                                │
             ├─────────────────┤                                │
             │ id              │                                │
             │ title           │◄───────────────────────────────┘
             │ content         │           (Admin resolves)
             │ type            │
             │ targetAudience  │
             │ priority        │
             │ isActive        │
             │ createdBy       │
             │ startDate       │
             │ endDate         │
             └─────────────────┘
```

## 1.4 Complaint States (Trạng thái khiếu nại)

```
                    ┌───────────┐
                    │  PENDING  │ ◄── Citizen tạo mới
                    └─────┬─────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             │             ▼
    ┌───────────────┐     │     ┌───────────────┐
    │ IN_PROGRESS   │     │     │   REJECTED    │ ◄── Admin từ chối
    └───────┬───────┘     │     └───────────────┘
            │             │
            │             │
            ▼             │
    ┌───────────────┐     │
    │   RESOLVED    │◄────┘ ◄── Admin giải quyết
    └───────────────┘
```

## 1.5 Notification Types (Loại thông báo)

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `General` | Thông báo chung | Thông tin cập nhật hệ thống |
| `Maintenance` | Bảo trì | Lịch bảo trì định kỳ |
| `Update` | Cập nhật | Cập nhật tính năng mới |
| `Promotion` | Khuyến mãi | Chương trình ưu đãi |
| `Alert` | Cảnh báo | Cảnh báo khẩn cấp |

## 1.6 Target Audience (Đối tượng nhận)

| Value | Mô tả |
|-------|-------|
| `All` | Tất cả người dùng |
| `Citizen` | Chỉ người dân |
| `Collector` | Chỉ nhân viên thu gom |
| `Enterprise` | Chỉ doanh nghiệp |

---

# 2. Business Rules

## 2.1 Complaint Business Rules

### BR-C01: Tạo khiếu nại
- **Rule:** Chỉ Citizen đã đăng ký mới có thể tạo khiếu nại
- **Validation:** `citizenId` phải tồn tại trong hệ thống
- **Default values:**
  - `status` = "Pending"
  - `category` = "OTHER" (nếu không cung cấp)
  - `priority` = "Normal" (nếu không cung cấp)

### BR-C02: Xem khiếu nại
- **Rule:** Citizen chỉ có thể xem khiếu nại của chính mình
- **Rule:** Admin có thể xem tất cả khiếu nại

### BR-C03: Cập nhật trạng thái khiếu nại
- **Rule:** Chỉ Admin mới có thể cập nhật trạng thái
- **Rule:** Khi status = "Resolved" hoặc "Rejected" → tự động set `resolvedAt` = current timestamp
- **Rule:** Khi cập nhật, phải cung cấp `adminResponse` để giải thích

### BR-C04: Xóa khiếu nại
- **Rule:** Chỉ Admin mới có thể xóa khiếu nại
- **Rule:** Không có soft delete, xóa vĩnh viễn

### BR-C05: Real-time notification
- **Rule:** Khi có khiếu nại mới → gửi SSE event đến tất cả Admin
- **Rule:** Khi Admin cập nhật status → gửi SSE event đến Citizen tương ứng

---

## 2.2 Notification Business Rules

### BR-N01: Tạo thông báo
- **Rule:** Chỉ Admin mới có quyền tạo thông báo
- **Validation:** `adminId` phải tồn tại và có role ADMIN
- **Default values:**
  - `isActive` = true
  - `type` = "General" (nếu không cung cấp)
  - `targetAudience` = "All" (nếu không cung cấp)
  - `priority` = "Normal" (nếu không cung cấp)

### BR-N02: Hiển thị thông báo
- **Rule:** Chỉ hiển thị thông báo có `isActive` = true
- **Rule:** Lọc theo `startDate` ≤ now và (`endDate` ≥ now hoặc `endDate` = null)
- **Rule:** Lọc theo `targetAudience` phù hợp với role của user

### BR-N03: Toggle trạng thái
- **Rule:** Chỉ Admin mới có thể toggle `isActive`
- **Rule:** Toggle sẽ đảo ngược giá trị hiện tại

### BR-N04: Real-time broadcast
- **Rule:** Khi tạo thông báo mới → gửi SSE event đến audience phù hợp
- **Rule:** Khi cập nhật thông báo đang active → gửi SSE event update

### BR-N05: Thời hạn thông báo
- **Rule:** `startDate` và `endDate` là optional
- **Rule:** Nếu có cả hai, `startDate` phải ≤ `endDate`

---

# 3. API Contract - Complaint

## 3.1 Create Complaint

### Request
```http
POST /api/complaints/citizen/{citizenId}
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Không nhận được điểm thưởng",
  "description": "Tôi đã phân loại rác đúng cách nhưng không nhận được điểm",
  "category": "POINTS_ERROR",
  "priority": "High"
}
```

### Request Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | String | ✅ Yes | max 255 chars | Tiêu đề khiếu nại |
| `description` | String | ✅ Yes | max 2000 chars | Nội dung chi tiết |
| `category` | String | ❌ No | enum | Danh mục: BUG, FEATURE, POINTS_ERROR, COLLECTION_ISSUE, OTHER |
| `priority` | String | ❌ No | enum | Độ ưu tiên: Low, Normal, High, Urgent |

### Response - Success (201 Created)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "citizenId": 1,
    "citizenName": "Nguyễn Văn A",
    "citizenEmail": "nguyenvana@example.com",
    "title": "Không nhận được điểm thưởng",
    "description": "Tôi đã phân loại rác đúng cách nhưng không nhận được điểm",
    "category": "POINTS_ERROR",
    "status": "Pending",
    "priority": "High",
    "adminResponse": null,
    "resolvedById": null,
    "resolvedByName": null,
    "resolvedAt": null,
    "createdAt": "2024-01-25T10:30:00",
    "updatedAt": "2024-01-25T10:30:00"
  }
}
```

### Response - Error (404 Not Found)
```json
{
  "success": false,
  "message": "Citizen not found with id: '999'",
  "data": null
}
```

---

## 3.2 Get Complaints by Citizen

### Request
```http
GET /api/complaints/citizen/{citizenId}?page=0&size=10&sortBy=createdAt&sortDir=desc
Authorization: Bearer {token}
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 0 | Số trang (0-indexed) |
| `size` | int | 10 | Số items mỗi trang |
| `sortBy` | String | createdAt | Field để sắp xếp |
| `sortDir` | String | desc | Hướng sắp xếp: asc/desc |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "citizenId": 1,
        "title": "Không nhận được điểm thưởng",
        "status": "Pending",
        "priority": "High",
        "createdAt": "2024-01-25T10:30:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true
  }
}
```

---

## 3.3 Get All Complaints (Admin)

### Request
```http
GET /api/complaints/admin?status=Pending&category=POINTS_ERROR&priority=High&page=0&size=10
Authorization: Bearer {admin_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | String | ❌ | Filter: Pending, In_Progress, Resolved, Rejected |
| `category` | String | ❌ | Filter: BUG, FEATURE, POINTS_ERROR, etc. |
| `priority` | String | ❌ | Filter: Low, Normal, High, Urgent |
| `page` | int | ❌ | Page number |
| `size` | int | ❌ | Page size |

---

## 3.4 Update Complaint Status (Admin)

### Request
```http
PUT /api/complaints/admin/{complaintId}/status
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "status": "Resolved",
  "adminResponse": "Đã kiểm tra và cộng lại điểm cho bạn. Xin lỗi vì sự bất tiện.",
  "resolvedById": 1
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | String | ✅ Yes | Trạng thái mới |
| `adminResponse` | String | ❌ No | Phản hồi từ Admin |
| `resolvedById` | Long | ❌ No | ID Admin xử lý |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "status": "Resolved",
    "adminResponse": "Đã kiểm tra và cộng lại điểm cho bạn. Xin lỗi vì sự bất tiện.",
    "resolvedById": 1,
    "resolvedByName": "Admin User",
    "resolvedAt": "2024-01-25T14:00:00"
  }
}
```

---

## 3.5 Get Complaint Statistics (Admin)

### Request
```http
GET /api/complaints/admin/statistics
Authorization: Bearer {admin_token}
```

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "Pending": 5,
    "In_Progress": 3,
    "Resolved": 20,
    "Rejected": 2,
    "total": 30
  }
}
```

---

## 3.6 Delete Complaint (Admin)

### Request
```http
DELETE /api/complaints/admin/{complaintId}
Authorization: Bearer {admin_token}
```

### Response - Success (204 No Content)
```
(Empty body)
```

### Response - Error (404 Not Found)
```json
{
  "success": false,
  "message": "Complaint not found with id: '999'",
  "data": null
}
```

---

# 4. API Contract - Notification

## 4.1 Create Notification (Admin)

### Request
```http
POST /api/notifications/admin/{adminId}
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "title": "Thông báo bảo trì hệ thống",
  "content": "Hệ thống sẽ được bảo trì vào ngày 30/01/2024 từ 00:00 đến 06:00",
  "type": "Maintenance",
  "targetAudience": "All",
  "priority": "High",
  "startDate": "2024-01-25T00:00:00",
  "endDate": "2024-01-30T23:59:59"
}
```

### Request Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `title` | String | ✅ Yes | max 255 chars | Tiêu đề thông báo |
| `content` | String | ✅ Yes | max 5000 chars | Nội dung thông báo |
| `type` | String | ❌ No | enum | Loại: General, Maintenance, Update, Promotion, Alert |
| `targetAudience` | String | ❌ No | enum | Đối tượng: All, Citizen, Collector, Enterprise |
| `priority` | String | ❌ No | enum | Độ ưu tiên: Low, Normal, High, Urgent |
| `startDate` | DateTime | ❌ No | ISO 8601 | Thời gian bắt đầu hiển thị |
| `endDate` | DateTime | ❌ No | ISO 8601 | Thời gian kết thúc hiển thị |

### Response - Success (201 Created)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "title": "Thông báo bảo trì hệ thống",
    "content": "Hệ thống sẽ được bảo trì vào ngày 30/01/2024 từ 00:00 đến 06:00",
    "type": "Maintenance",
    "targetAudience": "All",
    "priority": "High",
    "isActive": true,
    "startDate": "2024-01-25T00:00:00",
    "endDate": "2024-01-30T23:59:59",
    "createdById": 1,
    "createdByName": "Admin User",
    "createdAt": "2024-01-25T10:00:00",
    "updatedAt": "2024-01-25T10:00:00"
  }
}
```

---

## 4.2 Get All Notifications (Admin)

### Request
```http
GET /api/notifications/admin?type=Maintenance&targetAudience=All&isActive=true&page=0&size=10
Authorization: Bearer {admin_token}
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | String | ❌ | Filter by type |
| `targetAudience` | String | ❌ | Filter by audience |
| `isActive` | Boolean | ❌ | Filter by active status |
| `page` | int | ❌ | Page number |
| `size` | int | ❌ | Page size |

---

## 4.3 Update Notification (Admin)

### Request
```http
PUT /api/notifications/admin/{notificationId}
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "title": "Thông báo bảo trì hệ thống - CẬP NHẬT",
  "content": "Lịch bảo trì đã được dời sang ngày 31/01/2024",
  "isActive": true
}
```

### Request Fields (All Optional)
| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Tiêu đề mới |
| `content` | String | Nội dung mới |
| `type` | String | Loại mới |
| `targetAudience` | String | Đối tượng mới |
| `priority` | String | Độ ưu tiên mới |
| `isActive` | Boolean | Trạng thái active |
| `startDate` | DateTime | Thời gian bắt đầu mới |
| `endDate` | DateTime | Thời gian kết thúc mới |

---

## 4.4 Toggle Notification Status (Admin)

### Request
```http
PATCH /api/notifications/admin/{notificationId}/toggle
Authorization: Bearer {admin_token}
```

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "isActive": false,
    "...": "..."
  }
}
```

---

## 4.5 Get Active Notifications for User

### Request
```http
GET /api/notifications/user/{role}?page=0&size=10
Authorization: Bearer {token}
```

### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | String | User role: Citizen, Collector, Enterprise |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Thông báo bảo trì hệ thống",
        "content": "...",
        "type": "Maintenance",
        "priority": "High",
        "createdAt": "2024-01-25T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

---

## 4.6 Count Active Notifications

### Request
```http
GET /api/notifications/count
```

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Success",
  "data": 5
}
```

---

# 5. Test Cases

## 5.1 Complaint Test Cases

### TC-C01: Tạo khiếu nại thành công
| ID | TC-C01 |
|----|--------|
| **Mô tả** | Citizen tạo khiếu nại mới với đầy đủ thông tin |
| **Precondition** | Citizen đã đăng nhập |
| **Input** | title, description, category, priority |
| **Expected Result** | HTTP 201, complaint được tạo với status=Pending |
| **Priority** | High |

### TC-C02: Tạo khiếu nại - Citizen không tồn tại
| ID | TC-C02 |
|----|--------|
| **Mô tả** | Tạo khiếu nại với citizenId không tồn tại |
| **Input** | citizenId = 999 (không tồn tại) |
| **Expected Result** | HTTP 404, message "Citizen not found" |
| **Priority** | High |

### TC-C03: Tạo khiếu nại - Title trống
| ID | TC-C03 |
|----|--------|
| **Mô tả** | Tạo khiếu nại với title rỗng |
| **Input** | title = "" |
| **Expected Result** | HTTP 400, validation error |
| **Priority** | Medium |

### TC-C04: Xem khiếu nại - Chỉ của mình
| ID | TC-C04 |
|----|--------|
| **Mô tả** | Citizen A không thể xem khiếu nại của Citizen B |
| **Precondition** | Citizen A đăng nhập |
| **Input** | GET /api/complaints/citizen/{citizenB_id} |
| **Expected Result** | HTTP 403 Forbidden |
| **Priority** | High |

### TC-C05: Admin cập nhật status thành Resolved
| ID | TC-C05 |
|----|--------|
| **Mô tả** | Admin cập nhật status khiếu nại thành Resolved |
| **Precondition** | Complaint tồn tại, Admin đăng nhập |
| **Input** | status = "Resolved", adminResponse = "..." |
| **Expected Result** | HTTP 200, resolvedAt được set tự động |
| **Priority** | High |

### TC-C06: Admin cập nhật - Complaint không tồn tại
| ID | TC-C06 |
|----|--------|
| **Mô tả** | Admin cập nhật complaint không tồn tại |
| **Input** | complaintId = 999 |
| **Expected Result** | HTTP 404, message "Complaint not found" |
| **Priority** | Medium |

### TC-C07: Phân trang khiếu nại
| ID | TC-C07 |
|----|--------|
| **Mô tả** | Lấy danh sách khiếu nại với phân trang |
| **Input** | page=0, size=5 |
| **Expected Result** | HTTP 200, trả về max 5 items |
| **Priority** | Medium |

### TC-C08: Lọc khiếu nại theo status
| ID | TC-C08 |
|----|--------|
| **Mô tả** | Admin lọc khiếu nại theo status=Pending |
| **Input** | status=Pending |
| **Expected Result** | HTTP 200, chỉ trả về complaints có status=Pending |
| **Priority** | Medium |

### TC-C09: SSE - Thông báo khi có complaint mới
| ID | TC-C09 |
|----|--------|
| **Mô tả** | Admin nhận SSE event khi có complaint mới |
| **Precondition** | Admin đang subscribe SSE |
| **Action** | Citizen tạo complaint mới |
| **Expected Result** | Admin nhận event type "NEW_COMPLAINT" |
| **Priority** | High |

### TC-C10: SSE - Thông báo khi status thay đổi
| ID | TC-C10 |
|----|--------|
| **Mô tả** | Citizen nhận SSE event khi complaint được resolve |
| **Precondition** | Citizen đang subscribe SSE |
| **Action** | Admin resolve complaint |
| **Expected Result** | Citizen nhận event type "COMPLAINT_UPDATE" |
| **Priority** | High |

---

## 5.2 Notification Test Cases

### TC-N01: Tạo thông báo thành công
| ID | TC-N01 |
|----|--------|
| **Mô tả** | Admin tạo thông báo mới |
| **Precondition** | Admin đăng nhập |
| **Input** | title, content, type, targetAudience |
| **Expected Result** | HTTP 201, isActive=true |
| **Priority** | High |

### TC-N02: Tạo thông báo - Admin không tồn tại
| ID | TC-N02 |
|----|--------|
| **Mô tả** | Tạo thông báo với adminId không tồn tại |
| **Input** | adminId = 999 |
| **Expected Result** | HTTP 404, message "Admin not found" |
| **Priority** | Medium |

### TC-N03: Toggle trạng thái thông báo
| ID | TC-N03 |
|----|--------|
| **Mô tả** | Admin toggle isActive từ true sang false |
| **Precondition** | Notification với isActive=true |
| **Action** | PATCH toggle |
| **Expected Result** | HTTP 200, isActive=false |
| **Priority** | Medium |

### TC-N04: User xem thông báo - Lọc theo role
| ID | TC-N04 |
|----|--------|
| **Mô tả** | Citizen chỉ thấy thông báo cho Citizen và All |
| **Precondition** | Có notification cho Citizen và Collector |
| **Input** | GET /notifications/user/Citizen |
| **Expected Result** | Chỉ trả về notification với targetAudience = Citizen hoặc All |
| **Priority** | High |

### TC-N05: User xem thông báo - Lọc theo thời gian
| ID | TC-N05 |
|----|--------|
| **Mô tả** | Chỉ hiển thị thông báo trong thời gian hiệu lực |
| **Precondition** | Notification có startDate=yesterday, endDate=tomorrow |
| **Expected Result** | Notification được hiển thị |
| **Priority** | High |

### TC-N06: User xem thông báo - Hết hạn
| ID | TC-N06 |
|----|--------|
| **Mô tả** | Không hiển thị thông báo đã hết hạn |
| **Precondition** | Notification có endDate=yesterday |
| **Expected Result** | Notification không được hiển thị |
| **Priority** | High |

### TC-N07: SSE - Broadcast thông báo mới
| ID | TC-N07 |
|----|--------|
| **Mô tả** | User nhận SSE event khi có thông báo mới |
| **Precondition** | Citizen đang subscribe SSE |
| **Action** | Admin tạo notification cho All |
| **Expected Result** | Citizen nhận event type "NOTIFICATION" |
| **Priority** | High |

### TC-N08: Đếm số thông báo active
| ID | TC-N08 |
|----|--------|
| **Mô tả** | Đếm số thông báo đang active |
| **Precondition** | 3 notifications active, 2 inactive |
| **Expected Result** | HTTP 200, data = 3 |
| **Priority** | Low |

### TC-N09: Xóa thông báo
| ID | TC-N09 |
|----|--------|
| **Mô tả** | Admin xóa thông báo |
| **Precondition** | Notification tồn tại |
| **Action** | DELETE /notifications/admin/{id} |
| **Expected Result** | HTTP 204 No Content |
| **Priority** | Medium |

### TC-N10: Cập nhật thông báo - Partial update
| ID | TC-N10 |
|----|--------|
| **Mô tả** | Admin chỉ cập nhật một số field |
| **Input** | title = "New Title" (chỉ title) |
| **Expected Result** | HTTP 200, chỉ title thay đổi, các field khác giữ nguyên |
| **Priority** | Medium |

---

## 5.3 Test Coverage Summary

| Feature | Total TCs | Priority High | Priority Medium | Priority Low |
|---------|-----------|---------------|-----------------|--------------|
| Complaint | 10 | 5 | 5 | 0 |
| Notification | 10 | 4 | 5 | 1 |
| **Total** | **20** | **9** | **10** | **1** |

---

## 6. Error Codes Summary

| HTTP Code | Exception | Mô tả |
|-----------|-----------|-------|
| 200 | - | Thành công |
| 201 | - | Tạo thành công |
| 204 | - | Xóa thành công |
| 400 | BadRequestException | Request không hợp lệ |
| 401 | UnauthorizedException | Chưa đăng nhập |
| 403 | - | Không có quyền |
| 404 | ResourceNotFoundException | Không tìm thấy resource |
| 500 | Exception | Lỗi server |

---

## 7. SSE Events Summary

| Event Type | Trigger | Target | Payload |
|------------|---------|--------|---------|
| `NEW_COMPLAINT` | Citizen tạo complaint | Admin | id, title, category, priority |
| `COMPLAINT_UPDATE` | Admin cập nhật status | Citizen gửi complaint | id, title, status, adminResponse |
| `NOTIFICATION` | Admin tạo notification | targetAudience | NotificationResponse |
| `NOTIFICATION_UPDATE` | Admin cập nhật notification | targetAudience | NotificationResponse |
| `HEARTBEAT` | Mỗi 30 giây | All | "ping" |
