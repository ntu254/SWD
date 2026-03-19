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
import { formatStatusLabel } from "../../lib/labels";

type Enterprise = {
  userId: string;
  displayName?: string | null;
  email?: string | null;
  accountStatus?: string | null;
};

function getStatusVariant(status?: string | null) {
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
    queryFn: () =>
      adminApi.getEnterprises(0, 100).then((response) => response.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật trạng thái doanh nghiệp.");
      queryClient.invalidateQueries({ queryKey: ["admin-enterprises"] });
    },
    onError: () => toast.error("Cập nhật trạng thái doanh nghiệp thất bại."),
  });

  const deleteEnterprise = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("Đã xóa doanh nghiệp.");
      queryClient.invalidateQueries({ queryKey: ["admin-enterprises"] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Xóa doanh nghiệp thất bại."),
  });

  const enterprises: Enterprise[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredEnterprises = enterprises.filter((enterprise) => {
    const name = (enterprise.displayName ?? "").toLowerCase();
    const email = (enterprise.email ?? "").toLowerCase();
    return name.includes(normalizedSearch) || email.includes(normalizedSearch);
  });
  const activeCount = enterprises.filter(
    (enterprise) => enterprise.accountStatus === "ACTIVE",
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      {deleteConfirm ? (
        <ModalShell
          title="Xóa doanh nghiệp"
          description="Thao tác này sẽ xóa vĩnh viễn tài khoản doanh nghiệp."
          icon={ShieldAlert}
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteEnterprise.mutate(deleteConfirm.userId)}
                disabled={deleteEnterprise.isPending}
              >
                {deleteEnterprise.isPending
                  ? "Đang xóa..."
                  : "Xóa doanh nghiệp"}
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
        eyebrow={
          <span className="shell-chip shell-chip-primary">
            Không gian quản trị
          </span>
        }
        title="Tài khoản doanh nghiệp"
        description="Theo dõi quyền truy cập của tổ chức, bật tắt trạng thái tài khoản và quản lý doanh nghiệp trên toàn nền tảng."
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
          label="Tổng doanh nghiệp"
          value={enterprises.length}
          description="Toàn bộ tài khoản doanh nghiệp hiện có."
          tone="violet"
          featured
        />
        <StatCard
          icon={ShieldAlert}
          label="Đang hoạt động"
          value={activeCount}
          description="Những tài khoản hiện có thể vận hành."
          tone="mint"
        />
        <StatCard
          icon={Trash2}
          label="Bị hạn chế"
          value={enterprises.length - activeCount}
          description="Những tài khoản đã bị vô hiệu hóa hoặc tạm không khả dụng."
          tone="peach"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Danh sách doanh nghiệp"
          description="Tìm theo tên công ty hoặc email, sau đó đổi trạng thái hoặc xóa tài khoản."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm doanh nghiệp theo tên hoặc email"
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
              title="Không tìm thấy doanh nghiệp"
              description="Hãy thử từ khóa khác hoặc kiểm tra lại sau khi có tổ chức mới tham gia."
              tone="slate"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnterprises.map((enterprise) => (
                  <TableRow key={enterprise.userId}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {enterprise.displayName ||
                            "Doanh nghiệp chưa cập nhật tên"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Mã {enterprise.userId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enterprise.email || "Không có email"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(enterprise.accountStatus)}
                      >
                        {formatStatusLabel(enterprise.accountStatus)}
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
                          {enterprise.accountStatus === "ACTIVE"
                            ? "Vô hiệu hóa"
                            : "Kích hoạt"}
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
