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

const STATUS_TABS = [
  { label: "ALL", value: "ALL" },
  { label: "PENDING", value: "PENDING_ENTERPRISE_APPROVAL" },
  { label: "ASSIGNED", value: "ASSIGNED" },
  { label: "IN PROGRESS", value: "IN_PROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
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
      title="Assign task to collector"
      description="Choose one of your current collectors. Assignment logic and backend workflow stay unchanged."
      icon={UserRoundPlus}
      onClose={onClose}
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onAssign(selected)}
            disabled={!selected || isPending || collectors.length === 0}
          >
            {isPending ? "Assigning..." : "Assign task"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Task ID
          </p>
          <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
            {task.taskId}
          </p>
        </div>

        <div>
          <label htmlFor="collector-select" className="field-label">
            Select collector
          </label>
          {collectors.length === 0 ? (
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              No collectors are registered under this enterprise yet.
            </div>
          ) : (
            <select
              id="collector-select"
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="shell-select"
            >
              <option value="">Choose a collector</option>
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
      toast.success("Task assigned to collector.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-tasks-list"] });
      setAssigningTask(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to assign task.";
      toast.error(message);
    },
  });

  const tasks: Task[] = data?.data?.content ?? [];
  const collectors: Collector[] = collectorsData?.data ?? [];
  const pendingCount = tasks.filter(
    (task) => task.status === "PENDING_ENTERPRISE_APPROVAL",
  ).length;
  const activeCount = tasks.filter((task) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(task.status),
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
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Task operations"
        description="Review the live task queue, assign collectors and monitor handoff status through a single enterprise task board."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Dispatch board</span>}
        title="From pending approval to route completion."
        description="Task creation, reassignment and collector mapping use the same backend actions as before. This layout simply clarifies queue health and assignment readiness."
        tone="sky"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--accent-100)] text-[var(--accent-600)]">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Collector capacity
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {collectors.length} collectors currently available for assignment.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Pending approval"
          value={pendingCount}
          description="Tasks awaiting enterprise action."
          tone="sand"
        />
        <StatCard
          icon={ListTodo}
          label="Active tasks"
          value={activeCount}
          description="Currently assigned or already in progress."
          tone="sky"
          featured
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedCount}
          description="Tasks marked complete in the current view."
          tone="mint"
        />
        <StatCard
          icon={Users}
          label="Collectors"
          value={collectors.length}
          description="Available assignment capacity."
          tone="violet"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Current queue"
          description="Filter by task stage and assign collectors without leaving the board."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar justify-between">
            <FilterTabs
              value={activeTab}
              options={STATUS_TABS.map((item) => item.label)}
              onChange={(value) => {
                const next = STATUS_TABS.find((item) => item.label === value);
                setActiveTab(next?.value ?? "ALL");
              }}
            />
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh queue
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
              title="No tasks in this view"
              description="Try another status filter or refresh again after new reports are accepted."
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
                            {task.areaName || "Unassigned area"}
                          </p>
                          <Badge variant={getTaskVariant(task.status)}>
                            {task.status.replace(/_/g, " ")}
                          </Badge>
                          {task.priority ? (
                            <Badge variant={getPriorityVariant(task.priority)}>
                              {task.priority}
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {task.areaName || "Area pending"}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {task.scheduledDate || task.scheduledAt
                              ? new Date(
                                  task.scheduledDate ?? task.scheduledAt!,
                                ).toLocaleDateString()
                              : "Unscheduled"}
                          </span>
                          <span>
                            Collector: {task.collectorName || "Not assigned yet"}
                          </span>
                        </div>

                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          Task ID {task.taskId}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                      {(task.status === "PENDING_ENTERPRISE_APPROVAL" ||
                        task.status === "ASSIGNED") ? (
                        <Button
                          size="sm"
                          onClick={() => setAssigningTask(task)}
                        >
                          <UserRoundPlus className="mr-2 h-4 w-4" />
                          {task.status === "ASSIGNED" ? "Reassign" : "Assign"}
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
