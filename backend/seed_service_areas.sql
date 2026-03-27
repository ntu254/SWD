-- =============================================================
-- Dữ liệu Khu Vực Phục Vụ (Service Areas) - Tiếng Việt
-- Database: PostgreSQL
-- Table: service_areas
-- =============================================================

-- Xóa dữ liệu cũ (tùy chọn)
-- DELETE FROM service_areas;

INSERT INTO service_areas (area_id, name, geo_boundary_wkt, is_active, created_at, updated_at) VALUES

-- Khu vực trung tâm Hà Nội
(gen_random_uuid(), 'Quận Cầu Giấy', 'POLYGON((105.78 21.03, 105.80 21.03, 105.80 21.01, 105.78 21.01, 105.78 21.03))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Đống Đa', 'POLYGON((105.81 21.02, 105.83 21.02, 105.83 21.00, 105.81 21.00, 105.81 21.02))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Ba Đình', 'POLYGON((105.80 21.04, 105.84 21.04, 105.84 21.02, 105.80 21.02, 105.80 21.04))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Hoàn Kiếm', 'POLYGON((105.84 21.03, 105.86 21.03, 105.86 21.01, 105.84 21.01, 105.84 21.03))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Hai Bà Trưng', 'POLYGON((105.84 21.01, 105.87 21.01, 105.87 20.99, 105.84 20.99, 105.84 21.01))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Thanh Xuân', 'POLYGON((105.80 21.00, 105.82 21.00, 105.82 20.98, 105.80 20.98, 105.80 21.00))', true, NOW(), NOW()),

-- Khu vực lân cận
(gen_random_uuid(), 'Quận Nam Từ Liêm', 'POLYGON((105.75 21.03, 105.78 21.03, 105.78 21.00, 105.75 21.00, 105.75 21.03))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Bắc Từ Liêm', 'POLYGON((105.74 21.07, 105.78 21.07, 105.78 21.03, 105.74 21.03, 105.74 21.07))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Tây Hồ', 'POLYGON((105.80 21.08, 105.83 21.08, 105.83 21.04, 105.80 21.04, 105.80 21.08))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Hoàng Mai', 'POLYGON((105.84 20.99, 105.88 20.99, 105.88 20.96, 105.84 20.96, 105.84 20.99))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Long Biên', 'POLYGON((105.86 21.05, 105.92 21.05, 105.92 21.01, 105.86 21.01, 105.86 21.05))', true, NOW(), NOW()),
(gen_random_uuid(), 'Quận Hà Đông', 'POLYGON((105.75 20.98, 105.79 20.98, 105.79 20.94, 105.75 20.94, 105.75 20.98))', true, NOW(), NOW());

-- =============================================================
-- ✅ Kiểm tra kết quả
-- =============================================================
-- SELECT area_id, name, is_active FROM service_areas ORDER BY name;
