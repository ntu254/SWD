import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  PackageCheck,
  UploadCloud,
  Warehouse,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { Task } from "../../types";
import { MapComponent } from "../../components/maps/MapComponent";
import { StatusBadge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";

const MOCK_TASK: Task & {
  lat: number;
  lng: number;
  description: string;
  wasteType: string;
} = {
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
  description:
    "Large pile of recyclable plastics near the park entrance. A larger collection vehicle may be needed.",
  wasteType: "Recyclable Plastics",
};

export const CollectorTaskPage: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const task = {
    ...MOCK_TASK,
    taskId: taskId ?? MOCK_TASK.taskId,
  };

  const [statusIndicator, setStatusIndicator] = useState<string>(task.status);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [collectorNote, setCollectorNote] = useState("");

  const routeStarted =
    statusIndicator === "ON_THE_WAY" || statusIndicator === "COLLECTED";
  const alreadyCollected = statusIndicator === "COLLECTED";

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setStatusIndicator(newStatus);
    toast.success(`Task status updated to ${newStatus.replace(/_/g, " ")}.`);
  };

  const handleCompleteTask = (event: React.FormEvent) => {
    event.preventDefault();

    if (!imagePreview) {
      toast.error("Proof photo is required to complete the task.");
      return;
    }

    if (!estimatedWeight.trim()) {
      toast.error("Estimated weight is required.");
      return;
    }

    setStatusIndicator("COLLECTED");
    toast.success("Task formally completed. Reporting to enterprise.");
    window.setTimeout(() => navigate("/collector/dashboard"), 1500);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Collector workspace</span>}
        title="Task execution"
        description="Manage the current route stop, confirm evidence and complete the existing collector workflow from one focused detail view."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="secondary" onClick={() => navigate("/collector/map")}>
              Open map
            </Button>
          </div>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Assigned stop</span>}
        title={task.areaName || "Collector task"}
        description={task.description}
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
            {task.priority === "HIGH" ? (
              <div className="rounded-[18px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm font-semibold text-[var(--peach-600)]">
                Urgent priority stop
              </div>
            ) : null}
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
              description="Key task context from the current assignment payload."
            />

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-[24px] border border-[rgba(31,93,78,0.12)] bg-[var(--primary-50)] p-4">
                <div className="flex items-start gap-3">
                  <div className="shell-icon-chip h-11 w-11 shrink-0 bg-[var(--primary-100)] text-[var(--primary-700)]">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {task.wasteType}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Service area
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                    {task.areaName}
                  </p>
                </div>
                <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Priority
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                    {task.priority || "Normal"}
                  </p>
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
                    <Button
                      type="button"
                      onClick={() => handleUpdateStatus("ON_THE_WAY")}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Start route
                    </Button>
                  </div>
                </div>
              ) : null}

              {routeStarted && !alreadyCollected ? (
                <div className="rounded-[22px] border border-[rgba(78,123,217,0.16)] bg-[var(--accent-100)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                  You are currently en route to this location. Complete the form after the pickup is finished.
                </div>
              ) : null}

              {alreadyCollected ? (
                <div className="rounded-[22px] border border-[rgba(31,93,78,0.16)] bg-[var(--primary-100)] p-4">
                  <div className="flex items-start gap-3">
                    <div className="shell-icon-chip h-11 w-11 shrink-0 bg-white/70 text-[var(--primary-700)]">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Collection submitted
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        The completion proof has been staged and the task is marked as collected.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard className="overflow-hidden">
            <SectionHeader
              title="Location map"
              description="Use the pinned position to validate the stop before collection."
            />

            <div className="space-y-4 p-5 sm:p-6">
              <MapComponent
                points={[
                  {
                    id: task.taskId,
                    lat: task.lat,
                    lng: task.lng,
                    status: statusIndicator,
                  },
                ]}
                center={[task.lat, task.lng]}
                zoom={15}
                interactive={false}
              />
              <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Stop position
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  {task.lat.toFixed(5)}, {task.lng.toFixed(5)}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard className="overflow-hidden">
          <SectionHeader
            title="Completion form"
            description="Submit proof of collection after the route has started."
          />

          <div className="p-5 sm:p-6">
            <form onSubmit={handleCompleteTask} className="space-y-5">
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
                          onClick={() => setImagePreview(null)}
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
                    Estimated weight (kg)
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
                  <label htmlFor="collector-note" className="field-label">
                    Collector note
                  </label>
                  <textarea
                    id="collector-note"
                    rows={4}
                    className="shell-textarea"
                    placeholder="Add any site notes, contamination risks or access issues."
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
                disabled={statusIndicator === "ASSIGNED" || alreadyCollected}
              >
                <PackageCheck className="mr-2 h-4.5 w-4.5" />
                {alreadyCollected ? "Task collected" : "Mark as collected"}
              </Button>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
