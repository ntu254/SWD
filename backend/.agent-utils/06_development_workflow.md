# Development Workflow

> **⭐ CRITICAL FILE FOR AI AGENT**: Workflow phát triển dựa trên cấu trúc thực tế của SWD Backend (từ README.md).

---

## Pre-Development Phase

### Step 0: Load Context
```
Action: Read and understand the following files BEFORE writing any code

Required Reading:
1. 00_project_context.md    → Tech stack, roles, features, sample users
2. 01_architecture.md       → Folder structure, existing endpoints
3. 02_coding_standards.md   → Naming conventions
4. README.md               → Build commands, configuration

Existing Modules (from README):
- auth/     → AuthController, AuthService
- user/     → UserController, User, Citizen entities
- complaint/ → ComplaintController, ComplaintService
- notification/ → NotificationController, NotificationService, SSE
```

### Step 1: Understand Requirements
```
Action: Clarify the task requirements

Questions to answer:
[ ] Which feature module does this belong to? (auth, user, complaint, notification, reward)
[ ] What entities are involved?
[ ] What endpoints are needed? (follow existing patterns from README)
[ ] What query parameters/filters are needed?
[ ] Does this affect existing functionality?
```

### Step 2: Analyze Existing Code
```
Action: Scan related files in the codebase

Pattern from README.md - Each feature module has:
├── controller/
│   └── {Feature}Controller.java
├── dto/
│   ├── {Feature}Response.java
│   ├── Create{Feature}Request.java
│   └── Update{Feature}Request.java
├── entity/
│   └── {Feature}.java
├── repository/
│   └── {Feature}Repository.java
└── service/
    ├── {Feature}Service.java
    └── {Feature}ServiceImpl.java

Also check:
- common/dto/ApiResponse.java (standard response wrapper)
- common/dto/PageResponse.java (pagination wrapper)
- common/exception/GlobalExceptionHandler.java
```

---

## Development Phase

### Step 3: Design Database (if applicable)
```
Action: Create/modify database schema

Current DB Config (from README):
- Dev Profile: PostgreSQL local (swd_dev)
- Deploy Profile: PostgreSQL cloud (env vars)
- JPA: hibernate.ddl-auto=update

For new entities:
[ ] Create entity class in features/{module}/entity/
[ ] Add @Entity, @Table annotations
[ ] Define relationships (@ManyToOne, etc.)
[ ] Add audit fields (createdAt, updatedAt)
```

### Step 4: Implement Business Logic
```
Action: Write Service layer code

Pattern from README:
- Service interface: {Feature}Service.java
- Implementation: {Feature}ServiceImpl.java
- Use @Service, @RequiredArgsConstructor
- Add @Transactional for write operations

Exception handling:
- Use GlobalExceptionHandler patterns
- Throw specific exceptions
```

### Step 5: Create DTOs
```
Action: Create request/response DTOs

Pattern from README:
- Create{Feature}Request.java → POST body
- Update{Feature}Request.java → PUT body
- {Feature}Response.java → Response body

Use common wrappers:
- ApiResponse.java for single objects
- PageResponse.java for paginated lists
```

### Step 6: Implement Controller
```
Action: Create API endpoints

Pattern from README:
- @RestController
- @RequestMapping("/api/{resource}")
- Follow existing URL patterns:
  - /api/{resource}/citizen/{citizenId} → citizen-scoped
  - /api/{resource}/admin → admin endpoints
  - /api/{resource}/admin/{id} → admin with ID

Query parameters (from README):
- page, size, sortBy, sortDir → pagination
- status, category, priority → filters
```

### Step 7: Write Tests
```
Action: Write tests for new code

Test location (from README):
src/test/java/com/example/backendservice/features/
├── complaint/ComplaintServiceTest.java
└── notification/NotificationServiceTest.java

Create:
[ ] {Feature}ServiceTest.java → Unit tests
```

---

## Post-Development Phase

### Step 8: Self-Review
```
Action: Review your own code

Checklist:
[ ] Uses common/dto/ApiResponse.java wrapper
[ ] Pagination uses PageResponse.java
[ ] Follows existing endpoint patterns
[ ] Proper exception handling
[ ] Tests created
```

### Step 9: Run Verification
```
Action: Verify changes work correctly

Commands (from README):
# Run all tests
./mvnw test

# Run specific test
./mvnw test -Dtest={Feature}ServiceTest

# Run application
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Access Swagger
http://localhost:8080/swagger-ui.html
```

### Step 10: Update Documentation
```
Action: Keep docs in sync

Tasks:
[ ] Update Swagger annotations
[ ] Update README.md if new endpoints added
[ ] Update MEMORY.md with learnings
```

---

## Quick Reference

### Sample Users (Dev Profile)
| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | ADMIN |
| john@example.com | citizen123 | CITIZEN |

### Build Commands
```bash
# Build
./mvnw clean package -DskipTests

# Run with dev profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
./mvnw test
```

### Common Pitfalls
| Pitfall | Prevention |
|---------|------------|
| Not using ApiResponse wrapper | Check common/dto/ApiResponse.java |
| Not using PageResponse | Check common/dto/PageResponse.java |
| Wrong endpoint pattern | Check README.md for existing patterns |
| Missing profile | Use -Dspring-boot.run.profiles=dev |
