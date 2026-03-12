import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { reportsApi } from "../../api";
import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import type { WasteReport } from "../../types";

type TimelineStep = {
  status: string;
  label: string;
  date: string;
  active: boolean;
  completed: boolean;
  isError?: boolean;
};

function getTimelineIcon(step: TimelineStep) {
  switch (step.status) {
    case "PENDING":
      return <Clock className="h-4.5 w-4.5" />;
    case "ACCEPTED":
      return <CheckCircle2 className="h-4.5 w-4.5" />;
    case "ASSIGNED":
      return <Package className="h-4.5 w-4.5" />;
    case "ON_THE_WAY":
      return <Truck className="h-4.5 w-4.5" />;
    case "COLLECTED":
      return <CheckCircle2 className="h-4.5 w-4.5" />;
    case "REJECTED":
      return <XCircle className="h-4.5 w-4.5" />;
    default:
      return <Clock className="h-4.5 w-4.5" />;
  }
}

function getTimeline(report: WasteReport): TimelineStep[] {
  const orderedStatuses = [
    "PENDING",
    "ACCEPTED",
    "ASSIGNED",
    "ON_THE_WAY",
    "COLLECTED",
  ] as const;

  if (report.status === "REJECTED") {
    return [
      {
        status: "PENDING",
        label: "Report created",
        date: new Date(report.createdAt).toLocaleString(),
        active: true,
        completed: true,
      },
      {
        status: "REJECTED",
        label: "Report rejected",
        date: "Reviewed by the assigned enterprise",
        active: true,
        completed: false,
        isError: true,
      },
    ];
  }
  if (report.status === "CANCELLED") {
    return [
      {
        status: "PENDING",
        label: "Report created",
        date: new Date(report.createdAt).toLocaleString(),
        active: true,
        completed: true,
      },
      {
        status: "CANCELLED",
        label: "Report cancelled",
        date: "Cancelled by citizen before assignment",
        active: true,
        completed: false,
        isError: true,
      },
    ];
  }

  const currentIndex = orderedStatuses.indexOf(report.status);

  return [
    {
      status: "PENDING",
      label: "Report created",
      date: new Date(report.createdAt).toLocaleString(),
      active: currentIndex >= 0,
      completed: currentIndex > 0,
    },
    {
      status: "ACCEPTED",
      label: "Enterprise accepted",
      date: currentIndex >= 1 ? "Queued for task creation" : "Pending review",
      active: currentIndex >= 1,
      completed: currentIndex > 1,
    },
    {
      status: "ASSIGNED",
      label: "Collector assigned",
      date: currentIndex >= 2 ? "Route prepared" : "Waiting for assignment",
      active: currentIndex >= 2,
      completed: currentIndex > 2,
    },
    {
      status: "ON_THE_WAY",
      label: "Collector en route",
      date: currentIndex >= 3 ? "Pickup in progress" : "Not started yet",
      active: currentIndex >= 3,
      completed: currentIndex > 3,
    },
    {
      status: "COLLECTED",
      label: "Waste collected",
      date: currentIndex >= 4 ? "Visit completed" : "Awaiting collection",
      active: currentIndex >= 4,
      completed: currentIndex >= 4,
    },
  ];
}

function getHeroTone(status: WasteReport["status"]) {
  switch (status) {
    case "COLLECTED":
      return "mint" as const;
    case "REJECTED":
      return "peach" as const;
    case "ON_THE_WAY":
      return "sky" as const;
    default:
      return "sand" as const;
  }
}

export const CitizenReportDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsApi.getById(id!).then((response) => response.data),
    enabled: !!id,
  });

  const report: WasteReport | undefined = reportData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-5">
        <div className="shimmer h-28 rounded-[34px]" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="shimmer h-[520px] rounded-[28px]" />
          <div className="shimmer h-[520px] rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-10">
        <EmptyState
          icon={XCircle}
          title="Report not found"
          description="The report could not be loaded or no longer exists in your current view."
          action={
            <Button variant="outline" onClick={() => navigate("/citizen/reports")}>
              Back to reports
            </Button>
          }
          tone="peach"
        />
      </div>
    );
  }

  const timeline = getTimeline(report);

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Citizen workspace</span>}
        title="Report tracking"
        description="Follow the same report lifecycle through a cleaner detail view with clearer status context, location and evidence."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Report detail</span>}
        title={report.wasteTypeName || "Waste report"}
        description={
          report.description?.trim()
            ? report.description
            : "No additional description was submitted with this report."
        }
        tone={getHeroTone(report.status)}
        aside={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Report ID
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                  {report.reportId}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </div>
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/76 p-4 text-sm leading-6 text-[var(--text-secondary)]">
              Created on {new Date(report.createdAt).toLocaleString()}
              {report.areaName ? ` in ${report.areaName}.` : "."}
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Created"
          value={new Date(report.createdAt).toLocaleDateString()}
          description="Submission date"
          tone="slate"
        />
        <StatCard
          icon={MapPin}
          label="Area"
          value={report.areaName || "Not specified"}
          description="Current service area"
          tone="sky"
        />
        <StatCard
          icon={CheckCircle2}
          label="Current status"
          value={report.status.replace(/_/g, " ")}
          description="Latest report stage"
          tone={report.status === "REJECTED" ? "peach" : "mint"}
          featured
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-4 lg:space-y-5">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Report information"
              description="Core details captured when the issue was submitted."
            />

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Waste category
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                  {report.wasteTypeName || "Unknown"}
                </p>
              </div>
              <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Coordinates
                </p>
                <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                  {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </p>
              </div>
              <div className="rounded-[22px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Description
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  {report.description?.trim() || "No description provided."}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Evidence photo"
              description="The original image attached to the report."
            />

            <div className="p-5 sm:p-6">
              {report.reportPhotoUrl ? (
                <div className="overflow-hidden rounded-[26px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)]">
                  <img
                    src={report.reportPhotoUrl}
                    alt="Waste evidence"
                    className="max-h-[420px] w-full object-cover"
                  />
                </div>
              ) : (
                <EmptyState
                  icon={ImageIcon}
                  title="No image attached"
                  description="This report was submitted without a supporting photo."
                  tone="slate"
                />
              )}
            </div>
          </SectionCard>

          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Location"
              description="Pinned map position used for routing and pickup."
            />

            <div className="space-y-4 p-5 sm:p-6">
              <MapComponent
                points={[
                  {
                    id: report.reportId,
                    lat: report.latitude,
                    lng: report.longitude,
                    status: report.status,
                    popupContent: <strong>{report.wasteTypeName}</strong>,
                  },
                ]}
                center={[report.latitude, report.longitude]}
                interactive={false}
              />
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                This location remains unchanged from the original report payload.
              </p>
            </div>
          </SectionCard>
        </div>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Tracking timeline"
            description="See how the report moved through the current collection pipeline."
          />

          <div className="space-y-5 p-5 sm:p-6">
            {timeline.map((step, index) => {
              const activeTone = step.isError
                ? "border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] text-[var(--peach-600)]"
                : step.completed
                  ? "border-[rgba(31,93,78,0.18)] bg-[var(--primary-100)] text-[var(--primary-700)]"
                  : step.active
                    ? "border-[rgba(78,123,217,0.18)] bg-[var(--accent-100)] text-[var(--accent-600)]"
                    : "border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] text-[var(--text-muted)]";

              return (
                <div key={`${step.status}-${index}`} className="relative">
                  {index < timeline.length - 1 ? (
                    <div className="absolute left-[1.35rem] top-12 h-[calc(100%-1rem)] w-px bg-[rgba(94,110,125,0.12)]" />
                  ) : null}

                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border ${activeTone}`}
                    >
                      {getTimelineIcon(step)}
                    </div>
                    <div className="min-w-0 flex-1 rounded-[22px] border border-[var(--stroke-soft)] bg-white/84 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {step.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            {step.date}
                          </p>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                          {step.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
