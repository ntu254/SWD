# Deployment Guide

> **Hướng dẫn**: Deployment guide dựa trên thông tin thực tế từ README.md.

---

## 1. Environment Overview (From README.md)

| Environment | Profile | Database | Purpose |
|-------------|---------|----------|---------|
| **Local** | `dev` | PostgreSQL (swd_dev) | Development |
| **Production** | `deploy` | PostgreSQL (cloud) | Live |

---

## 2. Prerequisites (From README.md)

- **Java 17** or higher
- **Maven 3.8+** (or use included Maven wrapper)
- **PostgreSQL 15+** (local or cloud)

---

## 3. Clone & Setup

```bash
# Clone repository
git clone https://github.com/ntu254/SWD.git
cd SWD/backend
```

---

## 4. Database Setup

### Option A: Local PostgreSQL
```bash
# Create database
psql -U postgres -c "CREATE DATABASE swd_dev;"
```

### Option B: Docker
```bash
docker run --name swd-postgres \
  -e POSTGRES_DB=swd_dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

---

## 5. Configuration Files

### `application.properties` (Base)
```properties
spring.application.name=backend-service
spring.profiles.active=dev
```

### `application-dev.properties` (Development)
```properties
server.port=8080

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/swd_dev
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=mySecretKeyForJWTTokenGenerationThatShouldBeAtLeast256BitsLong123456
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000,http://localhost:5173
```

### `application-deploy.properties` (Production)
```properties
server.port=${PORT:8080}

# Database (Environment Variables)
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

# JWT (Environment Variables)
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

# CORS
cors.allowed-origins=${CORS_ORIGINS:https://your-frontend.com}
```

---

## 6. Build & Run Commands

### Development Mode
```bash
# Using Maven wrapper (Unix)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Using Maven wrapper (Windows)
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev

# Or with Maven
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production Mode
```bash
# Set environment variables first
export DATABASE_URL=jdbc:postgresql://your-host:5432/your_db
export DATABASE_USERNAME=your_username
export DATABASE_PASSWORD=your_password
export JWT_SECRET=your-super-secret-key-at-least-256-bits-long

# Run
./mvnw spring-boot:run -Dspring-boot.run.profiles=deploy
```

### Build JAR
```bash
# Build JAR file
./mvnw clean package -DskipTests

# Run the JAR
java -jar target/backend-service-0.0.1-SNAPSHOT.jar --spring.profiles.active=deploy
```

---

## 7. Verification

### Health Check
```bash
# Swagger UI
open http://localhost:8080/swagger-ui.html

# API Docs
curl http://localhost:8080/v3/api-docs
```

### Test Authentication
```bash
# Login with sample user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 8. Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ComplaintServiceTest
./mvnw test -Dtest=NotificationServiceTest

# Run with coverage
./mvnw test jacoco:report
```

---

## 9. Sample Users (Dev Profile)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| john@example.com | citizen123 | CITIZEN |
| jane@example.com | citizen123 | CITIZEN |
| bob@example.com | citizen123 | CITIZEN |

---

## 10. Environment Variables (Production)

```bash
# Required
DATABASE_URL=jdbc:postgresql://host:5432/db
DATABASE_USERNAME=user
DATABASE_PASSWORD=secret
JWT_SECRET=your-256-bit-secret-key

# Optional
PORT=8080
JWT_EXPIRATION=86400000
CORS_ORIGINS=https://your-frontend.com
```

---

## 11. Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change `server.port` in properties |
| Database connection failed | Check DATABASE_URL, username, password |
| JWT error | Ensure JWT_SECRET is at least 256 bits |
| CORS error | Add frontend URL to `cors.allowed-origins` |
| Lombok errors | Install Lombok plugin in IDE |

---

## 12. Security Notes (From README.md)

- JWT-based authentication
- Role-based authorization (ADMIN, CITIZEN, COLLECTOR, ENTERPRISE)
- Password encryption with BCrypt
- CORS configuration for frontend integration
- Always use HTTPS in production
- Use environment variables for sensitive data
