import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  ListTodo,
  MapPin,
  RefreshCw,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { enterpriseKpiApi, tasksApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  FilterTabs,
  ModalShell,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import { formatPriorityLabel, formatStatusLabel } from "../../lib/labels";

const STATUS_TABS = [
  { label: "TẤT CẢ", value: "ALL" },
  { label: "CHỜ DUYỆT", value: "PENDING_ENTERPRISE_APPROVAL" },
  { label: "ĐÃ PHÂN CÔNG", value: "ASSIGNED" },
  { label: "ĐANG DI CHUYỂN", value: "ON_THE_WAY" },
  { label: "HOÀN THÀNH", value: "COMPLETED" },
] as const;

interface Task {
  taskId: string;
  status: string;
  scheduledAt?: string;
  scheduledDate?: string;
  areaName?: string;
  enterpriseName?: string;
  priority?: string;
  collectorUserId?: string;
  collectorName?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Collector {
  userId: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

function getTaskVariant(status: string) {
  switch (status) {
    case "PENDING_ENTERPRISE_APPROVAL":
      return "pending" as const;
    case "ASSIGNED":
      return "assigned" as const;
    case "IN_PROGRESS":
    case "ON_THE_WAY":
      return "ontheway" as const;
    case "COMPLETED":
      return "collected" as const;
    case "CANCELLED":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function getPriorityVariant(priority?: string | null) {
  switch (priority) {
    case "HIGH":
      return "destructive" as const;
    case "LOW":
      return "accepted" as const;
    default:
      return "secondary" as const;
  }
}

function getCollectorName(collector: Collector) {
  return (
    collector.displayName ||
    `${collector.firstName ?? ""} ${collector.lastName ?? ""}`.trim() ||
    collector.email
  );
}

function AssignModal({
  task,
  collectors,
  onClose,
  onAssign,
  isPending,
}: {
  task: Task;
  collectors: Collector[];
  onClose: () => void;
  onAssign: (collectorUserId: string) => void;
  isPending: boolean;
}) {
  const [selected, setSelected] = useState("");

  return (
    <ModalShell
      title="Phân công nhiệm vụ cho nhân viên thu gom"
      description="Chọn một trong các nhân viên thu gom hiện có. Logic phân công và luồng backend vẫn giữ nguyên."
      icon={UserRoundPlus}
      onClose={onClose}
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={() => onAssign(selected)}
            disabled={!selected || isPending || collectors.length === 0}
          >
            {isPending ? "Đang phân công..." : "Phân công nhiệm vụ"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Mã nhiệm vụ
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
            {task.taskId}
          </p>
        </div>

        <div>
          <label htmlFor="collector-select" className="field-label">
            Chọn nhân viên thu gom
          </label>
          {collectors.length === 0 ? (
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Chưa có nhân viên thu gom nào được đăng ký cho doanh nghiệp này.
            </div>
          ) : (
            <select
              id="collector-select"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="shell-select"
            >
              <option value="">Chọn nhân viên thu gom</option>
              {collectors.map((collector) => (
                <option key={collector.userId} value={collector.userId}>
                  {getCollectorName(collector)} ({collector.email})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

export function EnterpriseTasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["enterprise-tasks-list", activeTab],
    queryFn: () =>
      tasksApi
        .getEnterpriseTasks(
          0,
          activeTab === "ALL" ? undefined : activeTab,
        )
        .then((response) => response.data),
    refetchInterval: 30000,
  });

  const { data: collectorsData } = useQuery({
    queryKey: ["enterprise-collectors"],
    queryFn: () => enterpriseKpiApi.getCollectors().then((response) => response.data),
  });

  const assignTask = useMutation({
    mutationFn: ({
      taskId,
      collectorUserId,
    }: {
      taskId: string;
      collectorUserId: string;
    }) => tasksApi.assignTask(taskId, collectorUserId),
    onSuccess: () => {
      toast.success("Đã phân công nhiệm vụ cho nhân viên thu gom.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-tasks-list"] });
      setAssigningTask(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Phân công nhiệm vụ thất bại.";
      toast.error(message);
    },
  });

  const tasks: Task[] = data?.data?.content ?? [];
  const collectors: Collector[] = collectorsData?.data ?? [];
  const pendingCount = tasks.filter(
    (task) => task.status === "PENDING_ENTERPRISE_APPROVAL",
  ).length;
  const activeCount = tasks.filter((task) =>
    ["ASSIGNED", "ON_THE_WAY", "IN_PROGRESS"].includes(task.status),
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      {assigningTask ? (
        <AssignModal
          task={assigningTask}
          collectors={collectors}
          onClose={() => setAssigningTask(null)}
          onAssign={(collectorUserId) =>
            assignTask.mutate({
              taskId: assigningTask.taskId,
              collectorUserId,
            })
          }
          isPending={assignTask.isPending}
        />
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Điều hành nhiệm vụ"
        description="Theo dõi hàng chờ nhiệm vụ trực tiếp, phân công nhân viên thu gom và giám sát trạng thái bàn giao trong cùng một bảng điều phối."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Bảng điều phối</span>}
        title="Từ chờ duyệt tới hoàn tất tuyến thu gom."
        description="Việc tạo nhiệm vụ, phân công lại và gán nhân viên thu gom vẫn dùng cùng hành động backend như trước. Giao diện này chỉ làm rõ sức khỏe hàng chờ và mức sẵn sàng phân công."
        tone="sky"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--accent-100)] text-[var(--accent-600)]">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Năng lực nhân sự
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Hiện có {collectors.length} nhân viên sẵn sàng để phân công.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Chờ duyệt"
          value={pendingCount}
          description="Nhiệm vụ đang chờ doanh nghiệp xử lý."
          tone="sand"
        />
        <StatCard
          icon={ListTodo}
          label="Nhiệm vụ đang hoạt động"
          value={activeCount}
          description="Những nhiệm vụ đã phân công hoặc đang thực hiện."
          tone="sky"
          featured
        />
        <StatCard
          icon={CheckCircle}
          label="Hoàn thành"
          value={completedCount}
          description="Nhiệm vụ đã được đánh dấu hoàn thành trong chế độ xem hiện tại."
          tone="mint"
        />
        <StatCard
          icon={Users}
          label="Nhân viên"
          value={collectors.length}
          description="Năng lực phân công hiện có."
          tone="violet"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Hàng chờ hiện tại"
          description="Lọc theo giai đoạn nhiệm vụ và phân công nhân viên ngay trên bảng điều phối."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar justify-between">
            <FilterTabs
              value={STATUS_TABS.find((item) => item.value === activeTab)?.label ?? "TẤT CẢ"}
              options={STATUS_TABS.map((item) => item.label)}
              onChange={(value) => {
                const next = STATUS_TABS.find((item) => item.label === value);
                setActiveTab(next?.value ?? "ALL");
              }}
            />
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới hàng chờ
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-[24px]" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title="Không có nhiệm vụ trong chế độ xem này"
              description="Hãy thử bộ lọc trạng thái khác hoặc làm mới lại sau khi có báo cáo mới được chấp nhận."
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.taskId}
                  className="shell-card shell-card-hover rounded-[26px] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="shell-icon-chip h-12 w-12 shrink-0">
                        <ListTodo className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {task.areaName || "Khu vực chưa xác định"}
                          </p>
                          <Badge variant={getTaskVariant(task.status)}>
                            {formatStatusLabel(task.status)}
                          </Badge>
                          {task.priority ? (
                            <Badge variant={getPriorityVariant(task.priority)}>
                              {formatPriorityLabel(task.priority)}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {task.areaName || "Khu vực đang chờ"}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {task.scheduledDate || task.scheduledAt
                              ? new Date(
                                  task.scheduledDate ?? task.scheduledAt!,
                                ).toLocaleDateString()
                              : "Chưa lên lịch"}
                          </span>
                          <span>
                            Nhân viên: {task.collectorName || "Chưa phân công"}
                          </span>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Mã nhiệm vụ {task.taskId}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/enterprise/tasks/${task.taskId}`)}
                      >
                        Xem chi tiết
                      </Button>
                      {(task.status === "PENDING_ENTERPRISE_APPROVAL" ||
                        task.status === "ASSIGNED") ? (
                        <Button
                          size="sm"
                          onClick={() => setAssigningTask(task)}
                        >
                          <UserRoundPlus className="mr-2 h-4 w-4" />
                          {task.status === "ASSIGNED" ? "Phân công lại" : "Phân công"}
                        </Button>
                      ) : null}
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
