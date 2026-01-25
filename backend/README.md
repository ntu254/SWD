# SWD Backend Service

## 📋 Overview

This is the backend service for the SWD (Smart Waste Disposal) project, built with Spring Boot 3.5.0 and Java 17.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/backendservice/
│   │   │   ├── BackendServiceApplication.java     # Main application entry point
│   │   │   │
│   │   │   ├── common/                            # Common/Shared components
│   │   │   │   ├── config/                        # Configuration classes
│   │   │   │   │   ├── DataSeeder.java           # Sample data seeder (dev profile only)
│   │   │   │   │   └── OpenApiConfig.java        # Swagger/OpenAPI configuration
│   │   │   │   ├── constants/                     # Application constants
│   │   │   │   │   └── NotificationConstants.java
│   │   │   │   ├── dto/                           # Common DTOs
│   │   │   │   │   ├── ApiResponse.java          # Standard API response wrapper
│   │   │   │   │   └── PageResponse.java         # Pagination response wrapper
│   │   │   │   ├── exception/                     # Exception handling
│   │   │   │   │   └── GlobalExceptionHandler.java
│   │   │   │   └── sse/                           # Server-Sent Events
│   │   │   │       ├── SseController.java        # SSE endpoints
│   │   │   │       ├── SseEventData.java         # SSE event model
│   │   │   │       └── SseService.java           # SSE connection manager
│   │   │   │
│   │   │   ├── config/                            # App configurations
│   │   │   │   └── CorsConfig.java               # CORS configuration
│   │   │   │
│   │   │   ├── features/                          # Feature modules
│   │   │   │   ├── auth/                          # Authentication module
│   │   │   │   │   ├── controller/AuthController.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── AuthRequest.java
│   │   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   │   └── RegisterRequest.java
│   │   │   │   │   └── service/AuthService.java
│   │   │   │   │
│   │   │   │   ├── user/                          # User management module
│   │   │   │   │   ├── controller/UserController.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   └── Citizen.java
│   │   │   │   │   ├── repository/
│   │   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   │   └── CitizenRepository.java
│   │   │   │   │   └── service/
│   │   │   │   │
│   │   │   │   ├── complaint/                     # Complaint management module
│   │   │   │   │   ├── controller/ComplaintController.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── ComplaintResponse.java
│   │   │   │   │   │   ├── CreateComplaintRequest.java
│   │   │   │   │   │   └── UpdateComplaintStatusRequest.java
│   │   │   │   │   ├── entity/Complaint.java
│   │   │   │   │   ├── repository/ComplaintRepository.java
│   │   │   │   │   └── service/
│   │   │   │   │       ├── ComplaintService.java
│   │   │   │   │       └── ComplaintServiceImpl.java
│   │   │   │   │
│   │   │   │   └── notification/                  # Notification management module
│   │   │   │       ├── controller/NotificationController.java
│   │   │   │       ├── dto/
│   │   │   │       │   ├── CreateNotificationRequest.java
│   │   │   │       │   ├── NotificationResponse.java
│   │   │   │       │   └── UpdateNotificationRequest.java
│   │   │   │       ├── entity/Notification.java
│   │   │   │       ├── repository/NotificationRepository.java
│   │   │   │       └── service/
│   │   │   │           ├── NotificationService.java
│   │   │   │           └── NotificationServiceImpl.java
│   │   │   │
│   │   │   └── security/                          # Security configuration
│   │   │       ├── config/SecurityConfig.java
│   │   │       ├── jwt/
│   │   │       │   ├── JwtAuthenticationFilter.java
│   │   │       │   └── JwtService.java
│   │   │       └── service/CustomUserDetailsService.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties             # Base configuration
│   │       ├── application-dev.properties         # Development (PostgreSQL local)
│   │       └── application-deploy.properties      # Production (PostgreSQL cloud)
│   │
│   └── test/                                       # Unit & Integration tests
│       └── java/com/example/backendservice/
│           └── features/
│               ├── complaint/ComplaintServiceTest.java
│               └── notification/NotificationServiceTest.java
│
├── pom.xml                                         # Maven configuration
├── mvnw                                            # Maven wrapper (Unix)
├── mvnw.cmd                                        # Maven wrapper (Windows)
└── README.md                                       # This file
```

---

## ⚙️ Configuration

### Environment Profiles

The application supports multiple environment profiles. Configuration files in `src/main/resources/`:

| File | Description | Database |
|------|-------------|----------|
| `application.properties` | Base config with profile selector | - |
| `application-dev.properties` | Local development | PostgreSQL (local) |
| `application-deploy.properties` | Production deployment | PostgreSQL (cloud) |

### 📁 `application.properties` (Base)
```properties
spring.application.name=backend-service

# Active profile - change this to switch environments
# Options: dev, deploy
spring.profiles.active=dev
```

### 📁 `application-dev.properties` (Development)
```properties
# ============================================
# DEVELOPMENT CONFIGURATION
# ============================================

# Server
server.port=8080

# Database - PostgreSQL (Local Development)
spring.datasource.url=jdbc:postgresql://localhost:5432/swd_dev
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLong123456
jwt.expiration=86400000

# Logging
logging.level.org.springframework.security=DEBUG
logging.level.com.example.backendservice=DEBUG

# Swagger
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### 📁 `application-deploy.properties` (Production)
```properties
# ============================================
# PRODUCTION/DEPLOYMENT CONFIGURATION
# ============================================

# Server
server.port=${PORT:8080}

# Database - PostgreSQL (Supabase or other cloud provider)
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/swd_db}
spring.datasource.username=${DATABASE_USERNAME:postgres}
spring.datasource.password=${DATABASE_PASSWORD:password}
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT (Use environment variables!)
jwt.secret=${JWT_SECRET:your-production-secret-key-must-be-256-bits}
jwt.expiration=${JWT_EXPIRATION:86400000}

# Logging
logging.level.org.springframework.security=WARN
logging.level.com.example.backendservice=INFO

# Swagger
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true

# CORS
cors.allowed-origins=${CORS_ORIGINS:https://your-frontend.com}
```

---

## 🚀 How to Run

### Prerequisites

- **Java 17** or higher
- **Maven 3.8+** (or use the included Maven wrapper)
- **PostgreSQL 15+** (local or cloud)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ntu254/SWD.git
cd SWD/backend
```

### 2️⃣ Setup PostgreSQL Database

#### Option A: Local PostgreSQL
```bash
# Create database
psql -U postgres -c "CREATE DATABASE swd_dev;"
```

#### Option B: Docker
```bash
docker run --name swd-postgres \
  -e POSTGRES_DB=swd_dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### 3️⃣ Configure Application

Edit `src/main/resources/application-dev.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/swd_dev
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 4️⃣ Run the Application

#### Development Mode
```bash
# Using Maven wrapper
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or with Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Production Mode
```bash
# Set environment variables first
export DATABASE_URL=jdbc:postgresql://your-host:5432/your_db
export DATABASE_USERNAME=your_username
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your-super-secret-key-at-least-256-bits-long

# Run
./mvnw spring-boot:run -Dspring-boot.run.profiles=deploy
```

### 5️⃣ Build for Deployment

```bash
# Build JAR file
./mvnw clean package -DskipTests

# Run the JAR
java -jar target/backend-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=deploy
```

---

## 🔗 API Endpoints

### Base URL
- **Development:** `http://localhost:8080`
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **API Docs:** `http://localhost:8080/v3/api-docs`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Complaint Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/complaints/citizen/{citizenId}` | Create complaint | CITIZEN |
| GET | `/api/complaints/citizen/{citizenId}?page=0&size=10&sortBy=createdAt&sortDir=desc` | Get citizen's complaints (paginated) | CITIZEN |
| GET | `/api/complaints/{complaintId}` | Get complaint by ID | ALL |
| GET | `/api/complaints/admin?status=Pending&category=BUG&priority=High&page=0&size=10&sortBy=createdAt&sortDir=desc` | Get all complaints with filters (paginated) | ADMIN |
| PUT | `/api/complaints/admin/{id}/status` | Update complaint status | ADMIN |
| DELETE | `/api/complaints/admin/{id}` | Delete complaint | ADMIN |
| GET | `/api/complaints/admin/statistics` | Get statistics | ADMIN |

**Complaint Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | int | Page number (0-indexed) | `0` |
| `size` | int | Items per page | `10` |
| `sortBy` | string | Sort field | `createdAt`, `title`, `status` |
| `sortDir` | string | Sort direction | `asc`, `desc` |
| `status` | string | Filter by status | `Pending`, `In_Progress`, `Resolved`, `Rejected` |
| `category` | string | Filter by category | `BUG`, `FEATURE`, `POINTS_ERROR`, `OTHER` |
| `priority` | string | Filter by priority | `Low`, `Normal`, `High`, `Urgent` |

---

### Notification Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/api/notifications/admin/{adminId}` | Create notification | ADMIN |
| GET | `/api/notifications/admin?type=General&targetAudience=All&isActive=true&page=0&size=10&sortBy=createdAt&sortDir=desc` | Get all notifications with filters (paginated) | ADMIN |
| GET | `/api/notifications/admin/{id}` | Get notification by ID | ADMIN |
| PUT | `/api/notifications/admin/{id}` | Update notification | ADMIN |
| PATCH | `/api/notifications/admin/{id}/toggle` | Toggle active status | ADMIN |
| DELETE | `/api/notifications/admin/{id}` | Delete notification | ADMIN |
| GET | `/api/notifications/user/{role}?page=0&size=10&sortBy=createdAt&sortDir=desc` | Get active notifications for role (paginated) | USER |
| GET | `/api/notifications/count` | Count active notifications | PUBLIC |

**Notification Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | int | Page number (0-indexed) | `0` |
| `size` | int | Items per page | `10` |
| `sortBy` | string | Sort field | `createdAt`, `title`, `priority` |
| `sortDir` | string | Sort direction | `asc`, `desc` |
| `type` | string | Filter by type | `General`, `Maintenance`, `Update`, `Promotion`, `Alert` |
| `targetAudience` | string | Filter by audience | `All`, `Citizen`, `Collector`, `Enterprise` |
| `isActive` | boolean | Filter by active status | `true`, `false` |

---

### Server-Sent Events (SSE)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/sse/subscribe/{userId}?role=Citizen` | Subscribe to SSE | AUTHENTICATED |
| GET | `/api/sse/stats` | Get SSE statistics | ADMIN |
| POST | `/api/sse/test-broadcast?message=Hello&targetAudience=All` | Test broadcast | ADMIN |

---

## 🧪 Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ComplaintServiceTest

# Run with coverage
./mvnw test jacoco:report
```

---

## 📦 Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.5.0 | Framework |
| Spring Security | - | Authentication & Authorization |
| Spring Data JPA | - | Database ORM |
| PostgreSQL Driver | - | Database driver |
| JWT (jjwt) | 0.11.5 | JWT token handling |
| Lombok | - | Boilerplate reduction |
| SpringDoc OpenAPI | 2.3.0 | Swagger/API documentation |

---

## 👥 Sample Users (Dev Profile)

When running with `dev` profile, sample data will be seeded:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| john@example.com | citizen123 | CITIZEN |
| jane@example.com | citizen123 | CITIZEN |
| bob@example.com | citizen123 | CITIZEN |

---

## 🔒 Security

- JWT-based authentication
- Role-based authorization (ADMIN, CITIZEN, COLLECTOR, ENTERPRISE)
- Password encryption with BCrypt
- CORS configuration for frontend integration

---

## 📝 Notes

1. **Environment Variables:** In production, always use environment variables for sensitive data (database credentials, JWT secret, etc.)

2. **Database Migrations:** For production, consider using Flyway or Liquibase for database migrations instead of `ddl-auto=update`

3. **CORS:** Configure `cors.allowed-origins` for your specific frontend domains

4. **SSL/HTTPS:** In production, always use HTTPS. Configure SSL certificates appropriately.

---

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.
