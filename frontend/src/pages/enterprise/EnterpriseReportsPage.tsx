import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { tasksApi } from "../../api";
import { Button } from "../../components/ui/button";
import {
  EmptyState,
  ModalShell,
  PageHeader,
  SectionCard,
} from "../../components/ui/page";

interface Report {
  reportId: string;
  description?: string;
  status: string;
  createdAt: string;
  areaName?: string;
  wasteTypeName?: string;
  reporterName?: string;
  reportPhotoUrl?: string;
  requestedPickupTime?: string;
  latitude?: number;
  longitude?: number;
}

function ReportDetailDrawer({
  report,
  onClose,
  onAccept,
  onReject,
  acceptPending,
}: {
  report: Report;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  acceptPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end">
      <div
        className="absolute inset-0 bg-[rgba(31,39,39,0.18)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="shell-modal relative flex h-full w-full max-w-xl flex-col overflow-y-auto rounded-none lg:rounded-l-[32px] lg:rounded-r-none">
        <div className="flex items-start justify-between gap-4 px-5 py-5 sm:px-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Pending report
            </p>
            <h2 className="text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              {report.wasteTypeName ?? "Waste report"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--stroke-soft)] bg-white/70 p-2 text-[var(--text-secondary)] transition-colors hover:bg-white hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 px-5 pb-6 sm:px-6">
          {report.reportPhotoUrl ? (
            <img
              src={report.reportPhotoUrl}
              alt="Report photo"
              className="h-64 w-full rounded-[24px] object-cover"
            />
          ) : null}

          <div className="grid gap-3">
            {[
              {
                icon: MapPin,
                label: "Service area",
                value: report.areaName,
              },
              {
                icon: AlertTriangle,
                label: "Waste type",
                value: report.wasteTypeName,
              },
              {
                icon: Clock,
                label: "Requested pickup",
                value: report.requestedPickupTime
                  ? new Date(report.requestedPickupTime).toLocaleString()
                  : undefined,
              },
              {
                icon: Clock,
                label: "Submitted",
                value: new Date(report.createdAt).toLocaleString(),
              },
              {
                icon: FileText,
                label: "Reported by",
                value: report.reporterName,
              },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/84 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="shell-icon-chip h-11 w-11 shrink-0">
                      <item.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                        {item.value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {report.description ? (
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-white/84 p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {report.description}
              </p>
            </div>
          ) : null}

          {report.latitude && report.longitude ? (
            <a
              href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
            >
              <MapPin className="h-4 w-4" />
              Open location in Google Maps
            </a>
          ) : null}
        </div>

        <div className="shell-divider mt-auto flex flex-wrap gap-3 px-5 py-4 sm:px-6">
          <Button variant="destructive" className="flex-1" onClick={onReject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button className="flex-1" onClick={onAccept} disabled={acceptPending}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {acceptPending ? "Accepting..." : "Accept"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EnterpriseReportsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Report | null>(null);
  const [rejecting, setRejecting] = useState<Report | null>(null);
  const [rejectReason, setRejectReason] = useState("Cannot service this area");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["enterprise-pending-reports"],
    queryFn: () => tasksApi.getPendingReports().then((response) => response.data),
    refetchInterval: 30_000,
  });

  const accept = useMutation({
    mutationFn: (reportId: string) => tasksApi.acceptReport(reportId),
    onSuccess: () => {
      toast.success("Report accepted and task created");
      queryClient.invalidateQueries({ queryKey: ["enterprise-pending-reports"] });
      queryClient.invalidateQueries({ queryKey: ["enterprise-tasks-list"] });
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to accept report";
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["enterprise-pending-reports"] });
    },
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      tasksApi.rejectReport(id, reason),
    onSuccess: () => {
      toast.success("Report rejected");
      queryClient.invalidateQueries({ queryKey: ["enterprise-pending-reports"] });
      setRejecting(null);
      setSelected(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Failed to reject report";
      toast.error(message);
      queryClient.invalidateQueries({ queryKey: ["enterprise-pending-reports"] });
    },
  });

  const reports: Report[] = data?.data?.content ?? [];

  return (
    <>
      {rejecting ? (
        <ModalShell
          title="Reject report"
          description="Provide a reason so the citizen understands why the report was rejected."
          icon={Trash2}
          onClose={() => setRejecting(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || reject.isPending}
                onClick={() =>
                  reject.mutate({
                    id: rejecting.reportId,
                    reason: rejectReason.trim(),
                  })
                }
              >
                {reject.isPending ? "Rejecting..." : "Confirm reject"}
              </Button>
            </>
          }
        >
          <textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
            className="shell-textarea"
            placeholder="Reason for rejection"
          />
        </ModalShell>
      ) : null}

      {selected && !rejecting ? (
        <ReportDetailDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onAccept={() => accept.mutate(selected.reportId)}
          onReject={() => {
            setRejectReason("Cannot service this area");
            setRejecting(selected);
          }}
          acceptPending={accept.isPending}
        />
      ) : null}

      <div className="space-y-4 lg:space-y-5">
        <PageHeader
          eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
          title="Pending reports"
          description="Review, accept or reject incoming waste requests in your assigned service areas using the same backend actions as before."
          actions={
            <>
              <span className="shell-chip shell-chip-accent">
                {reports.length} pending
              </span>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </>
          }
        />

        <SectionCard className="overflow-hidden p-5 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-[22px]" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="All caught up"
              description="There are no pending reports right now. New requests will appear here automatically."
            />
          ) : (
            <div className="grid gap-3">
              {reports.map((report) => (
                <button
                  key={report.reportId}
                  type="button"
                  onClick={() => setSelected(report)}
                  className="shell-card shell-card-hover flex w-full items-start gap-4 p-4 text-left sm:p-5"
                >
                  {report.reportPhotoUrl ? (
                    <img
                      src={report.reportPhotoUrl}
                      alt=""
                      className="h-16 w-16 rounded-[20px] object-cover"
                    />
                  ) : (
                    <div className="shell-icon-chip h-16 w-16 shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                          {report.wasteTypeName ?? "Waste report"}
                        </p>
                        {report.areaName ? (
                          <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                            <MapPin className="h-4 w-4" />
                            {report.areaName}
                          </p>
                        ) : null}
                      </div>
                      <span className="inline-flex self-start rounded-full bg-amber-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-800">
                        Pending
                      </span>
                    </div>

                    {report.description ? (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {report.description}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Clock className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleString()}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRejectReason("Cannot service this area");
                            setRejecting(report);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            accept.mutate(report.reportId);
                          }}
                          disabled={accept.isPending}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
