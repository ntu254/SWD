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

1. Nhóm người dùng (User & Role profile)
USER
Bảng lõi lưu thông tin đăng nhập chung cho mọi loại người dùng.
user_id (PK)
full_name
email
phone
role (phân loại: CITIZEN / COLLECTOR / ADMIN / …)
points (điểm thưởng tích lũy)
status (active, inactive, blocked,…)
Tất cả các bảng hồ sơ chi tiết đều tham chiếu tới USER.

CITIZEN
Hồ sơ công dân (mở rộng từ USER).
user_id (PK, FK → USER)
area_id (FK → SERVICE_AREA)
full_name, phone
address_text
latitude, longitude
status
point (điểm hiện có)
Một công dân thuộc một khu vực phục vụ và có thể tạo nhiều báo cáo rác.

COLLECTOR
Hồ sơ nhân viên thu gom.
user_id (PK, FK → USER)
full_name, phone
employment_status
current_service_id (FK → SERVICE_AREA)
Một collector có thể được gán nhiều nhiệm vụ thu gom.

ADMIN
Hồ sơ quản trị viên.
user_id (PK, FK → USER)
full_name, email
status
Admin xử lý khiếu nại, phê duyệt kết quả,…

2. Khu vực phục vụ
SERVICE_AREA
Định nghĩa khu vực hoạt động.
area_id (PK)
user_id (FK → USER, người quản lý/khu vực)
name
geo_boundary_wkt (biên dạng khu vực)
is_active
created_at
Quan hệ:
Một SERVICE_AREA có nhiều CITIZEN
Một SERVICE_AREA có nhiều COLLECTOR
Dùng để giới hạn nhiệm vụ trong từng khu vực.

3. Báo cáo rác và nhiệm vụ thu gom
WASTE_REPORT
Công dân báo điểm có rác cần xử lý.
report_id (PK)
user_id (FK → CITIZEN/USER)
area_id (FK → SERVICE_AREA)
estimated_weight_kg
location_text
lat, lng
description
status
created_at
Một báo cáo có thể sinh ra một hoặc nhiều nhiệm vụ.

TASK
Nhiệm vụ thu gom được tạo từ báo cáo.
task_id (PK)
area_id (FK → SERVICE_AREA)
report_id (FK → WASTE_REPORT)
scheduled_date
priority
status
created_at
Một task sẽ được gán cho collector qua bảng trung gian.

TASK_ASSIGNMENT
Gán collector cho task.
assignment_id (PK)
task_id (FK → TASK)
user_id (FK → COLLECTOR/USER)
assigned_at
accepted_at
completed_at
status
Quan hệ N–N giữa Collector và Task (mỗi task có thể đổi người thực hiện theo thời gian).

4. Ghi nhận quá trình thu gom
COLLECTION_VISIT
Lần ghé thu gom thực tế tại điểm báo cáo.
visit_id (PK)
task_id (FK → TASK)
collector_id (FK → COLLECTOR/USER)
visited_at
result_status
note
collected_weight
Một task có thể có nhiều visit (ví dụ quay lại nhiều lần).

EVIDENCE_PHOTO
Ảnh minh chứng.
photo_id (PK)
visit_id (FK → COLLECTION_VISIT)
photo_url
taken_at
note
Mỗi lần thu gom có nhiều ảnh chứng minh trước/sau.

5. Phân loại rác và tính điểm thưởng
WASTE_TYPE
Loại rác.
waste_type_id (PK)
name
description
is_recyclable
is_active

WASTE_SCORE_SYSTEM
Quy tắc tính điểm theo loại rác.
score_id (PK)
waste_type_id (FK → WASTE_TYPE)
score_per_kg
multiplier
effective_from
effective_to

CITIZEN_REWARD_RULE
Quy tắc thưởng cho công dân.
rule_id (PK)
waste_type_id (FK → WASTE_TYPE)
points_per_kg
bonus_fixed
effective_from
effective_to

REWARD_TRANSACTION
Giao dịch cộng/trừ điểm cho công dân.
txn_id (PK)
user_id (FK → CITIZEN/USER)
task_id (FK → TASK)
visit_id (FK → COLLECTION_VISIT)
points_delta
reason_code
created_at
Khi hoàn thành thu gom và xác định khối lượng/loại rác → sinh bản ghi thưởng điểm.

6. Năng lực xử lý theo loại rác
ENTERPRISE_CAPABILITY
Khả năng xử lý rác của đơn vị/khu vực.
capability_id (PK)
area_id (FK → SERVICE_AREA)
waste_type_id (FK → WASTE_TYPE)
daily_capacity_kg
status
note
Dùng để điều phối, tránh giao quá tải.

7. Khiếu nại và xử lý
COMPLAINT
Khiếu nại của công dân về kết quả thu gom.
complaint_id (PK)
user_id (FK → CITIZEN/USER)
report_id (FK → WASTE_REPORT)
task_id (FK → TASK)
content
status
created_at

COMPLAINT_RESOLUTION
Kết quả xử lý khiếu nại (do admin thực hiện).
resolution_id (PK)
complaint_id (FK → COMPLAINT)
resolver_id (FK → ADMIN/USER)
decision
note
resolved_at
Một complaint có thể có một bản resolution cuối cùng.

8. Đánh giá hiệu suất nhân viên
COLLECTOR_KPI_DAILY
Chỉ số hiệu suất theo ngày của collector.
kpi_id (PK)
user_id (FK → COLLECTOR/USER)
area_id (FK → SERVICE_AREA)
kpi_date
tasks_completed
total_weight_kg
on_time_rate
rating
computed_at
Dùng cho báo cáo, thưởng/phạt nội bộ.