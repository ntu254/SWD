import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock,
  ListTodo,
  Recycle,
} from "lucide-react";

import { tasksApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  PageHeader,
  PageHero,
  SectionCard,
  StatCard,
} from "../../components/ui/page";

export function EnterpriseDashboard() {
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["enterprise-pending"],
    queryFn: () => tasksApi.getPendingReports().then((response) => response.data),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["enterprise-tasks"],
    queryFn: () => tasksApi.getEnterpriseTasks().then((response) => response.data),
  });

  const pendingCount = pendingData?.data?.totalElements ?? 0;
  const tasksCount = tasksData?.data?.totalElements ?? 0;
  const isLoading = pendingLoading || tasksLoading;

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Operations at a glance"
        description="Coordinate pending reports, active tasks and pickup requests with a cleaner enterprise control surface."
        actions={
          <Button asChild>
            <Link to="/enterprise/pickup">
              <Recycle className="mr-2 h-4 w-4" />
              Schedule pickup
            </Link>
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Coverage snapshot</span>}
        title="Move from report intake to pickup scheduling faster."
        description="This refreshed dashboard highlights your operational queue while leaving report acceptance, task creation and pickup logic untouched."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="shell-icon-chip">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Enterprise account active
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {isLoading ? "Loading metrics..." : `${pendingCount} pending reports and ${tasksCount} tracked tasks.`}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Pending reports"
          value={isLoading ? "..." : pendingCount}
          description="Awaiting decision in your service areas."
          tone="sand"
        />
        <StatCard
          icon={ListTodo}
          label="Tracked tasks"
          value={isLoading ? "..." : tasksCount}
          description="All tasks already created inside the system."
          tone="sky"
        />
        <StatCard
          icon={Recycle}
          label="New pickup flow"
          value="Ready"
          description="Create a pickup request using the existing enterprise workflow."
          tone="mint"
          featured
        />
        <StatCard
          icon={Building2}
          label="Company profile"
          value="1 profile"
          description="Keep account and facility details current."
          tone="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            to: "/enterprise/reports",
            icon: BarChart3,
            label: "Analytics and reports",
            description: "Review pending requests, history and trend snapshots.",
            tone: "sky" as const,
          },
          {
            to: "/enterprise/pickup",
            icon: Recycle,
            label: "Schedule pickup",
            description: "Submit a new collection request for your site.",
            tone: "mint" as const,
          },
          {
            to: "/enterprise/profile",
            icon: Building2,
            label: "Company profile",
            description: "Update contact details and operating information.",
            tone: "violet" as const,
          },
        ].map((item) => (
          <SectionCard key={item.to} className="shell-card-hover overflow-hidden">
            <Link className="block p-5 sm:p-6" to={item.to}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="shell-icon-chip">
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {item.label}
                    </p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </Link>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
