# Exception Handling - Hướng dẫn chi tiết

## 📋 Tổng quan

Dự án sử dụng **Global Exception Handler** để xử lý tất cả các lỗi một cách tập trung và nhất quán.

## 🏗️ Kiến trúc Exception Handling

```
Request → Controller → Service (throw Exception) 
                                      ↓
                            GlobalExceptionHandler (catch)
                                      ↓
                            ApiResponse (format)
                                      ↓
                            Response to Client
```

---

## 1️⃣ Custom Exception Classes

### 📁 Location: `common/exception/`

### **ResourceNotFoundException.java**
```java
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
    }
}
```

**Khi nào dùng:** Khi không tìm thấy resource (User, Complaint, Notification, etc.)

**HTTP Status:** `404 NOT FOUND`

**Ví dụ sử dụng:**
```java
// Cách 1: Message tùy chỉnh
throw new ResourceNotFoundException("Citizen not found with id: " + citizenId);

// Cách 2: Format tự động
throw new ResourceNotFoundException("Citizen", "id", citizenId);
// → Output: "Citizen not found with id: '123'"
```

---

### **BadRequestException.java**
```java
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    
    public BadRequestException(String message) {
        super(message);
    }
}
```

**Khi nào dùng:** Khi request không hợp lệ (dữ liệu sai, logic không đúng)

**HTTP Status:** `400 BAD REQUEST`

**Ví dụ sử dụng:**
```java
if (request.getStartDate().isAfter(request.getEndDate())) {
    throw new BadRequestException("Start date must be before end date");
}
```

---

### **UnauthorizedException.java**
```java
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnauthorizedException extends RuntimeException {
    
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

**Khi nào dùng:** Khi user không có quyền truy cập

**HTTP Status:** `401 UNAUTHORIZED`

**Ví dụ sử dụng:**
```java
if (!user.getRole().equals("ADMIN")) {
    throw new UnauthorizedException("Only admin can perform this action");
}
```

---

## 2️⃣ GlobalExceptionHandler

### 📁 Location: `common/exception/GlobalExceptionHandler.java`

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // Xử lý ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(
        ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    // Xử lý BadRequestException
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequestException(
        BadRequestException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    // Xử lý validation errors (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
        MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Validation failed"));
    }
    
    // Xử lý tất cả exception khác (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception ex) {
        log.error("Unexpected error occurred: ", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred: " + ex.getMessage()));
    }
}
```

### **Cách hoạt động:**

1. **@RestControllerAdvice** - Áp dụng cho tất cả controllers
2. **@ExceptionHandler** - Chỉ định exception nào sẽ bắt
3. Tự động convert exception → JSON response

---

## 3️⃣ Ví dụ trong ComplaintService

### **ComplaintServiceImpl.java**

```java
@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {
    
    private final ComplaintRepository complaintRepository;
    private final CitizenRepository citizenRepository;
    
    @Override
    public ComplaintResponse createComplaint(Long citizenId, CreateComplaintRequest request) {
        // THROW EXCEPTION NẾU KHÔNG TÌM THẤY
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Citizen", "id", citizenId));
        
        // Business logic...
        Complaint complaint = Complaint.builder()
                .citizen(citizen)
                .title(request.getTitle())
                .build();
        
        return mapToResponse(complaintRepository.save(complaint));
    }
    
    @Override
    public ComplaintResponse updateComplaintStatus(Long complaintId, 
                                                   UpdateComplaintStatusRequest request) {
        // THROW EXCEPTION NẾU KHÔNG TÌM THẤY
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Complaint", "id", complaintId));
        
        // Validate business logic
        if (request.getStatus() == null) {
            throw new BadRequestException("Status cannot be null");
        }
        
        // Update...
        complaint.setStatus(request.getStatus());
        return mapToResponse(complaintRepository.save(complaint));
    }
}
```

---

## 4️⃣ Flow chi tiết

### **Scenario 1: Citizen không tồn tại**

```
1. Client gửi: POST /api/complaints/citizen/999
                             ↓
2. ComplaintController nhận request
                             ↓
3. ComplaintService.createComplaint(999, request)
                             ↓
4. citizenRepository.findById(999) → Optional.empty()
                             ↓
5. .orElseThrow() → throw new ResourceNotFoundException("Citizen", "id", 999)
                             ↓
6. GlobalExceptionHandler bắt ResourceNotFoundException
                             ↓
7. Tạo response:
   {
     "success": false,
     "message": "Citizen not found with id: '999'",
     "data": null
   }
                             ↓
8. Return HTTP 404 NOT FOUND
```

### **Response JSON:**
```json
{
  "success": false,
  "message": "Citizen not found with id: '999'",
  "data": null
}
```

---

### **Scenario 2: Validation Error**

```
1. Client gửi: POST /api/complaints/citizen/1
   Body: { "title": "" }  // Empty title (invalid)
                             ↓
2. @Valid annotation trigger validation
                             ↓
3. Validation fails → throw MethodArgumentNotValidException
                             ↓
4. GlobalExceptionHandler.handleValidationExceptions()
                             ↓
5. Extract errors: { "title": "must not be blank" }
                             ↓
6. Return HTTP 400 BAD REQUEST
```

### **Response JSON:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

---

## 5️⃣ ApiResponse Format

### **ApiResponse.java**
```java
@Getter
@Setter
@NoArgsConstructor
public class ApiResponse<T> {
    
    private Boolean success;
    private String message;
    private T data;
    
    // Success response
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Success");
        response.setData(data);
        return response;
    }
    
    // Error response
    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setData(null);
        return response;
    }
}
```

**Tất cả response đều có format thống nhất:**
```json
{
  "success": true/false,
  "message": "...",
  "data": {...}
}
```

---

## 6️⃣ Best Practices

### ✅ **DO:**

```java
// Sử dụng custom exception
throw new ResourceNotFoundException("User", "email", email);

// Validate trước khi xử lý
if (startDate.isAfter(endDate)) {
    throw new BadRequestException("Invalid date range");
}

// Log error quan trọng
log.error("Failed to send email to {}", email, exception);
```

### ❌ **DON'T:**

```java
// ❌ Không dùng RuntimeException generic
throw new RuntimeException("Something went wrong");

// ❌ Không return null
return null;  // Use Optional instead

// ❌ Không catch exception mà không xử lý
try {
    // ...
} catch (Exception e) {
    // Empty catch - BAD!
}
```

---

## 7️⃣ Test Exception Handling

### **ComplaintServiceTest.java**
```java
@Test
@DisplayName("Should throw exception when citizen not found")
void createComplaint_CitizenNotFound() {
    // Given
    when(citizenRepository.findById(999L)).thenReturn(Optional.empty());
    
    // When/Then
    assertThatThrownBy(() -> 
        complaintService.createComplaint(999L, request))
        .isInstanceOf(ResourceNotFoundException.class)
        .hasMessageContaining("Citizen not found");
}
```

---

## 8️⃣ Tóm tắt Exception Types

| Exception | HTTP Status | Khi nào dùng |
|-----------|-------------|--------------|
| `ResourceNotFoundException` | 404 | Resource không tồn tại |
| `BadRequestException` | 400 | Request không hợp lệ |
| `UnauthorizedException` | 401 | Không có quyền truy cập |
| `MethodArgumentNotValidException` | 400 | Validation @Valid fail |
| `Exception` (generic) | 500 | Lỗi không mong đợi |

---

## 9️⃣ Frontend Integration

### **Axios Interceptor Example:**
```javascript
// Handle error response
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response;
    
    switch (status) {
      case 404:
        toast.error(data.message); // "Citizen not found with id: '999'"
        break;
      case 400:
        toast.error(data.message); // "Validation failed"
        break;
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      default:
        toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);
```

---

## 🎯 Kết luận

**Exception handling trong dự án hoạt động như sau:**

1. **Service layer** throw custom exception (ResourceNotFoundException, BadRequestException, etc.)
2. **GlobalExceptionHandler** bắt exception
3. Convert sang **ApiResponse** với format chuẩn
4. Return về client với **HTTP status code** phù hợp

**Lợi ích:**
- ✅ Tập trung xử lý lỗi ở một nơi
- ✅ Response format nhất quán
- ✅ Dễ debug và maintain
- ✅ Frontend dễ dàng xử lý lỗi
