# Feature Documentation: Authentication & Authorization

## 📋 Mục lục

1. [Domain Overview](#1-domain-overview)
2. [Business Rules](#2-business-rules)
3. [API Contract - Authentication](#3-api-contract---authentication)
4. [Logic Documentation](#4-logic-documentation)
5. [Test Cases](#5-test-cases)

---

# 1. Domain Overview

## 1.1 Tổng quan hệ thống

Hệ thống Authentication & Authorization cung cấp các chức năng xác thực và phân quyền người dùng, bao gồm đăng ký, đăng nhập, quên mật khẩu, làm mới token và đăng xuất. Hệ thống sử dụng JWT (JSON Web Token) cho việc xác thực và Refresh Token cho việc duy trì phiên đăng nhập.

## 1.2 Actors (Các vai trò)

| Actor | Mô tả | Quyền hạn |
|-------|-------|-----------|
| **CITIZEN** | Người dân sử dụng dịch vụ | Đăng ký, đăng nhập, quản lý tài khoản cá nhân |
| **COLLECTOR** | Nhân viên thu gom | Đăng nhập, quản lý công việc thu gom |
| **ENTERPRISE** | Doanh nghiệp đối tác | Đăng nhập, quản lý collector, xem báo cáo |
| **ADMIN** | Quản trị viên hệ thống | Toàn quyền quản lý hệ thống |
| **GUEST** | Người dùng chưa đăng nhập | Đăng ký, đăng nhập, quên mật khẩu |

## 1.3 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      USER       │       │ CITIZEN_PROFILE │
├─────────────────┤       ├─────────────────┤
│ id (UUID)       │◄──────│ user_id         │
│ email           │  1:1  │ address         │
│ password        │       │ points          │
│ firstName       │       │ tier            │
│ lastName        │       └─────────────────┘
│ phone           │
│ role            │       ┌─────────────────┐
│ status          │       │COLLECTOR_PROFILE│
│ enabled         │       ├─────────────────┤
│ createdAt       │◄──────│ user_id         │
│ updatedAt       │  1:1  │ enterprise_id   │
│ lastLoginAt     │       │ vehicle_type    │
│ otpCode         │       │ license_plate   │
│ otpExpiry       │       └─────────────────┘
│ refreshToken    │
│ refreshTokenExp │       ┌─────────────────┐
└─────────────────┘       │ENTERPRISE_PROFILE│
                          ├─────────────────┤
                          │ user_id         │
                          │ company_name    │
                          │ tax_code        │
                          │ address         │
                          └─────────────────┘
```

## 1.4 Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│  USER   │                │ BACKEND │                │ DATABASE │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  1. POST /register       │                          │
     ├─────────────────────────►│                          │
     │                          │  2. Hash password        │
     │                          │  3. Create user          │
     │                          ├─────────────────────────►│
     │                          │  4. Create profile       │
     │                          ├─────────────────────────►│
     │                          │◄─────────────────────────┤
     │  5. Return tokens        │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  6. POST /login          │                          │
     ├─────────────────────────►│                          │
     │                          │  7. Validate credentials │
     │                          ├─────────────────────────►│
     │                          │◄─────────────────────────┤
     │                          │  8. Generate tokens      │
     │                          │  9. Save refresh token   │
     │                          ├─────────────────────────►│
     │  10. Return tokens       │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  11. API call + token    │                          │
     ├─────────────────────────►│                          │
     │                          │  12. Validate JWT        │
     │                          │  13. Process request     │
     │  14. Response            │                          │
     │◄─────────────────────────┤                          │
```

## 1.5 Token Refresh Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│  USER   │                │ BACKEND │                │ DATABASE │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  1. API call             │                          │
     ├─────────────────────────►│                          │
     │  2. 401 Unauthorized     │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  3. POST /refresh-token  │                          │
     ├─────────────────────────►│                          │
     │                          │  4. Validate refresh token│
     │                          ├─────────────────────────►│
     │                          │◄─────────────────────────┤
     │                          │  5. Generate new tokens  │
     │                          │  6. Save new refresh token│
     │                          ├─────────────────────────►│
     │  7. Return new tokens    │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  8. Retry original request│                         │
     ├─────────────────────────►│                          │
     │  9. Success              │                          │
     │◄─────────────────────────┤                          │
```

## 1.6 Password Reset Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│  USER   │                │ BACKEND │                │ DATABASE │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  1. POST /forgot-password│                          │
     ├─────────────────────────►│                          │
     │                          │  2. Generate OTP (6 digits)│
     │                          │  3. Save OTP + expiry    │
     │                          ├─────────────────────────►│
     │                          │  4. Send email with OTP  │
     │  5. Success message      │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │  6. POST /reset-password │                          │
     │     (email, OTP, newPass)│                          │
     ├─────────────────────────►│                          │
     │                          │  7. Validate OTP         │
     │                          ├─────────────────────────►│
     │                          │◄─────────────────────────┤
     │                          │  8. Hash new password    │
     │                          │  9. Update password      │
     │                          │  10. Clear OTP           │
     │                          │  11. Clear refresh tokens│
     │                          ├─────────────────────────►│
     │  12. Return new tokens   │                          │
     │◄─────────────────────────┤                          │
```

---

# 2. Business Rules

## 2.1 Registration Business Rules

### BR-R01: Email Validation
- **Rule:** Email phải unique trong hệ thống
- **Validation:** Format email hợp lệ theo RFC 5322
- **Error:** HTTP 400 "Email already registered"

### BR-R02: Password Strength
- **Rule:** Password tối thiểu 6 ký tự
- **Recommendation:** Nên có chữ hoa, chữ thường, số và ký tự đặc biệt
- **Storage:** Password được hash bằng BCrypt với cost factor 10

### BR-R03: Default Role Assignment
- **Rule:** Nếu không chỉ định role, mặc định là CITIZEN
- **Rule:** Admin và Enterprise chỉ có thể tạo bởi Admin hiện tại
- **Rule:** Enterprise có thể tạo Collector thuộc doanh nghiệp mình

### BR-R04: Profile Creation
- **Rule:** Sau khi tạo User, tự động tạo profile tương ứng theo role
- **Mapping:**
  - CITIZEN → CitizenProfile (points=0, tier=Bronze)
  - COLLECTOR → CollectorProfile
  - ENTERPRISE → EnterpriseProfile
  - ADMIN → Không có profile riêng

### BR-R05: Auto-login After Registration
- **Rule:** Sau khi đăng ký thành công, tự động tạo và trả về Access Token + Refresh Token
- **Token Lifespan:**
  - Access Token: 24 giờ
  - Refresh Token: 30 ngày

---

## 2.2 Login Business Rules

### BR-L01: Credential Validation
- **Rule:** Email và password phải khớp với database
- **Error:** HTTP 401 "Invalid email or password"
- **Security:** Không tiết lộ email hay password sai cụ thể

### BR-L02: Account Status Check
- **Rule:** Chỉ account có `enabled=true` mới đăng nhập được
- **Rule:** Chỉ account có `status=ACTIVE` mới đăng nhập được
- **Error:** HTTP 403 "Account is disabled" hoặc "Account is banned"

### BR-L03: Last Login Tracking
- **Rule:** Mỗi lần đăng nhập thành công, cập nhật `lastLoginAt`
- **Purpose:** Theo dõi hoạt động người dùng

### BR-L04: Token Generation
- **Rule:** Mỗi lần login tạo mới cả Access Token và Refresh Token
- **Rule:** Refresh Token cũ (nếu có) bị ghi đè bởi token mới
- **Security:** Token rotation để tăng bảo mật

---

## 2.3 Forgot Password Business Rules

### BR-FP01: OTP Generation
- **Rule:** OTP là số ngẫu nhiên 6 chữ số
- **Rule:** OTP có thời hạn 15 phút
- **Rule:** Mỗi lần request mới sẽ ghi đè OTP cũ

### BR-FP02: Email Sending
- **Rule:** Gửi OTP qua email dưới dạng HTML
- **Rule:** Email phải tồn tại trong hệ thống
- **Error:** HTTP 404 "User not found with email"
- **Security:** Không tiết lộ email có tồn tại hay không (trả về success trong mọi trường hợp)

### BR-FP03: Rate Limiting
- **Recommendation:** Giới hạn số lần request OTP (ví dụ: 3 lần/15 phút)
- **Purpose:** Chống spam và abuse

---

## 2.4 Reset Password Business Rules

### BR-RP01: OTP Validation
- **Rule:** OTP phải khớp với database
- **Rule:** OTP chưa hết hạn (< 15 phút)
- **Error:** HTTP 400 "Invalid or expired OTP"

### BR-RP02: Password Update
- **Rule:** Password mới phải khác password cũ (recommended)
- **Rule:** Password được hash trước khi lưu
- **Rule:** Sau khi đổi password, clear OTP và OTP expiry

### BR-RP03: Security Measures
- **Rule:** Clear tất cả Refresh Token hiện tại
- **Purpose:** Force logout tất cả thiết bị khác
- **Rule:** Tạo mới Access Token + Refresh Token và trả về
- **Purpose:** Auto-login sau khi reset password

---

## 2.5 Refresh Token Business Rules

### BR-RT01: Token Validation
- **Rule:** Refresh Token phải tồn tại trong database
- **Rule:** Refresh Token chưa hết hạn (< 30 ngày)
- **Error:** HTTP 401 "Invalid or expired refresh token"

### BR-RT02: Token Rotation
- **Rule:** Mỗi lần refresh thành công, tạo mới cả Access Token và Refresh Token
- **Rule:** Refresh Token cũ bị ghi đè bởi token mới
- **Security:** Ngăn chặn token reuse attack

### BR-RT03: User Status Check
- **Rule:** User phải còn `enabled=true` và `status=ACTIVE`
- **Error:** HTTP 401 nếu account bị disable/ban

---

## 2.6 Logout Business Rules

### BR-LO01: Token Invalidation
- **Rule:** Clear Refresh Token khỏi database (set null)
- **Rule:** Clear Refresh Token Expiry (set null)
- **Purpose:** Ngăn chặn token reuse

### BR-LO02: Client-side Cleanup
- **Rule:** Frontend phải xóa Access Token và Refresh Token khỏi localStorage
- **Rule:** Frontend phải xóa thông tin user khỏi localStorage
- **Rule:** Redirect về trang login

### BR-LO03: Graceful Degradation
- **Rule:** Nếu API logout fail, vẫn thực hiện cleanup ở client
- **Purpose:** Đảm bảo user luôn logout được

---

# 3. API Contract - Authentication

## 3.1 Register

### Request
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "citizen@example.com",
  "password": "SecurePass123",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phone": "0901234567",
  "role": "CITIZEN"
}
```

### Request Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | String | ✅ Yes | Valid email format, unique | Email đăng nhập |
| `password` | String | ✅ Yes | min 6 chars | Mật khẩu |
| `firstName` | String | ✅ Yes | max 100 chars | Tên |
| `lastName` | String | ✅ Yes | max 100 chars | Họ |
| `phone` | String | ❌ No | 10-11 digits | Số điện thoại |
| `role` | String | ❌ No | enum: CITIZEN, COLLECTOR, ENTERPRISE, ADMIN | Vai trò (default: CITIZEN) |

### Response - Success (201 Created)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "tokenType": "Bearer",
    "user": {
      "id": "af820030-88e1-41cb-9667-770e387c933e",
      "email": "citizen@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "phone": "0901234567",
      "role": "CITIZEN",
      "status": "ACTIVE",
      "enabled": true,
      "createdAt": "2024-01-31T10:00:00"
    }
  }
}
```

### Response - Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Email already registered: 'citizen@example.com'",
  "timestamp": "2024-01-31T10:00:00"
}
```

---

## 3.2 Login

### Request
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "citizen@example.com",
  "password": "SecurePass123"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | ✅ Yes | Email đăng nhập |
| `password` | String | ✅ Yes | Mật khẩu |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "tokenType": "Bearer",
    "user": {
      "id": "af820030-88e1-41cb-9667-770e387c933e",
      "email": "citizen@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A",
      "role": "CITIZEN",
      "lastLoginAt": "2024-01-31T10:00:00"
    }
  }
}
```

### Response - Error (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "timestamp": "2024-01-31T10:00:00"
}
```

### Response - Error (403 Forbidden)
```json
{
  "success": false,
  "message": "Account is disabled or banned",
  "timestamp": "2024-01-31T10:00:00"
}
```

---

## 3.3 Forgot Password

### Request
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "citizen@example.com"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | String | ✅ Yes | Email tài khoản cần reset password |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": null
}
```

### Response - Error (404 Not Found)
```json
{
  "success": false,
  "message": "User not found with email: 'notexist@example.com'",
  "timestamp": "2024-01-31T10:00:00"
}
```

### Email Template
```html
<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <h2 style="color: #2c3e50;">Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your password. Use the code below to proceed:</p>
    <h3 style="background-color: #f1f1f1; padding: 10px; border-radius: 4px; display: inline-block; color: #333;">
        123456
    </h3>
    <p>This code is valid for 15 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br/>
    <p>Best regards,<br/>SWD392 Team</p>
</div>
```

---

## 3.4 Reset Password

### Request
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "citizen@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass456"
}
```

### Request Fields
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `email` | String | ✅ Yes | Valid email | Email tài khoản |
| `otp` | String | ✅ Yes | 6 digits | Mã OTP từ email |
| `newPassword` | String | ✅ Yes | min 6 chars | Mật khẩu mới |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "tokenType": "Bearer",
    "user": {
      "id": "af820030-88e1-41cb-9667-770e387c933e",
      "email": "citizen@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A"
    }
  }
}
```

### Response - Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "timestamp": "2024-01-31T10:00:00"
}
```

---

## 3.5 Refresh Token

### Request
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Request Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | String | ✅ Yes | Refresh token từ login/register |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "660e8400-e29b-41d4-a716-446655440001",
    "tokenType": "Bearer",
    "user": {
      "id": "af820030-88e1-41cb-9667-770e387c933e",
      "email": "citizen@example.com",
      "role": "CITIZEN"
    }
  }
}
```

### Response - Error (401 Unauthorized)
```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "timestamp": "2024-01-31T10:00:00"
}
```

---

## 3.6 Logout

### Request
```http
POST /api/v1/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Request Headers
| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | ✅ Yes | Bearer token (Access Token) |

### Response - Success (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### Response - Error (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized",
  "timestamp": "2024-01-31T10:00:00"
}
```

---

# 4. Logic Documentation

## 4.1 Register Logic

### Flowchart
```
START
  │
  ├─► Validate input (email, password, firstName, lastName)
  │   ├─► Invalid? → Return 400 Bad Request
  │   └─► Valid? → Continue
  │
  ├─► Check if email already exists
  │   ├─► Exists? → Return 400 "Email already registered"
  │   └─► Not exists? → Continue
  │
  ├─► Hash password using BCrypt
  │
  ├─► Create User entity
  │   ├─► Set default role (CITIZEN if not specified)
  │   ├─► Set status = ACTIVE
  │   ├─► Set enabled = true
  │   └─► Save to database
  │
  ├─► Create corresponding profile based on role
  │   ├─► CITIZEN → Create CitizenProfile (points=0, tier=Bronze)
  │   ├─► COLLECTOR → Create CollectorProfile
  │   ├─► ENTERPRISE → Create EnterpriseProfile
  │   └─► ADMIN → No profile
  │
  ├─► Generate Access Token (JWT, 24h expiry)
  │
  ├─► Generate Refresh Token (UUID, 30 days expiry)
  │
  ├─► Save Refresh Token to User entity
  │
  └─► Return AuthResponse (tokens + user info)
END
```

### Code Reference
- **Controller:** `AuthController.register()`
- **Service:** `AuthServiceImpl.register()`
- **Key Methods:**
  - `userRepository.existsByEmail()`
  - `passwordEncoder.encode()`
  - `jwtTokenProvider.generateToken()`
  - `createProfileBasedOnRole()`

---

## 4.2 Login Logic

### Flowchart
```
START
  │
  ├─► Validate input (email, password)
  │   ├─► Invalid? → Return 400 Bad Request
  │   └─► Valid? → Continue
  │
  ├─► Find user by email
  │   ├─► Not found? → Return 401 "Invalid email or password"
  │   └─► Found? → Continue
  │
  ├─► Verify password
  │   ├─► Incorrect? → Return 401 "Invalid email or password"
  │   └─► Correct? → Continue
  │
  ├─► Check account status
  │   ├─► enabled = false? → Return 403 "Account is disabled"
  │   ├─► status != ACTIVE? → Return 403 "Account is banned"
  │   └─► OK? → Continue
  │
  ├─► Generate Access Token (JWT, 24h expiry)
  │
  ├─► Generate Refresh Token (UUID, 30 days expiry)
  │
  ├─► Update User entity
  │   ├─► Set refreshToken
  │   ├─► Set refreshTokenExpiry
  │   ├─► Set lastLoginAt = now
  │   └─► Save to database
  │
  └─► Return AuthResponse (tokens + user info)
END
```

### Code Reference
- **Controller:** `AuthController.login()`
- **Service:** `AuthServiceImpl.login()`
- **Key Methods:**
  - `userRepository.findByEmail()`
  - `passwordEncoder.matches()`
  - `generateTokensAndCreateResponse()`

---

## 4.3 Forgot Password Logic

### Flowchart
```
START
  │
  ├─► Validate email format
  │   ├─► Invalid? → Return 400 Bad Request
  │   └─► Valid? → Continue
  │
  ├─► Find user by email
  │   ├─► Not found? → Return 404 "User not found"
  │   └─► Found? → Continue
  │
  ├─► Generate 6-digit OTP (random number)
  │
  ├─► Calculate OTP expiry (now + 15 minutes)
  │
  ├─► Update User entity
  │   ├─► Set otpCode
  │   ├─► Set otpExpiry
  │   └─► Save to database
  │
  ├─► Send OTP email (async)
  │   ├─► Create HTML email with OTP
  │   ├─► Send via JavaMailSender
  │   └─► Log success/failure
  │
  └─► Return success message
END
```

### Code Reference
- **Controller:** `AuthController.forgotPassword()`
- **Service:** `AuthServiceImpl.forgotPassword()`
- **Email Service:** `EmailService.sendOtpEmail()`
- **Key Methods:**
  - `ThreadLocalRandom.current().nextInt(100000, 1000000)`
  - `LocalDateTime.now().plusMinutes(15)`
  - `emailService.sendOtpEmail()`

---

## 4.4 Reset Password Logic

### Flowchart
```
START
  │
  ├─► Validate input (email, otp, newPassword)
  │   ├─► Invalid? → Return 400 Bad Request
  │   └─► Valid? → Continue
  │
  ├─► Find user by email
  │   ├─► Not found? → Return 404 "User not found"
  │   └─► Found? → Continue
  │
  ├─► Verify OTP
  │   ├─► otpCode is null? → Return 400 "No OTP requested"
  │   ├─► otpCode != input? → Return 400 "Invalid OTP"
  │   ├─► otpExpiry < now? → Return 400 "OTP expired"
  │   └─► Valid? → Continue
  │
  ├─► Hash new password using BCrypt
  │
  ├─► Update User entity
  │   ├─► Set password = hashed password
  │   ├─► Set otpCode = null
  │   ├─► Set otpExpiry = null
  │   ├─► Set refreshToken = null (clear old sessions)
  │   ├─► Set refreshTokenExpiry = null
  │   └─► Save to database
  │
  ├─► Generate new Access Token
  │
  ├─► Generate new Refresh Token
  │
  ├─► Update User with new tokens
  │
  └─► Return AuthResponse (auto-login)
END
```

### Code Reference
- **Controller:** `AuthController.resetPassword()`
- **Service:** `AuthServiceImpl.resetPassword()`
- **Key Methods:**
  - `user.getOtpExpiry().isBefore(LocalDateTime.now())`
  - `passwordEncoder.encode()`
  - `generateTokensAndCreateResponse()`

---

## 4.5 Refresh Token Logic

### Flowchart
```
START
  │
  ├─► Validate refresh token input
  │   ├─► Empty? → Return 400 Bad Request
  │   └─► Valid? → Continue
  │
  ├─► Find user by refresh token
  │   ├─► Not found? → Return 401 "Invalid refresh token"
  │   └─► Found? → Continue
  │
  ├─► Check token expiry
  │   ├─► refreshTokenExpiry < now? → Return 401 "Refresh token expired"
  │   └─► Valid? → Continue
  │
  ├─► Check account status
  │   ├─► enabled = false? → Return 401 "Account disabled"
  │   ├─► status != ACTIVE? → Return 401 "Account banned"
  │   └─► OK? → Continue
  │
  ├─► Generate new Access Token (JWT, 24h)
  │
  ├─► Generate new Refresh Token (UUID, 30 days)
  │   └─► Token Rotation for security
  │
  ├─► Update User entity
  │   ├─► Set refreshToken = new token
  │   ├─► Set refreshTokenExpiry = now + 30 days
  │   ├─► Set lastLoginAt = now
  │   └─► Save to database
  │
  └─► Return AuthResponse (new tokens + user info)
END
```

### Code Reference
- **Controller:** `AuthController.refreshToken()`
- **Service:** `AuthServiceImpl.refreshToken()`
- **Repository:** `UserRepository.findByRefreshToken()`
- **Key Methods:**
  - `user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())`
  - `generateTokensAndCreateResponse()`

---

## 4.6 Logout Logic

### Backend Flowchart
```
START
  │
  ├─► Extract user email from JWT (Principal)
  │   ├─► No principal? → Return 200 (graceful)
  │   └─► Has principal? → Continue
  │
  ├─► Find user by email
  │   ├─► Not found? → Return 404 "User not found"
  │   └─► Found? → Continue
  │
  ├─► Update User entity
  │   ├─► Set refreshToken = null
  │   ├─► Set refreshTokenExpiry = null
  │   └─► Save to database
  │
  └─► Return success message
END
```

### Frontend Flowchart
```
START
  │
  ├─► Call POST /api/v1/auth/logout
  │   ├─► Success? → Continue
  │   ├─► Failure? → Log error, Continue anyway
  │   └─► (Always cleanup local storage)
  │
  ├─► Remove accessToken from localStorage
  │
  ├─► Remove refreshToken from localStorage
  │
  ├─► Remove user data from localStorage
  │
  └─► Redirect to /auth (login page)
END
```

### Code Reference
- **Backend Controller:** `AuthController.logout()`
- **Backend Service:** `AuthServiceImpl.logout()`
- **Frontend Service:** `authService.logout()`
- **Key Methods:**
  - `Principal.getName()` (get email from JWT)
  - `localStorage.removeItem()`

---

# 5. Test Cases

## 5.1 Register Test Cases

### TC-R01: Đăng ký thành công với đầy đủ thông tin
| ID | TC-R01 |
|----|--------|
| **Mô tả** | User đăng ký tài khoản mới với đầy đủ thông tin hợp lệ |
| **Precondition** | Email chưa tồn tại trong hệ thống |
| **Input** | email, password, firstName, lastName, phone, role=CITIZEN |
| **Expected Result** | HTTP 201, trả về tokens và user info, profile được tạo |
| **Priority** | High |

### TC-R02: Đăng ký thất bại - Email đã tồn tại
| ID | TC-R02 |
|----|--------|
| **Mô tả** | User đăng ký với email đã được sử dụng |
| **Precondition** | Email đã tồn tại trong database |
| **Input** | email = "existing@example.com" |
| **Expected Result** | HTTP 400, message "Email already registered" |
| **Priority** | High |

### TC-R03: Đăng ký thất bại - Email không hợp lệ
| ID | TC-R03 |
|----|--------|
| **Mô tả** | User đăng ký với email format sai |
| **Input** | email = "invalid-email" |
| **Expected Result** | HTTP 400, validation error |
| **Priority** | Medium |

### TC-R04: Đăng ký thất bại - Password quá ngắn
| ID | TC-R04 |
|----|--------|
| **Mô tả** | User đăng ký với password < 6 ký tự |
| **Input** | password = "12345" |
| **Expected Result** | HTTP 400, validation error |
| **Priority** | Medium |

### TC-R05: Đăng ký thành công - Role mặc định
| ID | TC-R05 |
|----|--------|
| **Mô tả** | User đăng ký không chỉ định role |
| **Input** | Không có field "role" |
| **Expected Result** | HTTP 201, user.role = "CITIZEN" |
| **Priority** | Medium |

### TC-R06: Đăng ký thành công - Tạo CitizenProfile
| ID | TC-R06 |
|----|--------|
| **Mô tả** | Sau khi đăng ký CITIZEN, profile được tạo |
| **Input** | role = "CITIZEN" |
| **Expected Result** | CitizenProfile tồn tại với points=0, tier=Bronze |
| **Priority** | High |

---

## 5.2 Login Test Cases

### TC-L01: Đăng nhập thành công
| ID | TC-L01 |
|----|--------|
| **Mô tả** | User đăng nhập với credentials đúng |
| **Precondition** | Account tồn tại, enabled=true, status=ACTIVE |
| **Input** | email, password (correct) |
| **Expected Result** | HTTP 200, trả về tokens, lastLoginAt được update |
| **Priority** | High |

### TC-L02: Đăng nhập thất bại - Email sai
| ID | TC-L02 |
|----|--------|
| **Mô tả** | User đăng nhập với email không tồn tại |
| **Input** | email = "notexist@example.com" |
| **Expected Result** | HTTP 401, message "Invalid email or password" |
| **Priority** | High |

### TC-L03: Đăng nhập thất bại - Password sai
| ID | TC-L03 |
|----|--------|
| **Mô tả** | User đăng nhập với password sai |
| **Input** | email (correct), password (wrong) |
| **Expected Result** | HTTP 401, message "Invalid email or password" |
| **Priority** | High |

### TC-L04: Đăng nhập thất bại - Account bị disable
| ID | TC-L04 |
|----|--------|
| **Mô tả** | User đăng nhập khi account bị disable |
| **Precondition** | user.enabled = false |
| **Expected Result** | HTTP 403, message "Account is disabled" |
| **Priority** | High |

### TC-L05: Đăng nhập thất bại - Account bị ban
| ID | TC-L05 |
|----|--------|
| **Mô tả** | User đăng nhập khi account bị ban |
| **Precondition** | user.status = "BANNED" |
| **Expected Result** | HTTP 403, message "Account is banned" |
| **Priority** | High |

### TC-L06: Refresh Token được tạo mới mỗi lần login
| ID | TC-L06 |
|----|--------|
| **Mô tả** | Mỗi lần login, refresh token cũ bị ghi đè |
| **Precondition** | User đã login trước đó (có refresh token cũ) |
| **Action** | Login lần 2 |
| **Expected Result** | Refresh token mới khác refresh token cũ |
| **Priority** | Medium |

---

## 5.3 Forgot Password Test Cases

### TC-FP01: Request OTP thành công
| ID | TC-FP01 |
|----|--------|
| **Mô tả** | User request OTP với email hợp lệ |
| **Precondition** | Email tồn tại trong hệ thống |
| **Input** | email = "user@example.com" |
| **Expected Result** | HTTP 200, OTP được lưu vào DB, email được gửi |
| **Priority** | High |

### TC-FP02: Request OTP thất bại - Email không tồn tại
| ID | TC-FP02 |
|----|--------|
| **Mô tả** | User request OTP với email không tồn tại |
| **Input** | email = "notexist@example.com" |
| **Expected Result** | HTTP 404, message "User not found" |
| **Priority** | Medium |

### TC-FP03: OTP có thời hạn 15 phút
| ID | TC-FP03 |
|----|--------|
| **Mô tả** | Kiểm tra OTP expiry được set đúng |
| **Action** | Request OTP |
| **Expected Result** | otpExpiry = now + 15 minutes |
| **Priority** | High |

### TC-FP04: Request OTP nhiều lần - OTP cũ bị ghi đè
| ID | TC-FP04 |
|----|--------|
| **Mô tả** | User request OTP 2 lần liên tiếp |
| **Action** | Request OTP lần 1, sau đó request lần 2 |
| **Expected Result** | OTP lần 2 ghi đè OTP lần 1 |
| **Priority** | Medium |

### TC-FP05: Email OTP được gửi đúng format HTML
| ID | TC-FP05 |
|----|--------|
| **Mô tả** | Kiểm tra email OTP có format đẹp |
| **Action** | Request OTP |
| **Expected Result** | Email chứa HTML với OTP code, valid 15 minutes |
| **Priority** | Low |

---

## 5.4 Reset Password Test Cases

### TC-RP01: Reset password thành công
| ID | TC-RP01 |
|----|--------|
| **Mô tả** | User reset password với OTP hợp lệ |
| **Precondition** | OTP đã được request và chưa hết hạn |
| **Input** | email, otp (correct), newPassword |
| **Expected Result** | HTTP 200, password được update, OTP cleared, trả về tokens |
| **Priority** | High |

### TC-RP02: Reset password thất bại - OTP sai
| ID | TC-RP02 |
|----|--------|
| **Mô tả** | User reset password với OTP sai |
| **Input** | otp = "999999" (wrong) |
| **Expected Result** | HTTP 400, message "Invalid OTP" |
| **Priority** | High |

### TC-RP03: Reset password thất bại - OTP hết hạn
| ID | TC-RP03 |
|----|--------|
| **Mô tả** | User reset password với OTP đã hết hạn (> 15 phút) |
| **Precondition** | otpExpiry < now |
| **Expected Result** | HTTP 400, message "OTP expired" |
| **Priority** | High |

### TC-RP04: Reset password - Clear refresh tokens
| ID | TC-RP04 |
|----|--------|
| **Mô tả** | Sau khi reset password, tất cả refresh tokens bị xóa |
| **Precondition** | User có refresh token cũ |
| **Action** | Reset password thành công |
| **Expected Result** | Refresh token cũ bị clear, token mới được tạo |
| **Priority** | High |

### TC-RP05: Reset password - Auto login
| ID | TC-RP05 |
|----|--------|
| **Mô tả** | Sau khi reset password, user được auto-login |
| **Action** | Reset password thành công |
| **Expected Result** | Response chứa accessToken và refreshToken mới |
| **Priority** | Medium |

---

## 5.5 Refresh Token Test Cases

### TC-RT01: Refresh token thành công
| ID | TC-RT01 |
|----|--------|
| **Mô tả** | User refresh token với refresh token hợp lệ |
| **Precondition** | Refresh token tồn tại và chưa hết hạn |
| **Input** | refreshToken (valid) |
| **Expected Result** | HTTP 200, trả về access token và refresh token mới |
| **Priority** | High |

### TC-RT02: Refresh token thất bại - Token không tồn tại
| ID | TC-RT02 |
|----|--------|
| **Mô tả** | User refresh với token không có trong DB |
| **Input** | refreshToken = "invalid-uuid" |
| **Expected Result** | HTTP 401, message "Invalid refresh token" |
| **Priority** | High |

### TC-RT03: Refresh token thất bại - Token hết hạn
| ID | TC-RT03 |
|----|--------|
| **Mô tả** | User refresh với token đã hết hạn (> 30 ngày) |
| **Precondition** | refreshTokenExpiry < now |
| **Expected Result** | HTTP 401, message "Refresh token expired" |
| **Priority** | High |

### TC-RT04: Token Rotation - Token cũ không dùng được
| ID | TC-RT04 |
|----|--------|
| **Mô tả** | Sau khi refresh, token cũ bị vô hiệu hóa |
| **Action** | Refresh token lần 1 (nhận token mới), thử dùng token cũ lần 2 |
| **Expected Result** | Lần 2 trả về 401 "Invalid refresh token" |
| **Priority** | High |

### TC-RT05: Refresh token - Account bị disable
| ID | TC-RT05 |
|----|--------|
| **Mô tả** | User refresh khi account bị disable |
| **Precondition** | user.enabled = false |
| **Expected Result** | HTTP 401, không cho refresh |
| **Priority** | Medium |

### TC-RT06: Frontend Auto Retry - 401 Interceptor
| ID | TC-RT06 |
|----|--------|
| **Mô tả** | Frontend tự động refresh khi nhận 401 |
| **Precondition** | Access token hết hạn, refresh token còn hợp lệ |
| **Action** | Gọi API bất kỳ |
| **Expected Result** | Frontend tự động gọi /refresh-token, retry request ban đầu |
| **Priority** | High |

---

## 5.6 Logout Test Cases

### TC-LO01: Logout thành công
| ID | TC-LO01 |
|----|--------|
| **Mô tả** | User logout khi đã đăng nhập |
| **Precondition** | User có access token hợp lệ |
| **Input** | Authorization: Bearer {token} |
| **Expected Result** | HTTP 200, refresh token bị xóa khỏi DB |
| **Priority** | High |

### TC-LO02: Logout - Frontend cleanup
| ID | TC-LO02 |
|----|--------|
| **Mô tả** | Frontend xóa tokens khỏi localStorage |
| **Action** | Gọi logout() |
| **Expected Result** | accessToken, refreshToken, user bị xóa khỏi localStorage |
| **Priority** | High |

### TC-LO03: Logout - Graceful degradation
| ID | TC-LO03 |
|----|--------|
| **Mô tả** | Frontend vẫn logout được khi API fail |
| **Precondition** | Backend không khả dụng |
| **Action** | Gọi logout() |
| **Expected Result** | API fail nhưng localStorage vẫn bị clear, redirect về /auth |
| **Priority** | High |

### TC-LO04: Logout - Refresh token không dùng được
| ID | TC-LO04 |
|----|--------|
| **Mô tả** | Sau khi logout, refresh token cũ không dùng được |
| **Action** | Logout, sau đó thử refresh với token cũ |
| **Expected Result** | HTTP 401 "Invalid refresh token" |
| **Priority** | High |

### TC-LO05: Logout - Redirect về login
| ID | TC-LO05 |
|----|--------|
| **Mô tả** | Sau khi logout, user được redirect về trang login |
| **Action** | Gọi logout() |
| **Expected Result** | window.location.href = '/auth' |
| **Priority** | Medium |

---

## 5.7 Test Coverage Summary

| Feature | Total TCs | Priority High | Priority Medium | Priority Low |
|---------|-----------|---------------|-----------------|--------------|
| Register | 6 | 3 | 3 | 0 |
| Login | 6 | 4 | 2 | 0 |
| Forgot Password | 5 | 2 | 2 | 1 |
| Reset Password | 5 | 4 | 1 | 0 |
| Refresh Token | 6 | 5 | 1 | 0 |
| Logout | 5 | 4 | 1 | 0 |
| **Total** | **33** | **22** | **10** | **1** |

---

## 6. Error Codes Summary

| HTTP Code | Exception | Mô tả | Ví dụ |
|-----------|-----------|-------|-------|
| 200 | - | Thành công | Login, Logout, Forgot Password |
| 201 | - | Tạo thành công | Register |
| 400 | BadRequestException | Request không hợp lệ | Email đã tồn tại, OTP sai, Validation error |
| 401 | UnauthorizedException | Chưa đăng nhập hoặc token không hợp lệ | Invalid credentials, Expired token |
| 403 | ForbiddenException | Không có quyền | Account disabled/banned |
| 404 | ResourceNotFoundException | Không tìm thấy resource | User not found |
| 500 | Exception | Lỗi server | Database error, Email service error |

---

## 7. Security Considerations

### 7.1 Password Security
- **Hashing:** BCrypt với cost factor 10
- **Storage:** Không bao giờ lưu plaintext password
- **Validation:** Minimum 6 characters (recommend 8+ with complexity)

### 7.2 Token Security
- **Access Token:** JWT, 24 hours expiry, signed with secret key
- **Refresh Token:** UUID v4, 30 days expiry, stored in database
- **Token Rotation:** New refresh token issued on every refresh
- **Logout:** Refresh token invalidated immediately

### 7.3 OTP Security
- **Generation:** 6-digit random number (100000-999999)
- **Expiry:** 15 minutes
- **Single Use:** OTP cleared after successful reset
- **Rate Limiting:** Recommended to prevent abuse

### 7.4 HTTPS Only
- **Production:** All authentication endpoints must use HTTPS
- **Cookies:** Set Secure and HttpOnly flags (if using cookies)

### 7.5 CORS Configuration
- **Allowed Origins:** Configure specific frontend domains
- **Credentials:** Allow credentials for cross-origin requests

---

## 8. Frontend Integration Guide

### 8.1 Axios Client Setup
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor - Auto refresh on 401
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url?.includes('/auth/refresh-token')) {
                // Refresh endpoint failed - logout
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(error);
            }
            
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');
                
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken
                });
                
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;
                
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);
```

### 8.2 Auth Service
```typescript
export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/register', data);
        this.saveTokens(response.data);
        return response.data;
    },
    
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/login', data);
        this.saveTokens(response.data);
        return response.data;
    },
    
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API failed, proceeding with local cleanup', error);
        } finally {
            this.clearTokens();
        }
    },
    
    async forgotPassword(email: string): Promise<void> {
        await apiClient.post('/auth/forgot-password', { email });
    },
    
    async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
        const response = await apiClient.post('/auth/reset-password', data);
        this.saveTokens(response.data);
        return response.data;
    },
    
    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post('/auth/refresh-token', { refreshToken });
        this.saveTokens(response.data);
        return response.data;
    },
    
    saveTokens(authResponse: AuthResponse): void {
        localStorage.setItem('accessToken', authResponse.accessToken);
        localStorage.setItem('refreshToken', authResponse.refreshToken);
        localStorage.setItem('user', JSON.stringify(authResponse.user));
    },
    
    clearTokens(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    }
};
```

---

## 9. Database Schema

### User Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'CITIZEN',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    otp_code VARCHAR(10),
    otp_expiry TIMESTAMP,
    refresh_token VARCHAR(500),
    refresh_token_expiry TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_refresh_token ON users(refresh_token);
```

---

## 10. Postman Collection

### Environment Variables
```json
{
    "baseUrl": "http://localhost:8080/api/v1",
    "accessToken": "",
    "refreshToken": "",
    "userEmail": "test@example.com"
}
```

### Sample Requests

#### 1. Register
```
POST {{baseUrl}}/auth/register
Body:
{
    "email": "{{userEmail}}",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User",
    "phone": "0901234567",
    "role": "CITIZEN"
}

Tests:
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
pm.test("Response has tokens", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.accessToken).to.exist;
    pm.expect(jsonData.data.refreshToken).to.exist;
    pm.environment.set("accessToken", jsonData.data.accessToken);
    pm.environment.set("refreshToken", jsonData.data.refreshToken);
});
```

#### 2. Login
```
POST {{baseUrl}}/auth/login
Body:
{
    "email": "{{userEmail}}",
    "password": "Test123456"
}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("Save tokens", function () {
    var jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.data.accessToken);
    pm.environment.set("refreshToken", jsonData.data.refreshToken);
});
```

#### 3. Logout
```
POST {{baseUrl}}/auth/logout
Headers:
Authorization: Bearer {{accessToken}}

Tests:
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2024-01-31  
**Author:** Backend Development Team
