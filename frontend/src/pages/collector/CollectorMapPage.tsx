import React from "react";
import {
  ArrowRight,
  ListTodo,
  MapPin,
  Navigation,
  Route,
  TriangleAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const MOCK_TASKS_MAP_DATA: (Task & { lat: number; lng: number })[] = [
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
    lat: 21.0285,
    lng: 105.8542,
  },
  {
    taskId: "t2",
    reportId: "2",
    enterpriseUserId: "e1",
    enterpriseName: "EcoTech Waste Management",
    createdByUserId: "u2",
    areaId: "a1",
    areaName: "North Suburbs",
    status: "ON_THE_WAY",
    priority: "NORMAL",
    scheduledDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lat: 21.03,
    lng: 105.85,
  },
];

export const CollectorMapPage: React.FC = () => {
  const navigate = useNavigate();
  const urgentStops = MOCK_TASKS_MAP_DATA.filter(
    (task) => task.priority === "HIGH",
  ).length;
  const routeInProgress = MOCK_TASKS_MAP_DATA.filter(
    (task) => task.status === "ON_THE_WAY",
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Task map"
        description="Use the map to see every assigned stop, route urgency and next action without leaving the current collector flow."
        actions={
          <Button variant="outline" onClick={() => navigate("/collector/tasks")}>
            <ListTodo className="mr-2 h-4 w-4" />
            View task list
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Route context</span>}
        title="Move from assignment to pickup with a clearer map handoff."
        description="This refreshed route board keeps the same task detail routes while making stop status, urgency and route navigation easier to scan at a glance."
        tone="sky"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--accent-100)] text-[var(--accent-600)]">
                <Route className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Active route coverage
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {MOCK_TASKS_MAP_DATA.length} tracked stops with {routeInProgress} route
                  currently in motion.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={MapPin}
          label="Tracked stops"
          value={MOCK_TASKS_MAP_DATA.length}
          description="Current markers shown on the route board."
          tone="sky"
          featured
        />
        <StatCard
          icon={TriangleAlert}
          label="Urgent stops"
          value={urgentStops}
          description="High-priority locations needing faster attention."
          tone="peach"
        />
        <StatCard
          icon={Navigation}
          label="In transit"
          value={routeInProgress}
          description="Stops already marked as on the way."
          tone="mint"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Interactive route map"
            description="Select any marker to jump directly into its task detail page."
          />

          <div className="p-5 sm:p-6">
            <MapComponent
              className="h-[560px] w-full"
              points={MOCK_TASKS_MAP_DATA.map((task) => ({
                id: task.taskId,
                lat: task.lat,
                lng: task.lng,
                status: task.status,
                popupContent: (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {task.areaName}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {task.enterpriseName}
                        </p>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Scheduled {task.scheduledDate}
                    </p>
                    {task.priority === "HIGH" ? (
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--peach-600)]">
                        Urgent priority
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center rounded-[14px] bg-[var(--primary-700)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--primary-800)]"
                      onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                    >
                      Open task detail
                    </button>
                  </div>
                ),
              }))}
            />
          </div>
        </SectionCard>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Route queue"
            description="Quick glance at the current stop order and priority."
          />

          <div className="space-y-4 p-5 sm:p-6">
            {MOCK_TASKS_MAP_DATA.map((task, index) => (
              <div
                key={task.taskId}
                className="rounded-[24px] border border-[var(--stroke-soft)] bg-white/84 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="shell-icon-chip h-11 w-11 shrink-0">
                      <Route className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Stop {index + 1}: {task.areaName}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Scheduled {task.scheduledDate}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {task.priority === "HIGH"
                      ? "This stop should be handled first."
                      : "Standard priority route handoff."}
                  </p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/collector/tasks/${task.taskId}`)}
                  >
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
