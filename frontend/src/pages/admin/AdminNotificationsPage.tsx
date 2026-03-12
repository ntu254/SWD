import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Search, ShieldAlert } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "react-toastify";

import { notificationsApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  ModalShell,
  PageHeader,
  PageHero,
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
  type: "SYSTEM",
  targetAudience: "ALL",
  priority: "NORMAL",
  startDate: "",
  endDate: "",
};

function getPriorityVariant(priority: string) {
  switch (priority) {
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
    mutationFn: (body: object) => notificationsApi.create(body),
    onSuccess: () => {
      toast.success("Notification created.");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to create notification."),
  });

  const deactivateNotification = useMutation({
    mutationFn: (id: string) => notificationsApi.deactivate(id),
    onSuccess: () => {
      toast.success("Notification deactivated.");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      setDeactivateTarget(null);
    },
    onError: () => toast.error("Failed to deactivate notification."),
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
          title="Create notification"
          description="Publish a system, reward or operations message to the selected audience."
          icon={Plus}
          onClose={() => setShowCreate(false)}
          widthClassName="max-w-2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createNotification.mutate(form)}
                disabled={
                  createNotification.isPending || !form.title.trim() || !form.content.trim()
                }
              >
                {createNotification.isPending ? "Publishing..." : "Publish"}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="notification-title" className="field-label">
                Title
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
                Content
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
                Type
              </label>
              <select
                id="notification-type"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value }))
                }
                className="shell-select"
              >
                {["SYSTEM", "REWARD", "TASK", "REPORT", "ANNOUNCEMENT"].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-audience" className="field-label">
                Audience
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
                {["ALL", "CITIZEN", "COLLECTOR", "ENTERPRISE"].map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-priority" className="field-label">
                Priority
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
                {["HIGH", "NORMAL", "LOW"].map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notification-start" className="field-label">
                Start date
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
                End date
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
          title="Deactivate notification"
          description="Users will no longer see this message once it is deactivated."
          icon={ShieldAlert}
          onClose={() => setDeactivateTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deactivateNotification.mutate(deactivateTarget.id)}
                disabled={deactivateNotification.isPending}
              >
                {deactivateNotification.isPending ? "Deactivating..." : "Deactivate"}
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
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="Notification center"
        description="Create platform-wide messages, review active announcements and manage delivery windows in one consistent admin surface."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New notification
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
          label="Total notifications"
          value={notifications.length}
          description="All notification records in the current list."
          tone="sand"
          featured
        />
        <StatCard
          icon={ShieldAlert}
          label="Active"
          value={activeCount}
          description="Messages currently visible to users."
          tone="mint"
        />
        <StatCard
          icon={Plus}
          label="Scheduled windows"
          value={scheduledCount}
          description="Notifications with a start or end date configured."
          tone="sky"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Broadcast list"
          description="Search by title or message content, then deactivate live broadcasts as needed."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications by title or content"
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
              title="No notifications found"
              description="Create a new message or adjust the search term to review existing broadcasts."
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
                          {notification.priority}
                        </Badge>
                        <Badge variant="assigned">{notification.type}</Badge>
                        <Badge variant="accepted">{notification.targetAudience}</Badge>
                        <Badge
                          variant={notification.isActive ? "collected" : "secondary"}
                        >
                          {notification.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </div>

                      <p className="max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
                        {notification.content}
                      </p>

                      <p className="text-sm text-[var(--text-secondary)]">
                        Created {new Date(notification.createdAt).toLocaleDateString()}
                        {notification.startDate
                          ? ` | Starts ${new Date(notification.startDate).toLocaleDateString()}`
                          : ""}
                        {notification.endDate
                          ? ` | Ends ${new Date(notification.endDate).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>

                    {notification.isActive ? (
                      <Button
                        variant="destructive"
                        onClick={() => setDeactivateTarget(notification)}
                      >
                        Deactivate
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
