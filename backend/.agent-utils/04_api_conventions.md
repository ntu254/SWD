# API Conventions

> **AI Agent Instruction**: Follow these API design conventions based on existing patterns in README.md.

---

## 1. RESTful URL Patterns

### URL Structure (From README.md)
```
/api/{resource}                      # Public endpoints
/api/{resource}/citizen/{citizenId}  # Citizen-scoped
/api/{resource}/admin               # Admin endpoints
/api/{resource}/admin/{id}          # Admin with ID
/api/{resource}/user/{role}         # Role-based
```

### Existing Endpoint Patterns

| Action | HTTP Method | URL Pattern | Example |
|--------|-------------|-------------|---------|
| Create | `POST` | `/{resource}/citizen/{id}` | `POST /api/complaints/citizen/123` |
| Create (Admin) | `POST` | `/{resource}/admin/{adminId}` | `POST /api/notifications/admin/1` |
| List (Citizen) | `GET` | `/{resource}/citizen/{id}?page&size&sort` | `GET /api/complaints/citizen/123` |
| List (Admin) | `GET` | `/{resource}/admin?filters` | `GET /api/complaints/admin` |
| Get one | `GET` | `/{resource}/{id}` | `GET /api/complaints/5` |
| Get one (Admin) | `GET` | `/{resource}/admin/{id}` | `GET /api/notifications/admin/5` |
| Update | `PUT` | `/{resource}/admin/{id}` | `PUT /api/notifications/admin/5` |
| Update Status | `PUT` | `/{resource}/admin/{id}/status` | `PUT /api/complaints/admin/5/status` |
| Toggle | `PATCH` | `/{resource}/admin/{id}/toggle` | `PATCH /api/notifications/admin/5/toggle` |
| Delete | `DELETE` | `/{resource}/admin/{id}` | `DELETE /api/complaints/admin/5` |

---

## 2. Query Parameters (From README.md)

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | `0` | Page number (0-indexed) |
| `size` | int | `10` | Items per page |
| `sortBy` | string | `createdAt` | Sort field |
| `sortDir` | string | `desc` | Sort direction (asc/desc) |

### Complaint Filters

| Parameter | Type | Values |
|-----------|------|--------|
| `status` | string | `Pending`, `In_Progress`, `Resolved`, `Rejected` |
| `category` | string | `BUG`, `FEATURE`, `POINTS_ERROR`, `OTHER` |
| `priority` | string | `Low`, `Normal`, `High`, `Urgent` |

### Notification Filters

| Parameter | Type | Values |
|-----------|------|--------|
| `type` | string | `General`, `Maintenance`, `Update`, `Promotion`, `Alert` |
| `targetAudience` | string | `All`, `Citizen`, `Collector`, `Enterprise` |
| `isActive` | boolean | `true`, `false` |

---

## 3. Response Format

### Standard API Response (ApiResponse.java)
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... },
    "timestamp": "2026-01-25T22:00:00Z"
}
```

### Paginated Response (PageResponse.java)
```json
{
    "success": true,
    "data": {
        "content": [ ... ],
        "pageNumber": 0,
        "pageSize": 10,
        "totalElements": 100,
        "totalPages": 10,
        "last": false
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Error description",
    "timestamp": "2026-01-25T22:00:00Z"
}
```

---

## 4. HTTP Status Codes

### Success Codes
| Code | When to Use |
|------|-------------|
| `200 OK` | GET, PUT, PATCH success |
| `201 Created` | POST success |
| `204 No Content` | DELETE success |

### Error Codes
| Code | When to Use |
|------|-------------|
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Missing/invalid JWT |
| `403 Forbidden` | No permission |
| `404 Not Found` | Resource not found |

---

## 5. Authentication (From README.md)

### Headers
```
Authorization: Bearer {jwt_token}
```

### Auth Endpoints
```
POST /api/auth/register
POST /api/auth/login
```

### Login Response
```json
{
    "token": "eyJhbGc...",
    "type": "Bearer",
    "role": "ADMIN"
}
```

---

## 6. Reward Module API (NEW)

### Admin Reward Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/rewards/items` | List all reward items |
| GET | `/api/v1/admin/rewards/items/{id}` | Get reward item by ID |
| POST | `/api/v1/admin/rewards/items` | Create reward item |
| PUT | `/api/v1/admin/rewards/items/{id}` | Update reward item |
| DELETE | `/api/v1/admin/rewards/items/{id}` | Soft delete item |
| GET | `/api/v1/admin/rewards/redemptions` | List redemptions |
| PATCH | `/api/v1/admin/rewards/redemptions/{id}/approve` | Approve |
| PATCH | `/api/v1/admin/rewards/redemptions/{id}/reject` | Reject |

### Reward Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | ACTIVE, INACTIVE, OUT_OF_STOCK |
| `minPoints` | int | Minimum points cost |
| `maxPoints` | int | Maximum points cost |

---

## 7. OpenAPI Documentation

### Swagger URLs
```
Development: http://localhost:8080/swagger-ui.html
API Docs:    http://localhost:8080/v3/api-docs
```

### Controller Annotations
```java
@Tag(name = "Complaint Management", description = "APIs for managing complaints")
@RestController
@RequestMapping("/api/complaints")
public class ComplaintController { ... }
```

---

## 8. SSE Endpoints (Server-Sent Events)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sse/subscribe/{userId}?role=Citizen` | Subscribe to SSE |
| GET | `/api/sse/stats` | Get connection stats |
| POST | `/api/sse/test-broadcast?message=Hello&targetAudience=All` | Test broadcast |
