# AI Agent Utils - Component Guide

Tài liệu này giải thích chi tiết mục đích, cấu trúc và cách sử dụng của từng file trong bộ công cụ `.agent-utils`.

---

## 1. Core Templates (Nền tảng)

Nhóm file này định hình "tư duy" của AI Agent về dự án. Bắt buộc phải đọc trước khi thực hiện bất kỳ task nào.

### `00_project_context.md`
- **Mục đích**: Cung cấp bức tranh toàn cảnh về Business Domain và Scope của dự án.
- **Nội dung**:
  - `Project Overview`: Tên, loại dự án.
  - `Business Domain`: Lĩnh vực kinh doanh, thuật ngữ chuyên ngành.
  - `User Roles`: Các loại người dùng và quyền hạn.
  - `Core Features`: Danh sách các tính năng chính.
- **Cách AI dùng**: Để trả lời câu hỏi "Tại sao làm tính năng này?" và "Tính năng này phục vụ ai?".

### `01_architecture.md` 
- **Mục đích**: Bản đồ kỹ thuật của hệ thống.
- **Nội dung**:
  - `Tech Stack`: Ngôn ngữ, Framework, DB, Tools.
  - `Architecture Pattern`: Cấu trúc tổng thể (Layered, Microservices...).
  - `Folder Structure`: Cấu trúc thư mục chuẩn.
- **Cách AI dùng**: Biết đặt file mới ở đâu, extends class nào, dùng thư viện gì.

### `02_coding_standards.md`
- **Mục đích**: Luật lệ viết code (Code Style).
- **Nội dung**:
  - `Naming Conventions`: Quy tắc đặt tên (PascalCase, camelCase...).
  - `Design Patterns`: Các mẫu thiết kế được phép dùng.
  - `Error Handling`: Cách catch và throw exception.
- **Cách AI dùng**: Viết code "sạch", nhất quán với team, tránh bị reject khi review.

### `03_database_conventions.md`
- **Mục đích**: Chuẩn thiết kế cơ sở dữ liệu.
- **Nội dung**:
  - `Naming`: Quy tắc đặt tên bảng, cột, index.
  - `Data Types`: Mapping giữa Java type và DB type.
  - `Migration Strategy`: Cách viết file migration.
- **Cách AI dùng**: Tạo file migration và entity JPA chính xác.

### `04_api_conventions.md`
- **Mục đích**: Chuẩn giao tiếp Client-Server.
- **Nội dung**:
  - `RESTful Rules`: Cách đặt URL, HTTP Method.
  - `Response Format`: Cấu trúc JSON trả về chuẩn.
  - `Status Codes`: Mã lỗi quy định.
- **Cách AI dùng**: Viết Controller và DTO đúng chuẩn contract.

### `05_testing_standards.md`
- **Mục đích**: Chiến lược kiểm thử.
- **Nội dung**:
  - `Test Pyramid`: Tỉ lệ Unit/Integration test.
  - `Coverage`: Mức độ bao phủ code yêu cầu.
  - `Templates`: Mẫu test case chuẩn.
- **Cách AI dùng**: Tự sinh test case chất lượng, cover các cases quan trọng.

---

## 2. Process Templates (Quy trình)

Nhóm file này hướng dẫn "hành động" của AI Agent.

### `06_development_workflow.md` ⭐ (Quan trọng nhất)
- **Mục đích**: Hướng dẫn từng bước (Step-by-step) để dev một tính năng.
- **Nội dung**: 10 bước từ đọc requirement -> implement -> test -> verify.
- **Cách AI dùng**: Đây là "bản đồ" để Agent tự hành, không cần user nhắc từng bước.

### `07_review_checklist.md`
- **Mục đích**: Bộ lọc chất lượng (Quality Gate).
- **Nội dung**: Danh sách các mục cần kiểm tra Security, Performance, Logic...
- **Cách AI dùng**: Tự review code của mình trước khi đưa cho user.

### `08_deployment_guide.md`
- **Mục đích**: Hướng dẫn vận hành.
- **Nội dung**: Build command, Docker, Environment variables.
- **Cách AI dùng**: Giúp user fix lỗi build hoặc deploy environment.

---

## 3. Workflow Templates (`workflows/`)

Các quy trình automation được đóng gói sẵn.

- **`new-feature.md`**: Quy trình chuẩn để thêm tính năng mới an toàn.
- **`bug-fix.md`**: Quy trình sửa lỗi focus vào việc tái tạo lỗi (reproduction) trước khi fix.
- **`refactoring.md`**: Quy trình tối ưu code mà không làm hỏng tính năng cũ.
- **`code-review.md`**: Quy trình đóng vai reviewer khó tính để tìm lỗi.

---

## 4. AI Specific Files (Tăng cường trí tuệ)

### `PROMPTS.md`
- **Mục đích**: Thư viện câu lệnh tối ưu (Prompt Engineering).
- **Nội dung**: Các mẫu prompt đã được test kỹ để giao việc cho AI hiệu quả nhất.
- **Cách User dùng**: Copy paste prompt từ đây để giao việc cho Agent.

### `MEMORY.md`
- **Mục đích**: "Bộ nhớ dài hạn" của dự án.
- **Nội dung**: Lịch sử quyết định, các lỗi đã gặp (Known issues), bài học kinh nghiệm.
- **Cách AI dùng**: Tránh lặp lại sai lầm cũ, hiểu context lịch sử mà code không thể hiện được.
