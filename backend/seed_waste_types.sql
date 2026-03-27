-- =============================================================
-- Dữ liệu Loại Rác (Waste Types) - Tiếng Việt
-- Database: PostgreSQL
-- Table: waste_types
-- =============================================================

-- Xóa dữ liệu cũ (tùy chọn - bỏ comment nếu muốn reset)
-- DELETE FROM waste_types;

INSERT INTO waste_types (waste_type_id, name, description, is_active, is_recyclable) VALUES

-- ═══════════════════════════════════════════════════════════
-- 🟢 NHÓM TÁI CHẾ ĐƯỢC
-- ═══════════════════════════════════════════════════════════

(gen_random_uuid(), 'Nhựa', 
 'Chai nhựa, túi nilon, hộp nhựa, ống hút nhựa, đồ nhựa dùng một lần. Cần rửa sạch trước khi bỏ vào thùng tái chế.', 
 true, true),

(gen_random_uuid(), 'Giấy & Bìa carton', 
 'Giấy báo, giấy in, bìa carton, hộp giấy, sách cũ, tạp chí. Không bao gồm giấy đã dính thức ăn hoặc giấy vệ sinh.', 
 true, true),

(gen_random_uuid(), 'Kim loại', 
 'Lon nhôm, lon sắt, vỏ hộp thiếc, đồ dùng kim loại cũ, dây đồng, sắt vụn. Rửa sạch lon trước khi tái chế.', 
 true, true),

(gen_random_uuid(), 'Thủy tinh', 
 'Chai thủy tinh, lọ thủy tinh, kính vỡ (gói cẩn thận), bình thủy tinh. Phân loại theo màu nếu có thể.', 
 true, true),

(gen_random_uuid(), 'Vải & Quần áo cũ', 
 'Quần áo cũ, vải vụn, tấm ga, rèm cửa, giày dép cũ. Nên giặt sạch trước khi quyên góp hoặc tái chế.', 
 true, true),

-- ═══════════════════════════════════════════════════════════
-- 🟡 NHÓM HỮU CƠ
-- ═══════════════════════════════════════════════════════════

(gen_random_uuid(), 'Rác hữu cơ (thực phẩm)', 
 'Thức ăn thừa, vỏ trái cây, rau củ hư, bã cà phê, vỏ trứng, xương. Có thể ủ phân compost hoặc làm phân bón hữu cơ.', 
 true, false),

(gen_random_uuid(), 'Rác hữu cơ (cây xanh)', 
 'Lá cây rụng, cành cây nhỏ, cỏ cắt, hoa héo, mùn cưa. Phù hợp để ủ phân compost hoặc làm lớp phủ đất.', 
 true, false),

-- ═══════════════════════════════════════════════════════════
-- 🔴 NHÓM NGUY HẠI
-- ═══════════════════════════════════════════════════════════

(gen_random_uuid(), 'Rác điện tử', 
 'Điện thoại cũ, laptop hỏng, pin, bộ sạc, tai nghe, cáp điện, bóng đèn huỳnh quang. CẦN xử lý đặc biệt, không vứt chung rác thường.', 
 true, false),

(gen_random_uuid(), 'Chất thải nguy hại', 
 'Pin, ắc quy, thuốc hết hạn, hóa chất gia dụng, sơn cũ, dầu nhớt, thuốc trừ sâu. NGHIÊM CẤM vứt chung rác sinh hoạt.', 
 true, false),

(gen_random_uuid(), 'Rác y tế', 
 'Kim tiêm, bông băng đã sử dụng, thuốc hết hạn, khẩu trang y tế, bao tay y tế. Cần xử lý theo quy trình rác thải y tế.', 
 true, false),

-- ═══════════════════════════════════════════════════════════
-- ⚪ NHÓM KHÔNG TÁI CHẾ
-- ═══════════════════════════════════════════════════════════

(gen_random_uuid(), 'Rác sinh hoạt tổng hợp', 
 'Rác hỗn hợp không phân loại được, tã lót, băng vệ sinh, bụi bẩn, xốp bẩn, đồ dùng gia đình hỏng. Thu gom theo lịch rác thường.', 
 true, false),

(gen_random_uuid(), 'Rác cồng kềnh', 
 'Nội thất cũ (bàn, ghế, tủ), nệm, đệm, thiết bị gia dụng lớn (tủ lạnh, máy giặt). Cần hẹn lịch thu gom riêng.', 
 true, false),

(gen_random_uuid(), 'Rác xây dựng', 
 'Gạch vỡ, xi măng thừa, cát sỏi, gỗ phế liệu từ sửa nhà, ống nước PVC cũ, tấm tôn. Xử lý theo quy định rác thải xây dựng.', 
 true, false);

-- ═══════════════════════════════════════════════════════════
-- ✅ Kiểm tra kết quả
-- ═══════════════════════════════════════════════════════════
-- SELECT waste_type_id, name, is_recyclable, is_active FROM waste_types ORDER BY name;
