📦 FULL DATABASE SCHEMA — FINAL MVP VERSION
========================
1️⃣ USER
========================
user_id (uuid, PK)
first_name (string)
last_name (string)
display_name (string)   ← dùng cho Enterprise
email (string, unique)
password_hash (string)
phone (string)
avatar_url (string)

account_status (enum)
role (enum)

created_at (datetime)
updated_at (datetime)
deleted_at (datetime)

refresh_token (string)
refresh_token_expiry (datetime)

========================
2️⃣ CITIZEN
========================
user_id (uuid, PK, FK → USER.user_id)

default_area_id (uuid, FK → SERVICE_AREA.area_id)

address_text (string)
latitude (float)
longitude (float)

points (int)

created_at (datetime)
updated_at (datetime)

========================
3️⃣ COLLECTOR
========================
user_id (uuid, PK, FK → USER.user_id)

enterprise_user_id (uuid, FK → USER.user_id)

default_area_id (uuid, FK → SERVICE_AREA.area_id)

status (string)

created_at (datetime)
updated_at (datetime)

========================
4️⃣ SERVICE_AREA
========================
area_id (uuid, PK)

name (string)

geo_boundary_wkt (string)

is_active (boolean)

created_at (datetime)
updated_at (datetime)

========================
5️⃣ WASTE_TYPE
========================
waste_type_id (uuid, PK)

name (string)
description (string)

is_recyclable (boolean)
is_active (boolean)

========================
6️⃣ WASTE_REPORT
========================
report_id (uuid, PK)

reporter_user_id (uuid, FK → USER.user_id)

area_id (uuid, FK → SERVICE_AREA.area_id)

requested_pickup_time (datetime)

waste_type_id (uuid, FK → WASTE_TYPE.waste_type_id)

description (string)

status (string)

created_at (datetime)

latitude (double)
longitude (double)

gps_accuracy_meters (double)

report_photo_url (string)

========================
7️⃣ TASK
========================
task_id (uuid, PK)

enterprise_user_id (uuid, FK → USER.user_id)

created_by_user_id (uuid, FK → USER.user_id)

area_id (uuid, FK → SERVICE_AREA.area_id)

report_id (uuid, FK → WASTE_REPORT.report_id)

scheduled_date (date)

priority (string)

status (string)

created_at (datetime)
updated_at (datetime)

========================
8️⃣ TASK_ASSIGNMENT
========================
assignment_id (uuid, PK)

task_id (uuid, FK → TASK.task_id)

collector_user_id (uuid, FK → USER.user_id)

accepted_at (datetime)
unassigned_at (datetime)

status (string)

collector_note (string)

========================
9️⃣ COLLECTION_VISIT
========================
visit_id (uuid, PK)

task_id (uuid, FK → TASK.task_id)

collector_user_id (uuid, FK → USER.user_id)

visited_at (datetime)

visit_status (string)

collector_note (string)

========================
🔟 EVIDENCE_PHOTO
========================
photo_id (uuid, PK)

visit_id (uuid, FK → COLLECTION_VISIT.visit_id)

photo_url (string)

taken_at (datetime)

note (string)

========================
1️⃣1️⃣ VISIT_WASTE_ITEM
========================
item_id (uuid, PK)

visit_id (uuid, FK → COLLECTION_VISIT.visit_id)

waste_type_id (uuid, FK → WASTE_TYPE.waste_type_id)

sorting_level (string)

weight_kg (float)

contamination_note (string)

========================
1️⃣2️⃣ REWARD_TRANSACTION
========================
transaction_id (uuid, PK)

citizen_user_id (uuid, FK → USER.user_id)

visit_id (uuid, FK → COLLECTION_VISIT.visit_id)

complaint_id (uuid, FK → COMPLAINT.complaint_id)

points_delta (float)

reason_code (string)

created_at (datetime)

created_by_admin_id (uuid, FK → USER.user_id)

========================
1️⃣3️⃣ COMPLAINT
========================
complaint_id (uuid, PK)

created_by_user_id (uuid, FK → USER.user_id)

report_id (uuid, FK → WASTE_REPORT.report_id)

visit_id (uuid, FK → COLLECTION_VISIT.visit_id)

content (string)

status (string)

created_at (datetime)

reward_transaction_id (uuid, FK → REWARD_TRANSACTION.transaction_id)

========================
1️⃣4️⃣ COMPLAINT_RESOLUTION
========================
resolution_id (uuid, PK)

complaint_id (uuid, FK → COMPLAINT.complaint_id)

admin_user_id (uuid, FK → USER.user_id)

decision (string)

note (string)

is_accepted (boolean)

resolved_at (datetime)

========================
1️⃣5️⃣ COLLECTOR_KPI_DAILY
========================
kpi_id (uuid, PK)

collector_user_id (uuid, FK → USER.user_id)

area_id (uuid, FK → SERVICE_AREA.area_id)

kpi_date (date)

min_weight_kg (float)

min_visits (int)

actual_weight_kg (float)

actual_visits (int)

status (string)

updated_at (datetime)

========================
1️⃣6️⃣ ENTERPRISE_CAPABILITY
========================
capability_id (uuid, PK)

enterprise_user_id (uuid, FK → USER.user_id)

waste_type_id (uuid, FK → WASTE_TYPE.waste_type_id)

daily_capacity_kg (float)

effective_from (date)
effective_to (date)

service_area_id (uuid, FK → SERVICE_AREA.area_id)

========================
1️⃣7️⃣ CITIZEN_REWARD_RULE
========================
rule_id (uuid, PK)

waste_type_id (uuid, FK → WASTE_TYPE.waste_type_id)

sorting_level (string)

points_per_kg (float)

points_fixed (float)

effective_from (date)
effective_to (date)

is_active (boolean)