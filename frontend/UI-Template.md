# GreenLoop - UI/UX Specification Template

## 1. Tổng Quan & Mục Tiêu

**Bối Cảnh:**
Nền tảng Crowdsourced kết nối 3 bên: Cư dân (Citizen) - Doanh nghiệp (Recycling Enterprise) - Người thu gom (Collector). Hỗ trợ AI phân loại rác tại nguồn.

**Mục Tiêu Chính:**
1.  **AI Decision Support:** Hỗ trợ người dân phân loại rác qua ảnh chụp.
2.  **Gamification:** Tích điểm, Bảng xếp hạng, Thưởng KPI cho Collector.
3.  **Real-time Operations:** Quản lý trạng thái thu gom và năng lực xử lý.

---

## 2. Các Thay Đổi & Cấu Trúc Mới

### 2.1. Hero Section (`Hero.tsx`)
- **Thông điệp:** Nhấn mạnh "Phân Loại Rác Bằng AI Camera".
- **CTA:** Chuyển thành "Scan AI & Báo Cáo" để điều hướng người dùng ngay vào luồng chính.

### 2.2. Tính Năng Theo Vai Trò (`RoleFeatures.tsx` - NEW)
Một section mới dạng Tab giải thích rõ quyền lợi 3 bên:
- **Citizen:** AI Scan, Tích điểm, Theo dõi trạng thái (Pending/Accepted/Collected).
- **Enterprise:** Dashboard quản lý, Gán việc tự động, Báo cáo hiệu suất.
- **Collector:** Nhận việc gần nhất, Thưởng Bonus KPI, Check-in hình ảnh.

### 2.3. Báo Cáo Rác Thông Minh (`SmartReportModal.tsx` - NEW)
Thay thế BookingModal cũ bằng quy trình 4 bước:
1.  **Upload:** Chụp hoặc tải ảnh.
2.  **AI Analysis:** Giả lập phân tích ảnh, hiển thị Loại rác + Độ tin cậy + Điểm thưởng dự kiến.
3.  **Details:** Nhập GPS (giả lập), Ghi chú, Xác nhận loại rác.
4.  **Success:** Thông báo trạng thái Pending và cộng điểm.

### 2.4. Bảng Xếp Hạng (`LeaderboardSection.tsx` - NEW)
- **CẬP NHẬT:** Sử dụng **Light Theme** (`bg-white` kết hợp gradient nhẹ) để đồng bộ với toàn app.
- Card thiết kế nổi (`shadow-xl`) trên nền sáng.
- 2 Cột:
  - **Top Cư Dân:** Xếp hạng theo điểm GreenPoints.
  - **Top Collector:** Xếp hạng theo KPI và tiền thưởng Bonus.

### 2.5. Chatbot (`AiAssistant.tsx`)
- Cập nhật logic để phản hồi các câu hỏi về quy định phân loại rác mới và hỗ trợ người dùng.

---

## 3. Quy Tắc UI/UX Chi Tiết

- **Màu Sắc:**
  - Citizen Action: `brand-500` (Xanh lá).
  - Rewards/Gamification: `accent-500` (Vàng/Cam).
  - Trạng thái Pending: `yellow-500`.
  - Trạng thái Collected: `blue-500`.

- **Interactivity:**
  - Modal sử dụng animation `zoom-in`.
  - AI Scan có hiệu ứng `pulse` và `scan-line`.
  - Leaderboard sử dụng card màu trắng, shadow lớn để tạo chiều sâu.

## 4. Technical
- Sử dụng `gemini-2.5-flash-image` (mocked in frontend logic for demo without backend proxy) cho tính năng phân tích ảnh.
