const fallbackLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const ROLE_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  CITIZEN: "Công dân",
  COLLECTOR: "Nhân viên thu gom",
  ENTERPRISE: "Doanh nghiệp",
  ADMIN: "Quản trị viên",
};

export const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ xử lý",
  ACCEPTED: "Đã tiếp nhận",
  ASSIGNED: "Đã phân công",
  IN_PROGRESS: "Đang di chuyển",
  ON_THE_WAY: "Đang di chuyển",
  COMPLETED: "Hoàn thành",
  COLLECTED: "Đã thu gom",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  PENDING_ENTERPRISE_APPROVAL: "Chờ doanh nghiệp duyệt",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  DISABLED: "Đã vô hiệu hóa",
  BANNED: "Đã khóa",
  PENDING_DELETE: "Chờ xóa",
  OPEN: "Đang mở",
  RESOLVED: "Đã xử lý",
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Thấp",
  NORMAL: "Bình thường",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  URGENT: "Khẩn cấp",
};

export const SORTING_LEVEL_LABELS: Record<string, string> = {
  GOOD: "Tốt",
  ACCEPTABLE: "Đạt",
  FAIR: "Khá",
  POOR: "Kém",
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  General: "Chung",
  Maintenance: "Bảo trì",
  Update: "Cập nhật",
  Promotion: "Khuyến mãi",
  Alert: "Cảnh báo",
};

export const NOTIFICATION_AUDIENCE_LABELS: Record<string, string> = {
  All: "Tất cả",
  Citizen: "Công dân",
  Collector: "Nhân viên thu gom",
  Enterprise: "Doanh nghiệp",
};

export const REWARD_REASON_LABELS: Record<string, string> = {
  REPORT_COLLECTED: "Báo cáo đã được thu gom",
  REPORT_ACCEPTED: "Báo cáo đã được tiếp nhận",
  COLLECTION_REWARD: "Thưởng sau thu gom",
  REWARD_REDEEMED: "Đổi phần thưởng",
  REWARD_REDEMPTION: "Đổi phần thưởng",
  REDEEM_REWARD: "Đổi phần thưởng",
  ADMIN_ADJUSTMENT: "Điều chỉnh bởi quản trị",
  BONUS: "Thưởng thêm",
  MANUAL_ADJUSTMENT: "Điều chỉnh thủ công",
};

export function formatRoleLabel(role?: string | null) {
  if (!role) return "Người dùng";
  return ROLE_LABELS[role] ?? fallbackLabel(role);
}

export function formatStatusLabel(status?: string | null) {
  if (!status) return "Không xác định";
  return STATUS_LABELS[status] ?? fallbackLabel(status);
}

export function formatPriorityLabel(priority?: string | null) {
  if (!priority) return "Bình thường";
  return PRIORITY_LABELS[priority] ?? fallbackLabel(priority);
}

export function formatSortingLevelLabel(level?: string | null) {
  if (!level) return "Không xác định";
  return SORTING_LEVEL_LABELS[level] ?? fallbackLabel(level);
}

export function formatNotificationTypeLabel(type?: string | null) {
  if (!type) return "Thông báo";
  return NOTIFICATION_TYPE_LABELS[type] ?? type;
}

export function formatNotificationAudienceLabel(audience?: string | null) {
  if (!audience) return "Người dùng";
  return NOTIFICATION_AUDIENCE_LABELS[audience] ?? audience;
}

export function formatRewardReasonLabel(reasonCode?: string | null) {
  if (!reasonCode) return "Biến động điểm";
  if (reasonCode.startsWith("REDEMPTION:")) return "Đổi phần thưởng";
  return REWARD_REASON_LABELS[reasonCode] ?? fallbackLabel(reasonCode);
}