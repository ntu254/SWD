import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Search, ShieldAlert } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "react-toastify";

import { notificationsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  formatNotificationAudienceLabel,
  formatNotificationTypeLabel,
  formatPriorityLabel,
} from "../../lib/labels";
import {
  EmptyState,
  ModalShell,
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

type Notification = {
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

type NotificationForm = {
  title: string;
  content: string;
  type: string;
  targetAudience: string;
  priority: string;
  startDate: string;
  endDate: string;
};

const EMPTY_FORM: NotificationForm = {
  title: "",
  content: "",
  type: "General",
  targetAudience: "All",
  priority: "Normal",
  startDate: "",
  endDate: "",
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

export function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<NotificationForm>(EMPTY_FORM);
  const [deactivateTarget, setDeactivateTarget] = useState<Notification | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => notificationsApi.getAll(0).then((response) => response.data),
  });

  const createNotification = useMutation({
    mutationFn: (body: NotificationForm) =>
      notificationsApi.create({
        title: body.title.trim(),
        content: body.content.trim(),
        type: body.type,
        targetAudience: body.targetAudience,
        priority: body.priority,
        startDate: body.startDate ? `${body.startDate}T00:00:00` : undefined,
        endDate: body.endDate ? `${body.endDate}T23:59:59` : undefined,
      }),
    onSuccess: () => {
      toast.success("Đã tạo thông báo.");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Tạo thông báo thất bại."),
  });

  const deactivateNotification = useMutation({
    mutationFn: (id: string) => notificationsApi.deactivate(id),
    onSuccess: () => {
      toast.success("Đã ngừng kích hoạt thông báo.");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setDeactivateTarget(null);
    },
    onError: () => toast.error("Ngừng kích hoạt thông báo thất bại."),
  });

  const notifications: Notification[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(normalizedSearch) ||
      notification.content.toLowerCase().includes(normalizedSearch),
  );
  const activeCount = notifications.filter((notification) => notification.isActive).length;
  const scheduledCount = notifications.filter(
    (notification) => notification.startDate || notification.endDate,
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      {showCreate ? (
        <ModalShell
          title="Tạo thông báo"
          description="Phát đi thông báo hệ thống, phần thưởng hoặc vận hành tới nhóm đối tượng đã chọn."
          icon={Plus}
          onClose={() => setShowCreate(false)}
          widthClassName="max-w-2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => createNotification.mutate(form)}
                disabled={
                  createNotification.isPending || !form.title.trim() || !form.content.trim()
                }
              >
                {createNotification.isPending ? "Đang phát hành..." : "Phát hành"}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="notification-title" className="field-label">
                Tiêu đề
              </label>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notification-content" className="field-label">
                Nội dung
              </label>
              <textarea
                id="notification-content"
                value={form.content}
                onChange={(event) =>
                  setForm((current) => ({ ...current, content: event.target.value }))
                }
                rows={4}
                className="shell-textarea"
              />
            </div>

            <div>
              <label htmlFor="notification-type" className="field-label">
                Loại
              </label>
              <select
                id="notification-type"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
                className="shell-select"
              >
                {["General", "Maintenance", "Update", "Promotion", "Alert"].map((type) => (
                  <option key={type} value={type}>
                    {formatNotificationTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-audience" className="field-label">
                Đối tượng
              </label>
              <select
                id="notification-audience"
                value={form.targetAudience}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetAudience: event.target.value,
                  }))
                }
                className="shell-select"
              >
                {["All", "Citizen", "Collector", "Enterprise"].map((audience) => (
                  <option key={audience} value={audience}>
                    {formatNotificationAudienceLabel(audience)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-priority" className="field-label">
                Mức ưu tiên
              </label>
              <select
                id="notification-priority"
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value,
                  }))
                }
                className="shell-select"
              >
                {["Urgent", "High", "Normal", "Low"].map((priority) => (
                  <option key={priority} value={priority}>
                    {formatPriorityLabel(priority.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-start" className="field-label">
                Ngày bắt đầu
              </label>
              <Input
                id="notification-start"
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notification-end" className="field-label">
                Ngày kết thúc
              </label>
              <Input
                id="notification-end"
                type="date"
                value={form.endDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, endDate: event.target.value }))
                }
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {deactivateTarget ? (
        <ModalShell
          title="Ngừng kích hoạt thông báo"
          description="Người dùng sẽ không còn nhìn thấy thông báo này sau khi bạn ngừng kích hoạt."
          icon={ShieldAlert}
          onClose={() => setDeactivateTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deactivateNotification.mutate(deactivateTarget.id)}
                disabled={deactivateNotification.isPending}
              >
                {deactivateNotification.isPending ? "Đang ngừng kích hoạt..." : "Ngừng kích hoạt"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {deactivateTarget.title}
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian quản trị</span>}
        title="Trung tâm thông báo"
        description="Tạo thông báo toàn nền tảng, xem các bản tin đang hoạt động và quản lý khoảng thời gian hiển thị trong một giao diện thống nhất."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thông báo mới
          </Button>
        }
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Broadcast control</span>}
        title="Coordinate platform messaging without leaving the admin shell."
        description="Notification publishing and deactivation continue to use the same admin endpoints. This redesign tightens the creation flow and makes live announcements easier to scan."
        tone="sand"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--warning-50)] text-[var(--warning-600)]">
                <Bell className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Active broadcasts
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Bell}
          label="Tổng thông báo"
          value={notifications.length}
          description="Toàn bộ bản ghi thông báo trong danh sách hiện tại."
          tone="sand"
          featured
        />
        <StatCard
          icon={ShieldAlert}
          label="Đang hoạt động"
          value={activeCount}
          description="Những thông báo hiện đang hiển thị với người dùng."
          tone="mint"
        />
        <StatCard
          icon={Plus}
          label="Khoảng thời gian đặt lịch"
          value={scheduledCount}
          description="Những thông báo có cấu hình ngày bắt đầu hoặc kết thúc."
          tone="sky"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Danh sách phát thông báo"
          description="Tìm theo tiêu đề hoặc nội dung, sau đó ngừng kích hoạt các thông báo đang phát khi cần."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm thông báo theo tiêu đề hoặc nội dung"
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
              description="Tạo thông báo mới hoặc đổi từ khóa tìm kiếm để xem các bản tin hiện có."
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="shell-card shell-card-hover rounded-[26px] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          {notification.title}
                        </p>
                        <Badge variant={getPriorityVariant(notification.priority)}>
                          {formatPriorityLabel(notification.priority)}
                        </Badge>
                        <Badge variant="assigned">{formatNotificationTypeLabel(notification.type)}</Badge>
                        <Badge variant="accepted">{formatNotificationAudienceLabel(notification.targetAudience)}</Badge>
                        <Badge
                          variant={notification.isActive ? "collected" : "secondary"}
                        >
                          {notification.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                        </Badge>
                      </div>

                      <p className="max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
                        {notification.content}
                      </p>

                      <p className="text-sm text-[var(--text-secondary)]">
                        Tạo ngày {new Date(notification.createdAt).toLocaleDateString()}
                        {notification.startDate
                          ? ` | Bắt đầu ${new Date(notification.startDate).toLocaleDateString()}`
                          : ""}
                        {notification.endDate
                          ? ` | Kết thúc ${new Date(notification.endDate).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>

                    {notification.isActive ? (
                      <Button
                        variant="destructive"
                        onClick={() => setDeactivateTarget(notification)}
                      >
                        Ngừng kích hoạt
                      </Button>
                    ) : null}
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
