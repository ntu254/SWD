import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Search, ShieldAlert, Trash2 } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "react-toastify";

import { adminApi } from "../../api";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  ModalShell,
  PageHeader,
  PageHero,
  SectionCard,
  SectionHeader,
  StatCard,
} from "../../components/ui/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

type Enterprise = {
  userId: string;
  displayName: string;
  email: string;
  accountStatus: string;
};

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "collected" as const;
    case "DISABLED":
      return "secondary" as const;
    case "BANNED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

export function AdminEnterprisesPage() {
  const queryClient = useQueryClient();
  const [deleteConfirm, setDeleteConfirm] = useState<Enterprise | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enterprises"],
    queryFn: () => adminApi.getEnterprises(0, 100).then((response) => response.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success("Enterprise status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-enterprises"] });
    },
    onError: () => toast.error("Failed to update enterprise status."),
  });

  const deleteEnterprise = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("Enterprise removed.");
      queryClient.invalidateQueries({ queryKey: ["admin-enterprises"] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Failed to delete enterprise."),
  });

  const enterprises: Enterprise[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredEnterprises = enterprises.filter(
    (enterprise) =>
      enterprise.displayName.toLowerCase().includes(normalizedSearch) ||
      enterprise.email.toLowerCase().includes(normalizedSearch),
  );
  const activeCount = enterprises.filter(
    (enterprise) => enterprise.accountStatus === "ACTIVE",
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      {deleteConfirm ? (
        <ModalShell
          title="Remove enterprise"
          description="This permanently removes the enterprise account."
          icon={ShieldAlert}
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteEnterprise.mutate(deleteConfirm.userId)}
                disabled={deleteEnterprise.isPending}
              >
                {deleteEnterprise.isPending ? "Removing..." : "Remove enterprise"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {deleteConfirm.displayName} ({deleteConfirm.email})
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="Enterprise accounts"
        description="Review organization access, toggle account state and manage enterprise presence across the platform."
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Account governance</span>}
        title="Monitor enterprise participation and account health."
        description="All status changes and deletions still use the same admin endpoints. This surface improves search, table clarity and destructive-action handling."
        tone="violet"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip bg-[var(--accent-100)] text-[var(--accent-600)]">
                <Building2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Total organizations
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {enterprises.length}
                </p>
              </div>
            </div>
          </div>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Total enterprises"
          value={enterprises.length}
          description="All enterprise accounts currently stored."
          tone="violet"
          featured
        />
        <StatCard
          icon={ShieldAlert}
          label="Active"
          value={activeCount}
          description="Accounts currently able to operate."
          tone="mint"
        />
        <StatCard
          icon={Trash2}
          label="Restricted"
          value={enterprises.length - activeCount}
          description="Disabled or otherwise unavailable accounts."
          tone="peach"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Enterprise directory"
          description="Search by company name or email, then toggle status or remove the account."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search enterprises by name or email"
                className="pl-11"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="shimmer h-18 rounded-[20px]" />
              ))}
            </div>
          ) : filteredEnterprises.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No enterprises found"
              description="Try another search term or check again after new organizations are onboarded."
              tone="slate"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnterprises.map((enterprise) => (
                  <TableRow key={enterprise.userId}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {enterprise.displayName}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          ID {enterprise.userId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{enterprise.email}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(enterprise.accountStatus)}>
                        {enterprise.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            updateStatus.mutate({
                              id: enterprise.userId,
                              status:
                                enterprise.accountStatus === "ACTIVE"
                                  ? "DISABLED"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {enterprise.accountStatus === "ACTIVE" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => setDeleteConfirm(enterprise)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
