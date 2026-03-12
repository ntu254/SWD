import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CheckCircle,
  Clock,
  ListTodo,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { tasksApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

interface Task {
  taskId: string;
  status: string;
  areaName?: string;
  collectorName?: string;
  createdAt?: string;
  scheduledDate?: string;
  priority?: string;
}

const STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  PENDING_ENTERPRISE_APPROVAL: { label: "Pending", color: "#c98f45" },
  ASSIGNED: { label: "Assigned", color: "#7791d4" },
  IN_PROGRESS: { label: "In Progress", color: "#8a7fcb" },
  COMPLETED: { label: "Completed", color: "#6aa08c" },
  CANCELLED: { label: "Cancelled", color: "#c96f6a" },
};

function formatShortDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function EnterpriseAnalyticsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["enterprise-tasks-analytics"],
    queryFn: () =>
      tasksApi.getEnterpriseTasks(0, undefined).then((response) => response.data),
    refetchInterval: 60_000,
  });

  const tasks: Task[] = data?.data?.content ?? [];

  const counts: Record<string, number> = {};
  const byCollector: Record<string, { name: string; total: number; completed: number }> = {};
  const byArea: Record<string, number> = {};
  const byDay: Record<
    string,
    { label: string; sortKey: number; created: number; completed: number }
  > = {};

  for (const task of tasks) {
    counts[task.status] = (counts[task.status] ?? 0) + 1;

    if (task.collectorName) {
      byCollector[task.collectorName] ??= {
        name: task.collectorName,
        total: 0,
        completed: 0,
      };
      byCollector[task.collectorName].total += 1;
      if (task.status === "COMPLETED") {
        byCollector[task.collectorName].completed += 1;
      }
    }

    if (task.areaName) {
      byArea[task.areaName] = (byArea[task.areaName] ?? 0) + 1;
    }

    const dayKey = task.scheduledDate || task.createdAt;
    if (dayKey) {
      const rawDate = new Date(dayKey);
      const label = formatShortDate(dayKey);
      byDay[label] ??= {
        label,
        sortKey: Number.isNaN(rawDate.getTime()) ? 0 : rawDate.getTime(),
        created: 0,
        completed: 0,
      };
      byDay[label].created += 1;
      if (task.status === "COMPLETED") {
        byDay[label].completed += 1;
      }
    }
  }

  const total = tasks.length;
  const completed = counts.COMPLETED ?? 0;
  const inProgress = counts.IN_PROGRESS ?? 0;
  const pending = (counts.PENDING_ENTERPRISE_APPROVAL ?? 0) + (counts.ASSIGNED ?? 0);

  const statusData = Object.entries(counts).map(([status, value]) => ({
    key: status,
    label: STATUS_META[status]?.label ?? status,
    value,
    fill: STATUS_META[status]?.color ?? "#9ba9a7",
  }));

  const collectorData = Object.values(byCollector)
    .sort((left, right) => right.total - left.total)
    .slice(0, 6)
    .map((collector) => ({
      name: collector.name,
      total: collector.total,
      completed: collector.completed,
    }));

  const areaData = Object.entries(byArea)
    .sort(([, left], [, right]) => right - left)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const timelineData = Object.values(byDay)
    .sort((left, right) => left.sortKey - right.sortKey)
    .slice(-7);

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Analytics"
        description="Track workload, completion patterns and collector throughput with real charts from the task dataset."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="shimmer h-36 rounded-[24px]" />
          ))}
        </div>
      ) : total === 0 ? (
        <SectionCard className="p-6">
          <EmptyState
            icon={BarChart3}
            title="No analytics data yet"
            description="Charts will appear once enterprise tasks start flowing through the platform."
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ListTodo}
              label="Total tasks"
              value={total}
              description="All enterprise tasks currently tracked."
              tone="slate"
            />
            <StatCard
              icon={CheckCircle}
              label="Completed"
              value={completed}
              description="Tasks closed successfully."
              tone="mint"
            />
            <StatCard
              icon={TrendingUp}
              label="In progress"
              value={inProgress}
              description="Tasks actively being worked."
              tone="violet"
            />
            <StatCard
              icon={Clock}
              label="Pending review"
              value={pending}
              description="Pending approval and assigned tasks."
              tone="sand"
              featured
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Task trend"
                description="Created versus completed tasks across the latest visible dates."
              />
              <div className="h-[340px] px-3 pb-3 sm:px-6 sm:pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,110,125,0.12)" />
                    <XAxis dataKey="label" stroke="#8c98a3" fontSize={12} />
                    <YAxis stroke="#8c98a3" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(94,110,125,0.12)",
                        background: "rgba(255,255,255,0.96)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      stroke="#7791d4"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Created"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#6aa08c"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Status distribution"
                description="Live composition of task states across the enterprise queue."
              />
              <div className="h-[340px] px-3 pb-3 sm:px-6 sm:pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(94,110,125,0.12)",
                        background: "rgba(255,255,255,0.96)",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Collector performance"
                description="Top collectors by assigned workload and completion count."
              />
              <div className="h-[340px] px-3 pb-3 sm:px-6 sm:pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collectorData} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,110,125,0.12)" />
                    <XAxis type="number" stroke="#8c98a3" fontSize={12} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#8c98a3"
                      fontSize={12}
                      width={96}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(94,110,125,0.12)",
                        background: "rgba(255,255,255,0.96)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#7791d4" radius={[8, 8, 8, 8]} name="Total tasks" />
                    <Bar dataKey="completed" fill="#6aa08c" radius={[8, 8, 8, 8]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Tasks by area"
                description="The busiest service areas based on current task volume."
              />
              <div className="h-[340px] px-3 pb-3 sm:px-6 sm:pb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(94,110,125,0.12)" />
                    <XAxis dataKey="name" stroke="#8c98a3" fontSize={12} />
                    <YAxis stroke="#8c98a3" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 18,
                        border: "1px solid rgba(94,110,125,0.12)",
                        background: "rgba(255,255,255,0.96)",
                      }}
                    />
                    <Bar dataKey="value" fill="#8a7fcb" radius={[10, 10, 0, 0]} name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
