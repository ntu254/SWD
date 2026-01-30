# SWD Backend Service 🌿

## 📋 Overview

This is the backend service for the **GreenLoop (SWD)** project, a core component connecting Citizens, Collectors, and Enterprises for smart waste management.
Built with **Spring Boot 3.5.0**, **Java 17**, and **PostgreSQL**.

## 🚀 Tech Stack

- **Language:** Java 21
- **Framework:** Spring Boot 3.5.0
- **Database:** PostgreSQL 15 (Supabase / Local)
- **Authentication:** Spring Security + JWT (JSON Web Token)
- **Documentation:** SpringDoc OpenAPI (Swagger UI)
- **Real-time:** Server-Sent Events (SSE)

---

## ⚙️ Configuration & Setup

### 1. Prerequisites
- **JDK 17+**
- **Maven 3.8+**
- **PostgreSQL** (Active database server)

### 2. Environment Profiles
The application uses `application.properties` as the base, extending into profiles:

| Profile | File | Description | JDBC URL (Example) |
|---------|------|-------------|-------------------|
| `dev` | `application-dev.properties` | Local Dev / Supabase Dev | `jdbc:postgresql://localhost:5432/swd_dev` |
| `deploy` | `application-deploy.properties` | Production Cloud | `jdbc:postgresql://cloud-host:5432/swd_prod` |

### 3. Running the Application

**Option 1: Using Maven Wrapper (Recommended)**
```bash
# Run with 'dev' profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Option 2: Using IDE**
Import as a Maven Project and run `BackendServiceApplication.java`.

### 4. Database Setup (Important!) ⚠️

If you encounter **SQL Errors** (e.g., `column "account_status" does not exist`), please run the following migration script in your Database Console (e.g., Supabase SQL Editor):

```sql
-- Fix missing columns in 'users' table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
ADD COLUMN IF NOT EXISTS ban_reason VARCHAR(500),
ADD COLUMN IF NOT EXISTS user_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delete_scheduled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS phone VARCHAR(255);

-- Ensure user_code is unique and not null
UPDATE users SET user_code = gen_random_uuid()::text WHERE user_code IS NULL;
ALTER TABLE users ALTER COLUMN user_code SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_user_code_key UNIQUE (user_code);
```

---

## 🔗 API Documentation (Swagger)

The project includes fully integrated **Swagger UI** for testing APIs.
Once the server is running, access:

👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

### Key Modules
1.  **Auth**: `/api/v1/auth` (Register, Login)
2.  **Users**: `/api/v1/users` (Profile management)
3.  **Admin**: `/api/admin/users` (Full user lifecycle control)
4.  **Complaints**: `/api/complaints` (Citizen reports & Admin resolution)
5.  **Notifications**: `/api/notifications` (System alerts)
6.  **SSE**: `/api/sse` (Real-time event subscription)

---

## 🔒 Security Info

- **JWT Authentication**: Most endpoints require a Bearer Token.
- **Roles**:
    - `ADMIN`: Full access to Admin APIs and Statistics.
    - `CITIZEN`: Can create/view own complaints and manage profile.
    - `COLLECTOR` / `ENTERPRISE`: Role-specific features (TBD).

---

## 🏗️ Project Structure

```
backend/src/main/java/com/example/backendservice/
├── common/                # Shared utilities (SSE, GlobalExHandler, Config)
├── features/              # Feature modules
│   ├── auth/              # Login/Register logic
│   ├── user/              # User & Admin management
│   ├── complaint/         # Complaint handling
│   └── notification/      # Notification system
└── security/              # JWT & Security Chain config
```
