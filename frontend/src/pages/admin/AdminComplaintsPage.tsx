import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { complaintsApi } from "../../api";
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

type Complaint = {
  complaintId: string;
  createdByName: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

const STATUS_TABS = ["ALL", "OPEN", "RESOLVED"] as const;

function getPriorityVariant(priority: string) {
  switch (priority) {
    case "HIGH":
      return "destructive" as const;
    case "MEDIUM":
      return "pending" as const;
    case "LOW":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function AdminComplaintsPage() {
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState<string>("ALL");
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isAccepted, setIsAccepted] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-complaints", statusTab],
    queryFn: () =>
      complaintsApi
        .getAll(0, statusTab === "ALL" ? undefined : statusTab)
        .then((response) => response.data),
  });

  const resolveComplaint = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      complaintsApi.resolve(id, body),
    onSuccess: () => {
      toast.success("Complaint resolved.");
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      setResolveModal(null);
    },
    onError: () => toast.error("Failed to resolve complaint."),
  });

  const complaints: Complaint[] = data?.data?.content ?? [];
  const openCount = complaints.filter((complaint) => complaint.status === "OPEN").length;
  const resolvedCount = complaints.filter(
    (complaint) => complaint.status === "RESOLVED",
  ).length;

  const openResolveModal = (complaint: Complaint) => {
    setResolveModal(complaint);
    setAdminResponse("");
    setIsAccepted(true);
  };

  const submitResolve = () => {
    if (!resolveModal) return;

    resolveComplaint.mutate({
      id: resolveModal.complaintId,
      body: {
        decision: "RESOLVED",
        note: adminResponse || "Issue reviewed and addressed.",
        isAccepted,
        adminResponse: adminResponse || "Thank you for your report.",
      },
    });
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {resolveModal ? (
        <ModalShell
          title="Resolve complaint"
          description="Document the admin response and confirm the final outcome."
          icon={ShieldCheck}
          onClose={() => setResolveModal(null)}
          widthClassName="max-w-xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setResolveModal(null)}>
                Cancel
              </Button>
              <Button onClick={submitResolve} disabled={resolveComplaint.isPending}>
                {resolveComplaint.isPending ? "Submitting..." : "Submit response"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {resolveModal.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {resolveModal.content}
              </p>
            </div>

            <div>
              <label htmlFor="complaint-response" className="field-label">
                Admin response
              </label>
              <textarea
                id="complaint-response"
                value={adminResponse}
                onChange={(event) => setAdminResponse(event.target.value)}
                rows={4}
                className="shell-textarea"
                placeholder="Write the response that will be stored with this complaint."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsAccepted(true)}
                className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${isAccepted
                    ? "border-[rgba(31,93,78,0.18)] bg-[var(--primary-100)] text-[var(--primary-700)]"
                    : "border-[var(--stroke-soft)] bg-white/80 text-[var(--text-secondary)]"
                  }`}
              >
                Accept complaint
              </button>
              <button
                type="button"
                onClick={() => setIsAccepted(false)}
                className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${!isAccepted
                    ? "border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] text-[var(--peach-600)]"
                    : "border-[var(--stroke-soft)] bg-white/80 text-[var(--text-secondary)]"
                  }`}
              >
                Reject complaint
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="Complaint resolution"
        description="Review user complaints, track their current state and close the loop with a documented admin response."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={AlertCircle}
          label="Open"
          value={openCount}
          description="Complaints still awaiting a final response."
          tone="sand"
          featured
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedCount}
          description="Issues already reviewed and closed."
          tone="mint"
        />
        <StatCard
          icon={MessageSquare}
          label="Visible in filter"
          value={complaints.length}
          description="Results matching the current status tab."
          tone="sky"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Complaint list"
          description="Filter the queue by status and open any record to respond."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <FilterTabs
              value={statusTab}
              options={STATUS_TABS}
              onChange={(value) => setStatusTab(value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-28 rounded-[24px]" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No complaints in this view"
              description="Try another status tab or check again after new issues are submitted."
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.complaintId}
                  className="shell-card shell-card-hover rounded-[26px] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          {complaint.title}
                        </p>
                        <Badge variant={getPriorityVariant(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                        <Badge
                          variant={
                            complaint.status === "RESOLVED"
                              ? "collected"
                              : "pending"
                          }
                        >
                          {complaint.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                        <span>{complaint.createdByName}</span>
                        <span>{complaint.category}</span>
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                      </div>

                      <p className="max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">
                        {complaint.content}
                      </p>

                      {complaint.adminResponse ? (
                        <div className="rounded-[18px] border border-[rgba(31,93,78,0.14)] bg-[var(--primary-50)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
                          <span className="font-semibold text-[var(--text-primary)]">
                            Admin response:
                          </span>{" "}
                          {complaint.adminResponse}
                        </div>
                      ) : null}
                    </div>

                    {complaint.status === "OPEN" ? (
                      <Button onClick={() => openResolveModal(complaint)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Resolve
                      </Button>
                    ) : null}
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
