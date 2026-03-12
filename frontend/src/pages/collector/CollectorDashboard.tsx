import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ListTodo,
  MapPin,
  Navigation,
  Truck,
  Zap,
} from "lucide-react";

import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import type { Task } from "../../types";

const MOCK_TASKS: Task[] = [
  {
    taskId: "t1",
    reportId: "1",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u1",
    areaId: "a1",
    areaName: "Downtown Area",
    status: "ASSIGNED",
    priority: "HIGH",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    taskId: "t2",
    reportId: "2",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u2",
    areaId: "a1",
    areaName: "Northpark District",
    status: "ON_THE_WAY",
    priority: "NORMAL",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const CollectorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Field operations overview"
        description="See what is assigned today, jump into your route and follow live task progress in the same workflow you already use."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/collector/map")}>
              <Navigation className="mr-2 h-4 w-4" />
              Route map
            </Button>
            <Button onClick={() => navigate("/collector/tasks")}>
              <ListTodo className="mr-2 h-4 w-4" />
              All tasks
            </Button>
          </>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Today&apos;s route</span>}
        title="Stay focused on the next pickup."
        description="The collector dashboard now prioritises route clarity, active tasks and response momentum without changing status transitions or task details."
        tone="sky"
        aside={
          <div className="space-y-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Current route summary
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-white/78 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Assigned
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  5
                </p>
              </div>
              <div className="rounded-[18px] bg-white/78 p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  ETA left
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  1h 45m
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="Tasks today"
          value={5}
          description="Two items are marked as high priority."
          tone="mint"
          featured
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed this week"
          value={42}
          description="You are ahead of last week&apos;s pace."
          tone="sky"
        />
        <StatCard
          icon={Navigation}
          label="Currently in transit"
          value={3}
          description="Live route status is updated from the same task flow."
          tone="violet"
        />
        <StatCard
          icon={Truck}
          label="Total collected"
          value="1.2 t"
          description="Best weekly performance this month."
          tone="sand"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Priority tasks"
            description="The most urgent jobs are pinned here for faster action."
            action={
              <Button variant="ghost" onClick={() => navigate("/collector/tasks")}>
                View tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            }
          />

          <div className="space-y-3 p-5 sm:p-6">
            {MOCK_TASKS.map((task) => (
              <button
                key={task.taskId}
                type="button"
                onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                className="shell-card shell-card-hover flex w-full items-start gap-4 p-4 text-left"
              >
                <div className="shell-icon-chip h-12 w-12 shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                      {task.areaName}
                    </p>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Scheduled {task.scheduledDate}
                  </p>
                  {task.priority === "HIGH" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-red-700">
                      <Zap className="h-3.5 w-3.5" />
                      Urgent
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Live route map"
            description="Locations remain connected to the same task detail pages and route actions."
          />
          <div className="h-[420px]">
            <MapComponent
              className="h-full w-full"
              points={[
                {
                  id: "1",
                  lat: 21.0285,
                  lng: 105.8542,
                  status: "ASSIGNED",
                  popupContent: <div>Task t1 - Downtown</div>,
                },
                {
                  id: "2",
                  lat: 21.03,
                  lng: 105.85,
                  status: "ON_THE_WAY",
                  popupContent: <div>Task t2 - Northpark</div>,
                },
              ]}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
