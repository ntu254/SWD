import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, RefreshCw, Search, ShieldAlert } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { notificationsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import {
  formatNotificationAudienceLabel,
  formatNotificationTypeLabel,
  formatPriorityLabel,
  formatRoleLabel,
} from "../../lib/labels";
import { useAuthStore } from "../../store/authStore";

type NotificationItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  priority: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

function getPriorityVariant(priority: string) {
  switch (priority.toUpperCase()) {
    case "URGENT":
    case "HIGH":
      return "destructive" as const;
    case "LOW":
      return "secondary" as const;
    default:
      return "accepted" as const;
  }
}

function formatNotificationWindow(notification: NotificationItem) {
  if (!notification.startDate && !notification.endDate) {
    return "Hiển thị ngay";
  }

  const parts = [];
  if (notification.startDate) {
    parts.push(`Bắt đầu ${new Date(notification.startDate).toLocaleString()}`);
  }
  if (notification.endDate) {
    parts.push(`Kết thúc ${new Date(notification.endDate).toLocaleString()}`);
  }

  return parts.join(" | ");
}

export function NotificationsInboxPage() {
  const role = useAuthStore((state) => state.role) ?? "CITIZEN";
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications-inbox", role],
    queryFn: () => notificationsApi.getForUser(0).then((response) => response.data),
    refetchInterval: 60_000,
  });

  const notifications: NotificationItem[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredNotifications = notifications.filter((notification) => {
    const haystack = [
      notification.title,
      notification.content,
      notification.type,
      notification.priority,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const highPriorityCount = notifications.filter((notification) =>
    ["HIGH", "URGENT"].includes(notification.priority.toUpperCase()),
  ).length;
  const scheduledCount = notifications.filter(
    (notification) => notification.startDate || notification.endDate,
  ).length;
  const roleLabel = formatRoleLabel(role);

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian {roleLabel.toLowerCase()}</span>}
        title="Thông báo"
        description="Xem các thông báo đang hoạt động, cảnh báo vận hành và tin nhắn theo lịch dành cho vai trò của bạn."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Hộp thư đang hoạt động</span>}
        title="Một nơi duy nhất để theo dõi cập nhật từ nền tảng."
        description="Thông báo được lấy trực tiếp từ luồng backend theo vai trò hiện tại, nên các bản tin từ quản trị giờ đã có nơi hiển thị rõ ràng trên web."
        tone="sky"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--accent-100)] text-[var(--accent-600)]">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Đối tượng
                </p>
                <p className="text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {roleLabel}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Hiện có {notifications.length} thông báo đang hiển thị cho không gian này.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Bell}
          label="Đang hiển thị"
          value={notifications.length}
          description="Các thông báo đang hiển thị từ luồng backend."
          tone="sky"
          featured
        />
        <StatCard
          icon={ShieldAlert}
          label="Ưu tiên cao"
          value={highPriorityCount}
          description="Thông báo được đánh dấu cao hoặc khẩn cấp."
          tone="peach"
        />
        <StatCard
          icon={Clock}
          label="Khung thời gian"
          value={scheduledCount}
          description="Thông báo có cấu hình thời gian bắt đầu hoặc kết thúc."
          tone="mint"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Danh sách thông báo"
          description="Tìm theo tiêu đề, nội dung hoặc loại để mở đúng thông báo bạn cần."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm thông báo theo tiêu đề, nội dung hoặc loại"
                className="pl-11"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-[24px]" />
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Không tìm thấy thông báo"
              description={
                notifications.length === 0
                  ? "Hiện chưa có thông báo nào đang hoạt động cho không gian làm việc của bạn."
                  : "Hãy thử từ khóa khác để tìm thông báo bạn cần."
              }
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="shell-card shell-card-hover rounded-[26px] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[var(--text-primary)]">
                        {notification.title}
                      </p>
                      <Badge variant={getPriorityVariant(notification.priority)}>
                        {formatPriorityLabel(notification.priority)}
                      </Badge>
                      <Badge variant="assigned">
                        {formatNotificationTypeLabel(notification.type)}
                      </Badge>
                      <Badge variant="accepted">
                        {formatNotificationAudienceLabel(notification.targetAudience)}
                      </Badge>
                    </div>

                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {notification.content}
                    </p>

                    <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
                      <span>Đăng lúc {new Date(notification.createdAt).toLocaleString()}</span>
                      <span>{formatNotificationWindow(notification)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
