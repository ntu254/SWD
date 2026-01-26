# API Documentation

> [!NOTE]
> This documentation covers the **existing** modules in the codebase: Authentication, User Management, Rewards, Complaints, Notifications, and SSE. Modules not present in the current source code (Program, Quiz) are excluded.

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Reward System](#reward-system)
4. [Complaint Management](#complaint-management)
5. [Notification System](#notification-system)
6. [Real-time Events (SSE)](#real-time-events-sse)

---

## Authentication
Base URL: `/api/v1/auth`

### 1. Register User
Register a new user account.
- **URL**: `/register`
- **Method**: `POST`
- **Public Access**

**Request Body** (`RegisterRequest`):
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "role": "CITIZEN", // Optional: CITIZEN (default) or ENTERPRISE
  "phone": "1234567890",
  "avatarUrl": "http://example.com/avatar.jpg"
}
```

**Response** (`AuthResponse`):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJh...",
    "tokenType": "Bearer",
    "user": {
      "id": "uuid-string",
      "email": "john.doe@example.com",
      "fullName": "John Doe",
      "role": "CITIZEN"
    }
  }
}
```

### 2. Login
Authenticate user and retrieve JWT token.
- **URL**: `/login`
- **Method**: `POST`
- **Public Access**

**Request Body** (`LoginRequest`):
```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response** (`AuthResponse`):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJh...",
    "tokenType": "Bearer",
    "user": { ... }
  }
}
```

---

## User Management

### Admin Endpoints
Base URL: `/api/admin/users`
**Role Required**: `ADMIN`

#### 1. Create User (Admin)
- **URL**: `/`
- **Method**: `POST`

**Request Body** (`CreateUserRequest`):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@enterprise.com",
  "password": "Password123!",
  "role": "ENTERPRISE", // ENTERPRISE or CITIZEN
  "phone": "0987654321"
}
```

#### 2. Get All Users
- **URL**: `/`
- **Method**: `GET`
- **Params**: `page`, `size`, `q` (search), `role`, `enabled`, `status`

#### 3. Get User By ID
- **URL**: `/{id}`
- **Method**: `GET`

#### 4. Update User Profile
- **URL**: `/{id}`
- **Method**: `PUT`

#### 5. Update User Role
- **URL**: `/{id}/role`
- **Method**: `PATCH`

**Request Body**:
```json
{
  "role": "COLLECTOR"
}
```

#### 6. Update User Status
- **URL**: `/{id}/status`
- **Method**: `PATCH`
- **Body**: `UpdateUserStatusRequest` (status: ACTIVE, BANNED, etc.)

#### 7. Delete User
- **URL**: `/{id}`
- **Method**: `DELETE`

### User/Profile Endpoints
Base URL: `/api/v1/users`

#### 1. Get My Profile / Get User By ID
- **URL**: `/{id}`
- **Method**: `GET`

#### 2. Update My Profile
- **URL**: `/{id}`
- **Method**: `PUT`

**Request Body** (`UpdateUserRequest`):
```json
{
  "firstName": "John",
  "lastName": "Updated",
  "phone": "111222333"
}
```

---

## Reward System

### Admin Endpoints
Base URL: `/api/rewards/admin`
**Role Required**: `ADMIN` (Implied via security config)

#### 1. Manage Reward Items
- **Get All Items**: `GET /items` (Filter: `status`, `search`)
- **Get Item By ID**: `GET /items/{id}`
- **Create Item**: `POST /items`

**Request Body** (`CreateRewardItemRequest`):
```json
{
  "name": "Eco Voucher",
  "description": "50% off at EcoStore",
  "pointsCost": 500,
  "stock": 100,
  "imageUrl": "http://..."
}
```

- **Update Item**: `PUT /items/{id}`
- **Delete Item**: `DELETE /items/{id}`

#### 2. Manage Redemptions
- **Get All Redemptions**: `GET /redemptions` (Filter: `status`)
- **Get Redemption By ID**: `GET /redemptions/{id}`
- **Approve Redemption**: `PATCH /redemptions/{id}/approve`
- **Reject Redemption**: `PATCH /redemptions/{id}/reject`
    - **Body**: `{"rejectionReason": "Out of stock"}`

---

## Complaint Management
Base URL: `/api/complaints`

### Citizen Endpoints
**Role Required**: `CITIZEN` (Implied)

#### 1. Create Complaint
- **URL**: `/citizen/{citizenId}`
- **Method**: `POST`

**Request Body** (`CreateComplaintRequest`):
```json
{
  "title": "Points not added",
  "description": "I recycled plastic but didn't get points.",
  "category": "POINTS_ERROR", // POINTS_ERROR, BUG, SERVICE_ISSUE, OTHER
  "priority": "Normal"
}
```

#### 2. Get My Complaints
- **URL**: `/citizen/{citizenId}`
- **Method**: `GET`

### Admin Endpoints
**Role Required**: `ADMIN`

#### 1. Get All Complaints
- **URL**: `/admin`
- **Method**: `GET`
- **Params**: `status`, `category`, `priority`, `page`, `size`

#### 2. Update Complaint Status
- **URL**: `/admin/{complaintId}/status`
- **Method**: `PUT`

**Request Body**:
```json
{
  "status": "Resolved",
  "adminResponse": "Points have been manually added."
}
```

#### 3. Complaint Statistics
- **URL**: `/admin/statistics`
- **Method**: `GET`

---

## Notification System
Base URL: `/api/notifications`

### Admin Endpoints
**Role Required**: `ADMIN`

#### 1. Create Notification
- **URL**: `/admin/{adminId}`
- **Method**: `POST`

**Request Body** (`CreateNotificationRequest`):
```json
{
  "title": "System Maintenance",
  "content": "System will be down on Sunday.",
  "type": "Maintenance",
  "targetAudience": "All",
  "priority": "High",
  "startDate": "2024-01-01T00:00:00",
  "endDate": "2024-01-02T00:00:00"
}
```

#### 2. Manage Notifications
- **Get All**: `GET /admin`
- **Get By ID**: `GET /admin/{id}`
- **Update**: `PUT /admin/{id}`
- **Toggle Status**: `PATCH /admin/{id}/toggle`
- **Delete**: `DELETE /admin/{id}`

### User Endpoints

#### 1. Get Active Notifications
- **URL**: `/user/{userRole}`
- **Method**: `GET`

#### 2. Count Active Notifications
- **URL**: `/count`
- **Method**: `GET`

---

## Real-time Events (SSE)
Base URL: `/api/sse`

### 1. Subscribe
frontend establishes a long-lived connection to receive real-time updates.
- **URL**: `/subscribe/{userId}`
- **Method**: `GET`
- **Params**: `role` (Citizen, Collector, Enterprise, Admin)
- **Response**: `text/event-stream`

### 2. Admin Stats
- **URL**: `/stats`
- **Method**: `GET`
