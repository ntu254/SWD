Mô tả của dự án 
Citizen
•        Báo cáo rác/tái chế cần thu gom (ảnh + GPS + mô tả).
•        Theo dõi trạng thái thu gom của từng báo cáo (Pending / Accepted / Assigned / Collected).
•        Thực hiện phân loại rác tại nguồn (chọn loại rác khi tạo báo cáo).
•        Nhận điểm thưởng khi báo cáo hợp lệ và phân loại đúng.
•        Xem lịch sử điểm thưởng và bảng xếp hạng theo khu vực.
•        Gửi phản hồi hoặc khiếu nại khi việc thu gom không đúng cam kết.
Recycling Enterprise
•        Đăng ký và quản lý năng lực xử lý rác: Loại rác tiếp nhận/Công suất xử lý/Khu vực phục vụ
•        Nhận và quyết định tiếp nhận hoặc từ chối các yêu cầu thu gom trong phạm vi hoạt động.
•        Xem danh sách yêu cầu thu gom được gợi ý ưu tiên xử lý dựa trên các tiêu chí cấu hình. (optional)
•        Gán và điều phối yêu cầu thu gom cho Collector thuộc doanh nghiệp.
•        Theo dõi tiến độ xử lý và trạng thái thu gom theo thời gian thực.
•        Xem báo cáo khối lượng rác đã thu gom và tái chế theo loại/khu vực/thời gian.
•        Tạo và cấu hình quy tắc tính điểm thưởng cho Citizen (theo loại rác, chất lượng báo cáo, thời gian xử lý…).
- Quản lí các đơn khiếu nại liên quan tới collector
Collector
•        Nhận các yêu cầu thu gom được phân công từ Recycling Enterprise.
•        Cập nhật trạng thái thu gom theo thời gian thực (Assigned / On the way / Collected).
•        Xác nhận hoàn tất thu gom bằng hình ảnh và thông tin trạng thái.
•        Xem lịch sử công việc và số lượng yêu cầu đã hoàn thành.

Administrator 
•        Quản lí tài khoản người dùng và phân quyền:(CRUD)
•        Giám sát hoạt động tổng thể của hệ thống. 
                                (Hệ thống hiển thị dashboard tổng quan, bao gồm:
                               Tổng số báo cáo thu gom theo trạng thái (Pending, Accepted, Assigned, Collected).
                               Thống kê báo cáo theo khu vực và thời gian.
                               Hiệu suất xử lý của các Recycling Enterprise.
                               Hiệu suất làm việc của Collector.
                               Thống kê điểm thưởng và khiếu nại.)

- Quản lí các đơn kiểu nại liên quan tới hệ thống (ví dụ: cộng điểm sai, bug) 
- Quản lí thông báo 
- Quản lí doanh nghiệp 
- Quản lí phần thưởng đổi điểm 
- Setting(option: configapi,....)

* Tùy chọn: AI hỗ trợ phân loại rác (Decision Support):
Input: ảnh rác do Citizen upload
Output: gợi ý loại rác (Organic / Recyclable / Hazardous…)
Người dùng xác nhận lại trước khi gửi 

đây là database 

1. Người dùng & phân quyền
APP_USER
👉 Bảng lõi cho mọi loại người dùng (Citizen / Collector / Enterprise staff / Admin)
•	id – định danh user
•	full_name, email, phone, avatar_url
•	password_hash
•	status – active / blocked / deleted
•	last_login_at, created_at, updated_at, deleted_at
________________________________________
USER_ROLE
👉 Một user có thể có nhiều role hệ thống
•	user_id – FK → APP_USER
•	role – ADMIN / CITIZEN / COLLECTOR / ENTERPRISE
•	created_at
________________________________________
2. Hồ sơ theo vai trò
CITIZEN_PROFILE
👉 Mở rộng cho Citizen
•	user_id (PK, FK)
•	default_location_id – vị trí mặc định
•	points_balance – tổng điểm hiện tại
•	rank_scope – phạm vi xếp hạng
•	updated_at
________________________________________
COLLECTOR_PROFILE
👉 Hồ sơ Collector
•	user_id (PK, FK)
•	enterprise_id – thuộc doanh nghiệp nào
•	availability_status – available / busy
•	vehicle_type, max_load_kg
•	updated_at
________________________________________
3. Doanh nghiệp tái chế
ENTERPRISE
👉 Doanh nghiệp tái chế
•	id, name, tax_code
•	contact_email, contact_phone
•	address_location_id
•	status
•	created_at, updated_at, deleted_at
________________________________________
ENTERPRISE_SERVICE_CONFIG
👉 Cấu hình năng lực xử lý
•	enterprise_id (PK, FK)
•	capacity_per_day, capacity_unit
•	service_area_type (district / city / polygon…)
•	service_area_data (JSON)
•	priority_rules (JSON)
•	updated_at
________________________________________
ENTERPRISE_MEMBER
👉 User thuộc doanh nghiệp (staff / manager)
•	enterprise_id
•	user_id
•	role_in_enterprise
•	created_at
________________________________________
4. Định vị
LOCATION
👉 Lưu vị trí chuẩn hóa
•	id
•	address_text, ward, district, city
•	lat, lng, geohash
•	created_at, updated_at
________________________________________
5. Rác & phân loại
WASTE_TYPE
👉 Danh mục loại rác
•	id
•	code, name, description
•	category (Organic / Recyclable / Hazardous…)
•	is_hazardous
•	created_at, updated_at
________________________________________
ENTERPRISE_WASTE_TYPE
👉 Doanh nghiệp nhận loại rác nào
•	enterprise_id
•	waste_type_id
•	created_at
________________________________________
6. Báo cáo rác của Citizen
WASTE_REPORT
👉 Báo cáo rác (trung tâm nghiệp vụ)
•	id
•	citizen_id
•	location_id
•	description
•	waste_type_id
•	status (Pending / Accepted / Assigned / Collected)
•	is_verified, verified_by_user_id, verified_at
•	created_at, updated_at
________________________________________
WASTE_REPORT_IMAGE
👉 Ảnh của báo cáo
•	id
•	report_id
•	image_url, thumb_url
•	taken_at, created_at
________________________________________
7. Thu gom
COLLECTION_REQUEST
👉 Nhiệm vụ thu gom do báo cáo sinh ra
•	id
•	report_id
•	enterprise_id
•	collector_id
•	status
•	accepted_at, assigned_at, on_way_at, collected_at
•	collector_proof_image_url
•	note
•	created_at, updated_at
________________________________________
STATUS_HISTORY
👉 Audit trail cho mọi trạng thái
•	id
•	target_type, target_id
•	from_status, to_status
•	actor_user_id
•	timestamp
•	meta (JSON)
________________________________________
8. Điểm thưởng & quy tắc
POINT_RULE
👉 Quy tắc cộng điểm
•	id
•	enterprise_id
•	name, is_active
•	effective_from, effective_to
•	rule_json (logic tính điểm)
•	points, priority
•	created_by_user_id
•	created_at, updated_at
________________________________________
REWARD_TRANSACTION
👉 Giao dịch điểm (cộng / trừ)
•	id
•	citizen_id
•	request_id
•	type
•	points
•	reason
•	balance_after
•	created_by_user_id
•	created_at
________________________________________
9. Phần thưởng đổi điểm
REWARD_ITEM
👉 Phần thưởng
•	id
•	name
•	points_cost
•	stock
•	status
•	created_at, updated_at
________________________________________
REWARD_REDEMPTION
👉 Lịch sử đổi thưởng
•	id
•	citizen_id
•	reward_item_id
•	status
•	points_used
•	created_at, updated_at
________________________________________
10. Khiếu nại & phản hồi
COMPLAINT
👉 Khiếu nại (collector / hệ thống)
•	id
•	complainant_id
•	request_id
•	category
•	message
•	status
•	resolver_user_id
•	resolution_note
•	created_at, resolved_at
________________________________________
COMPLAINT_ATTACHMENT
👉 File đính kèm khiếu nại
•	id
•	complaint_id
•	file_url
•	created_at
________________________________________
FEEDBACK
👉 Đánh giá / phản hồi nhẹ
•	id
•	sender_id
•	report_id
•	message
•	feedback_type
•	rating
•	created_at
________________________________________
11. Thông báo & thiết bị
NOTIFICATION
👉 Thông báo hệ thống
•	id
•	recipient_user_id
•	title, message
•	type
•	is_read, read_at
•	created_at
________________________________________
DEVICE_TOKEN
👉 Push notification
•	id
•	user_id
•	platform
•	token
•	last_seen_at, created_at
________________________________________
12. Xếp hạng
LEADERBOARD_SNAPSHOT
👉 Snapshot bảng xếp hạng
•	id
•	scope_type, scope_id
•	waste_type_id
•	period_type
•	period_start, period_end
•	calculated_at
________________________________________
LEADERBOARD_ENTRY
👉 Thứ hạng từng user
•	snapshot_id
•	user_id
•	rank
•	points
________________________________________
13. AI hỗ trợ phân loại
AI_CLASSIFICATION_RESULT
👉 Kết quả AI gợi ý loại rác
•	id
•	report_id
•	suggested_waste_type_id
•	confidence
•	alternatives (JSON)
•	model_version
•	created_at
ASSIGNMENT_LOG
- report_id
- enterprise_id
- score
- reason_json
- created_at
________________________________________
COLLECTOR_LOCATION_LOG
- collector_id
- lat
- lng
- accuracy
- recorded_at
________________________________________
REPORT_REVIEW
- report_id
- reviewer_id
- result (APPROVED / REJECTED)
- reason
- created_at
________________________________________

SYSTEM_CONFIG
- key (UK)
- value (jsonb)
- description
- updated_by
- updated_at


và hiện tại tôi đang triển khai chức năng Quản lí phần thưởng đổi điểm của Administrator , hãy sửa đổi các file cần thiết trong folder  agent-utils và workflows  