# GreenLoop Backend Service 🌿

Chào mừng đến với **GreenLoop Backend Repository**! Đây là API Server xử lý logic nghiệp vụ, xác thực và quản lý dữ liệu cho nền tảng GreenLoop.

## 🚀 Công Nghệ Sử Dụng

Backend được xây dựng trên nền tảng **Java Spring Boot**, đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng:

*   **Language:** Java 17
*   **Framework:** [Spring Boot 3.5.0](https://spring.io/projects/spring-boot)
*   **Build Tool:** Maven
*   **Database:**
    *   **Dev:** H2 Database (In-Memory)
    *   **Prod:** PostgreSQL (Supported via driver)
*   **Authentication:** Spring Security + JWT (JSON Web Token)
*   **ORM:** Spring Data JPA (Hibernate)
*   **Utilities:** Lombok

---

## 📂 Cấu Trúc Dự Án

```
backend/src/main/
├── java/com/example/backendservice/
│   ├── config/            # Cấu hình (Security, CORS, Swagger...)
│   ├── controller/        # API Endpoints (AuthController, UserController...)
│   ├── dto/               # Data Transfer Objects (Request/Response models)
│   ├── entity/            # Database Models (User, Role...)
│   ├── repository/        # Data Access Layer (JPA interfaces)
│   ├── service/           # Business Logic Layer
│   └── util/              # Helper classes (JwtUtils...)
│
└── resources/
    └── application.properties # Main configuration file
```

---

## 🛠️ Cài Đặt & Chạy Dự Án

### Yêu cầu
*   [JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) trở lên
*   [Maven](https://maven.apache.org/) (Project có sẵn `mvnw` wrapper, không bắt buộc cài global)

### Các bước chạy
1.  **Mở terminal tại thư mục `backend/`**

2.  **Cài đặt dependencies & Build:**
    ```bash
    ./mvnw clean install
    # Windows:
    mvnw.cmd clean install
    ```

3.  **Chạy ứng dụng theo môi trường:**

    *   **Mặc định (H2 Database):**
        ```bash
        mvnw.cmd spring-boot:run
        ```
    *   **Dev Local (H2 + Debug Log):**
        ```bash
        mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
        ```
    *   **Local (PostgreSQL):**
        ```bash
        mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local
        ```
    *   **Production (PostgreSQL + Env Vars):**
        ```bash
        mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod
        ```

    Server sẽ khởi động tại: `http://localhost:8080`

---

## ⚙️ Cấu Hình (Configuration)

Các file cấu hình nằm trong `src/main/resources/`:

*   `application.properties`: Cấu hình gốc (H2 default).
*   `application-dev.properties`: Cấu hình cho dev local (H2 + Debug log + Dev Secret).
*   `application-local.properties`: Cấu hình chạy với PostgreSQL local.
*   `application-prod.properties`: Cấu hình Production (đọc biến môi trường).

### Database
*   **H2 (In-Memory):** `jdbc:h2:mem:swd_db` (User: `sa`, Pass: empty). Console: `/h2-console`.
*   **PostgreSQL:** `jdbc:postgresql://localhost:5432/swd_db` (User: `postgres`, Pass: `password`).

### JWT Security
*   **Secret Key:** Có thể thay đổi `jwt.secret` trong properties.
*   **Expiration:** Mặc định 24h (`86400000` ms).

---

## 🔌 API Endpoints Cơ Bản

| Method | Endpoint | Mô tả | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Đăng ký tài khoản mới | 
| `POST` | `/api/v1/auth/login` | Đăng nhập & lấy Token | 
| `GET` | `/api/v1/users/me` | Lấy thông tin user hiện tại | ✅ (Bearer Token) |
| `PUT` | `/api/v1/users/me` | Cập nhật hồ sơ | ✅ (Bearer Token) |

---

## 📝 Lưu ý cho Dev

*   **Lombok:** Đảm bảo IDE (IntelliJ/Eclipse) của bạn đã cài plugin Lombok để không bị lỗi báo đỏ getter/setter.
*   **Port Conflict:** Nếu port 8080 bị chiếm, hãy đổi `server.port` trong `application.properties`.

---

Happy Coding! 🚀
