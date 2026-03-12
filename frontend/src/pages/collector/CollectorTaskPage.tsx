import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Navigation,
  PackageCheck,
  UploadCloud,
  Warehouse,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import { reportsApi, tasksApi } from "../../api";
import type { Task, WasteReport } from "../../types";
import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

function normalizeTaskStatus(status?: string | null) {
  if (!status) return "ASSIGNED";
  if (status === "IN_PROGRESS") return "ON_THE_WAY";
  if (status === "COLLECTED") return "COMPLETED";
  return status;
}

export const CollectorTaskPage: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [collectorNote, setCollectorNote] = useState("");
  const [sortingLevel, setSortingLevel] = useState("GOOD");

  const { data: taskResponse, isLoading } = useQuery({
    queryKey: ["collector-task", taskId],
    queryFn: () => tasksApi.getCollectorTaskById(taskId!).then((response) => response.data),
    enabled: !!taskId,
  });

  const task: Task | undefined = taskResponse?.data;
  const statusIndicator = normalizeTaskStatus(task?.status);

  const { data: reportResponse } = useQuery({
    queryKey: ["collector-task-report", task?.reportId],
    queryFn: () => reportsApi.getById(task!.reportId!).then((response) => response.data),
    enabled: !!task?.reportId,
  });
  const report: WasteReport | undefined = reportResponse?.data;

  const updateStatus = useMutation({
    mutationFn: () => tasksApi.updateStatus(taskId!, "ON_THE_WAY"),
    onSuccess: () => {
      toast.success("Task status updated to ON THE WAY.");
      queryClient.invalidateQueries({ queryKey: ["collector-task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["collector-tasks"] });
    },
    onError: () => toast.error("Failed to update task status."),
  });

  const completeTask = useMutation({
    mutationFn: async () => {
      const weightValue = Number(estimatedWeight);
      if (!proofFile) {
        throw new Error("Proof photo is required to complete the task.");
      }
      if (!estimatedWeight.trim() || Number.isNaN(weightValue) || weightValue <= 0) {
        throw new Error("Estimated weight must be a number greater than 0.");
      }

      const photoUrl = await tasksApi
        .uploadEvidence(proofFile)
        .then((response) => response.data?.data as string | undefined);

      const wasteItems =
        report?.wasteTypeId
          ? [
              {
                wasteTypeId: report.wasteTypeId,
                weightKg: weightValue,
                sortingLevel,
                contaminationNote: collectorNote || undefined,
              },
            ]
          : [];

      return tasksApi.completeTask(taskId!, {
        visitStatus: "COMPLETED",
        collectorNote,
        photoUrls: photoUrl ? [photoUrl] : [],
        wasteItems,
      });
    },
    onSuccess: () => {
      toast.success("Task completed and synced to citizen timeline.");
      queryClient.invalidateQueries({ queryKey: ["collector-task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["collector-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["citizen-reports"] });
      navigate("/collector/tasks");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message ?? "Failed to complete task.";
      toast.error(message);
    },
  });

  const routeStarted = statusIndicator === "ON_THE_WAY";
  const alreadyCollected = statusIndicator === "COMPLETED";

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const mapCenter = useMemo<[number, number] | undefined>(() => {
    if (!report) return undefined;
    return [report.latitude, report.longitude];
  }, [report]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!task) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Task not found"
        description="This task could not be loaded or is no longer assigned to your account."
      />
    );
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Task execution"
        description="Manage the current route stop, verify evidence and complete collection."
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Assigned stop</span>}
        title={task.areaName || "Collector task"}
        description={report?.description || "No report description provided."}
        tone={alreadyCollected ? "mint" : routeStarted ? "sky" : "sand"}
        aside={
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Task ID
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                  {task.taskId}
                </p>
              </div>
              <StatusBadge status={statusIndicator} />
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Warehouse}
          label="Assigned by"
          value={task.enterpriseName}
          description="Enterprise owner of this task"
          tone="slate"
        />
        <StatCard
          icon={Navigation}
          label="Scheduled"
          value={task.scheduledDate || "Today"}
          description="Current planned visit date"
          tone="sky"
        />
        <StatCard
          icon={PackageCheck}
          label="Status"
          value={statusIndicator.replace(/_/g, " ")}
          description="Live collector task state"
          tone={alreadyCollected ? "mint" : "sand"}
          featured
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div className="space-y-4 lg:space-y-5">
          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Task overview"
              description="Key context from current assignment payload."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-[24px] border border-[rgba(31,93,78,0.12)] bg-[var(--primary-50)] p-4">
                <div className="flex items-start gap-3">
                  <div className="shell-icon-chip h-11 w-11 shrink-0 bg-[var(--primary-100)] text-[var(--primary-700)]">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {report?.wasteTypeName || "Unknown waste type"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {report?.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>

              {statusIndicator === "ASSIGNED" ? (
                <div className="rounded-[22px] border border-[rgba(78,123,217,0.16)] bg-[var(--accent-100)] p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Start your route
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        Mark this task as on the way before opening the completion form.
                      </p>
                    </div>
                    <Button type="button" onClick={() => updateStatus.mutate()} disabled={updateStatus.isPending}>
                      <Navigation className="mr-2 h-4 w-4" />
                      {updateStatus.isPending ? "Updating..." : "Start route"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          {mapCenter ? (
            <SectionCard className="overflow-hidden">
              <SectionHeader
                title="Location map"
                description="Pinned report position for this stop."
              />

              <div className="space-y-4 p-5 sm:p-6">
                <MapComponent
                  points={[
                    {
                      id: task.taskId,
                      lat: mapCenter[0],
                      lng: mapCenter[1],
                      status: statusIndicator,
                    },
                  ]}
                  center={mapCenter}
                  zoom={15}
                  interactive={false}
                />
              </div>
            </SectionCard>
          ) : null}
        </div>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Completion form"
            description="Submit proof and waste details to close this task."
          />

          <div className="p-5 sm:p-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                completeTask.mutate();
              }}
              className="space-y-5"
            >
              <div
                className={`space-y-5 transition-opacity ${
                  statusIndicator === "ASSIGNED" ? "pointer-events-none opacity-55" : ""
                }`}
              >
                <div>
                  <label htmlFor="collector-proof" className="field-label">
                    Collection proof photo
                  </label>
                  <div
                    className={`relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-[24px] border-2 border-dashed p-4 transition-colors ${
                      imagePreview
                        ? "border-[rgba(31,93,78,0.24)] bg-[var(--primary-50)]"
                        : "border-[rgba(32,48,51,0.16)] bg-[var(--bg-surface-muted)]"
                    }`}
                  >
                    {imagePreview ? (
                      <div className="relative h-full w-full">
                        <img
                          src={imagePreview}
                          alt="Collection proof preview"
                          className="h-full min-h-[188px] w-full rounded-[18px] object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="absolute bottom-3 right-3"
                          onClick={() => {
                            setImagePreview(null);
                            setProofFile(null);
                          }}
                        >
                          Replace
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="collector-proof"
                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 text-center"
                      >
                        <div className="shell-icon-chip h-16 w-16 rounded-[22px]">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            Upload proof image
                          </p>
                          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                            Add a clear after-collection photo before closing the task.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                  <input
                    id="collector-proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div>
                  <label htmlFor="estimated-weight" className="field-label">
                    Collected weight (kg)
                  </label>
                  <Input
                    id="estimated-weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 15.5"
                    value={estimatedWeight}
                    onChange={(event) => setEstimatedWeight(event.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="sorting-level" className="field-label">
                    Sorting quality
                  </label>
                  <select
                    id="sorting-level"
                    value={sortingLevel}
                    onChange={(event) => setSortingLevel(event.target.value)}
                    className="shell-select"
                  >
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="collector-note" className="field-label">
                    Collector note
                  </label>
                  <textarea
                    id="collector-note"
                    rows={4}
                    className="shell-textarea"
                    placeholder="Add site notes, contamination risks or access issues."
                    value={collectorNote}
                    onChange={(event) => setCollectorNote(event.target.value)}
                  />
                </div>
              </div>

              {statusIndicator === "ASSIGNED" ? (
                <div className="rounded-[20px] border border-[rgba(186,135,60,0.18)] bg-[var(--warning-50)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                  Start the route first to unlock the completion form.
                </div>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={statusIndicator === "ASSIGNED" || alreadyCollected || completeTask.isPending}
              >
                <PackageCheck className="mr-2 h-4.5 w-4.5" />
                {completeTask.isPending
                  ? "Submitting..."
                  : alreadyCollected
                    ? "Task completed"
                    : "Mark as completed"}
              </Button>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
