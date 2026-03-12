import { useQuery } from "@tanstack/react-query";
import {
  Award,
  Building2,
  FileText,
  MessageSquare,
  RefreshCw,
  Settings,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  PageHeader,
  PageHero,
  SectionCard,
  StatCard,
} from "../../components/ui/page";

type DashboardData = {
  totalUsers?: number;
  totalCitizens?: number;
  totalCollectors?: number;
  totalEnterprises?: number;
  totalReports?: number;
  pendingReports?: number;
  activeTasks?: number;
  completedTasksToday?: number;
  openComplaints?: number;
  totalRewardPointsIssued?: number;
};

export function AdminDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.getDashboard().then((response) => response.data.data),
    refetchInterval: 60_000,
  });

  const metrics = (data as DashboardData | undefined) ?? {};
  const adminCount = Math.max(
    0,
    (metrics.totalUsers ?? 0) -
      (metrics.totalCitizens ?? 0) -
      (metrics.totalCollectors ?? 0) -
      (metrics.totalEnterprises ?? 0),
  );
  const userMixData = [
    { name: "Citizens", value: metrics.totalCitizens ?? 0, fill: "#7791d4" },
    { name: "Collectors", value: metrics.totalCollectors ?? 0, fill: "#6aa08c" },
    { name: "Enterprises", value: metrics.totalEnterprises ?? 0, fill: "#8a7fcb" },
    { name: "Admins", value: adminCount, fill: "#c96f6a" },
  ].filter((item) => item.value > 0);
  const operationsData = [
    { name: "Reports", value: metrics.totalReports ?? 0, fill: "#7791d4" },
    { name: "Pending", value: metrics.pendingReports ?? 0, fill: "#c98f45" },
    { name: "Active tasks", value: metrics.activeTasks ?? 0, fill: "#8a7fcb" },
    { name: "Completed", value: metrics.completedTasksToday ?? 0, fill: "#6aa08c" },
    { name: "Complaints", value: metrics.openComplaints ?? 0, fill: "#c96f6a" },
  ];

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="System overview"
        description="Review platform health, user distribution and live workload in a cleaner control room."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Live platform pulse</span>}
        title="One view across users, tasks and operations."
        description="The admin dashboard now surfaces the same metrics with a calmer hierarchy so you can spot issues faster and move into the right management screen."
        tone="sky"
        aside={
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Reward points issued
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                {isLoading
                  ? "..."
                  : (metrics.totalRewardPointsIssued ?? 0).toLocaleString()}
              </p>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {isLoading
                ? "Loading system metrics..."
                : `${metrics.pendingReports ?? 0} pending reports, ${metrics.activeTasks ?? 0} active tasks and ${metrics.openComplaints ?? 0} open complaints.`}
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="User base"
          value={isLoading ? "..." : metrics.totalUsers ?? 0}
          description="Combined platform users across citizen, collector, enterprise and admin roles."
          footer={
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
              <span className="rounded-full bg-white/70 px-2 py-1">
                Citizens {metrics.totalCitizens ?? 0}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-1">
                Collectors {metrics.totalCollectors ?? 0}
              </span>
              <span className="rounded-full bg-white/70 px-2 py-1">
                Enterprises {metrics.totalEnterprises ?? 0}
              </span>
            </div>
          }
          tone="sky"
          compact
        />
        <StatCard
          icon={FileText}
          label="Reports queue"
          value={isLoading ? "..." : metrics.totalReports ?? 0}
          meta={`Pending ${metrics.pendingReports ?? 0}`}
          description="All incoming and historical reports with current queue pressure."
          tone="sand"
          featured
          compact
        />
        <StatCard
          icon={Truck}
          label="Task flow"
          value={isLoading ? "..." : metrics.activeTasks ?? 0}
          description="Tasks currently in progress across active collection operations."
          footer={
            <p className="text-xs text-[var(--text-secondary)]">
              Completed today:{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {isLoading ? "..." : metrics.completedTasksToday ?? 0}
              </span>
            </p>
          }
          tone="mint"
          compact
        />
        <StatCard
          icon={MessageSquare}
          label="Open complaints"
          value={isLoading ? "..." : metrics.openComplaints ?? 0}
          description="Issues waiting for review or closure."
          tone="peach"
          compact
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <SectionCard className="overflow-hidden">
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                User distribution
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Live role composition across the current platform user base.
              </p>
            </div>
          </div>
          <div className="h-[320px] px-3 pb-3 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userMixData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={68}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {userMixData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
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

        <SectionCard className="overflow-hidden">
          <div className="space-y-4 px-5 py-5 sm:px-6">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Operational snapshot
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Core queue health pulled from the current dashboard aggregates.
              </p>
            </div>
          </div>
          <div className="h-[320px] px-3 pb-3 sm:px-6 sm:pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={operationsData}>
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
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {operationsData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
        <SectionCard className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Citizens", value: metrics.totalCitizens ?? 0 },
              { label: "Collectors", value: metrics.totalCollectors ?? 0 },
              { label: "Enterprises", value: metrics.totalEnterprises ?? 0 },
              { label: "Admins", value: adminCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/82 p-4"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Quick actions
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Jump straight into the areas that need attention.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { to: "/admin/users", icon: Users, label: "User management", sub: "Roles, status and account controls" },
                { to: "/admin/enterprises", icon: Building2, label: "Enterprises", sub: "Review organisation onboarding and activity" },
                { to: "/admin/complaints", icon: MessageSquare, label: "Complaints", sub: `${metrics.openComplaints ?? 0} currently open` },
                { to: "/admin/notifications", icon: Award, label: "Notifications", sub: "Broadcast updates to all users" },
                { to: "/admin/reward-items", icon: Award, label: "Reward items", sub: "Manage redeemable catalogue items" },
                { to: "/admin/settings", icon: Settings, label: "System settings", sub: "Maintain operational defaults and secrets" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="shell-card shell-card-hover flex items-center gap-4 p-4"
                >
                  <div className="shell-icon-chip">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {item.sub}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />
                </Link>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
