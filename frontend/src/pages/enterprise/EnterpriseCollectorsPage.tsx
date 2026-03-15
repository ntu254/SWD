import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldAlert,
  User as UserIcon,
  UserX,
  Users,
} from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import { enterpriseCollectorsApi } from "../../api";
import { authApi } from "../../api/auth";
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
import { formatStatusLabel } from "../../lib/labels";
import { useAuthStore } from "../../store/authStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface Collector {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  accountStatus: string;
}

const createSchema = z.object({
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  phone: z.string().optional(),
});

const editSchema = z.object({
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().min(1, "Họ là bắt buộc"),
  displayName: z.string().optional(),
  phone: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

function getCollectorName(collector: Collector) {
  return (
    collector.displayName ||
    `${collector.firstName ?? ""} ${collector.lastName ?? ""}`.trim() ||
    collector.email
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case "ACTIVE":
      return "collected" as const;
    case "DISABLED":
      return "secondary" as const;
    case "BANNED":
      return "destructive" as const;
    case "PENDING_DELETE":
      return "pending" as const;
    default:
      return "outline" as const;
  }
}

function CreateModal({
  onClose,
  enterpriseUserId,
  onCreated,
}: {
  onClose: () => void;
  enterpriseUserId: string;
  onCreated: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const onSubmit = async (data: CreateForm) => {
    try {
      await authApi.register({
        ...data,
        role: "COLLECTOR",
        enterpriseUserId,
      });
      toast.success("Tạo tài khoản nhân viên thu gom thành công.");
      onCreated();
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Tạo nhân viên thu gom thất bại.";
      toast.error(message);
    }
  };

  return (
    <ModalShell
      title="Thêm nhân viên thu gom"
      description="Tạo một tài khoản nhân viên thu gom mới thuộc doanh nghiệp hiện tại."
      icon={Users}
      onClose={onClose}
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Đang tạo..." : "Tạo tài khoản"}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="create-first-name" className="field-label">
            Tên
          </label>
          <Input id="create-first-name" {...register("firstName")} />
          {errors.firstName ? (
            <p role="alert" className="field-error">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="create-last-name" className="field-label">
            Họ
          </label>
          <Input id="create-last-name" {...register("lastName")} />
          {errors.lastName ? (
            <p role="alert" className="field-error">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="create-email" className="field-label">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="create-email"
              type="email"
              className="pl-11"
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p role="alert" className="field-error">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="create-password" className="field-label">
            Mật khẩu
          </label>
          <Input
            id="create-password"
            type="password"
            {...register("password")}
          />
          {errors.password ? (
            <p role="alert" className="field-error">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="create-phone" className="field-label">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input id="create-phone" className="pl-11" {...register("phone")} />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function EditModal({
  collector,
  onClose,
  onSaved,
}: {
  collector: Collector;
  onClose: () => void;
  onSaved: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      firstName: collector.firstName ?? "",
      lastName: collector.lastName ?? "",
      displayName: collector.displayName ?? "",
      phone: collector.phone ?? "",
    },
  });

  const onSubmit = async (data: EditForm) => {
    try {
      await enterpriseCollectorsApi.update(collector.userId, data);
      toast.success("Đã cập nhật nhân viên thu gom.");
      onSaved();
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Cập nhật nhân viên thu gom thất bại.";
      toast.error(message);
    }
  };

  return (
    <ModalShell
      title="Sửa nhân viên thu gom"
      description={collector.email}
      icon={Pencil}
      onClose={onClose}
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-first-name" className="field-label">
            Tên
          </label>
          <Input id="edit-first-name" {...register("firstName")} />
          {errors.firstName ? (
            <p role="alert" className="field-error">
              {errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="edit-last-name" className="field-label">
            Họ
          </label>
          <Input id="edit-last-name" {...register("lastName")} />
          {errors.lastName ? (
            <p role="alert" className="field-error">
              {errors.lastName.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="edit-display-name" className="field-label">
            Tên hiển thị
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              id="edit-display-name"
              className="pl-11"
              {...register("displayName")}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="edit-phone" className="field-label">
            Số điện thoại
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input id="edit-phone" className="pl-11" {...register("phone")} />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

export function EnterpriseCollectorsPage() {
  const queryClient = useQueryClient();
  const enterpriseUserId = useAuthStore((state) => state.userId) ?? "";

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Collector | null>(null);
  const [deactivating, setDeactivating] = useState<Collector | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["enterprise-collectors"],
    queryFn: () => enterpriseCollectorsApi.getAll().then((response) => response.data),
  });

  const deactivateCollector = useMutation({
    mutationFn: (collectorUserId: string) =>
      enterpriseCollectorsApi.deactivate(collectorUserId),
    onSuccess: () => {
      toast.success("Đã vô hiệu hóa nhân viên thu gom.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-collectors"] });
      setDeactivating(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Vô hiệu hóa nhân viên thu gom thất bại.";
      toast.error(message);
    },
  });

  const collectors: Collector[] = data?.data ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredCollectors = collectors.filter((collector) => {
    const name = getCollectorName(collector).toLowerCase();
    return (
      name.includes(normalizedSearch) ||
      collector.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const refreshCollectors = () =>
    queryClient.invalidateQueries({ queryKey: ["enterprise-collectors"] });

  const activeCollectors = collectors.filter(
    (collector) => collector.accountStatus === "ACTIVE",
  ).length;

  return (
    <div className="space-y-4 lg:space-y-5">
      {showCreate ? (
        <CreateModal
          enterpriseUserId={enterpriseUserId}
          onClose={() => setShowCreate(false)}
          onCreated={refreshCollectors}
        />
      ) : null}

      {editing ? (
        <EditModal
          collector={editing}
          onClose={() => setEditing(null)}
          onSaved={refreshCollectors}
        />
      ) : null}

      {deactivating ? (
        <ModalShell
          title="Vô hiệu hóa nhân viên thu gom"
          description="Nhân viên này sẽ không thể đăng nhập cho tới khi được bật lại."
          icon={ShieldAlert}
          onClose={() => setDeactivating(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivating(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deactivateCollector.mutate(deactivating.userId)}
                disabled={deactivateCollector.isPending}
              >
                {deactivateCollector.isPending ? "Đang vô hiệu hóa..." : "Vô hiệu hóa"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {getCollectorName(deactivating)} ({deactivating.email})
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Quản lý nhân viên thu gom"
        description="Quản lý các tài khoản nhân viên thu gom của doanh nghiệp với danh sách, tìm kiếm và chỉnh sửa rõ ràng hơn."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Năng lực đội ngũ</span>}
        title="Giữ mạng lưới thu gom luôn được phối hợp tốt."
        description="Việc tạo, sửa và vô hiệu hóa tài khoản vẫn dùng cùng endpoint backend hiện có. Màn này chỉ chuẩn hóa tìm kiếm, thao tác bảng và hộp thoại."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Nhân viên đang hoạt động
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {activeCollectors}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Có {collectors.length - activeCollectors} tài khoản hiện đang tạm dừng hoặc bị hạn chế.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Tổng nhân viên"
          value={collectors.length}
          description="Toàn bộ tài khoản nhân viên thuộc doanh nghiệp này."
          tone="mint"
          featured
        />
        <StatCard
          icon={UserIcon}
          label="Đang hoạt động"
          value={activeCollectors}
          description="Tài khoản sẵn sàng nhận phân công."
          tone="sky"
        />
        <StatCard
          icon={UserX}
          label="Không hoạt động"
          value={collectors.length - activeCollectors}
          description="Bao gồm tài khoản bị vô hiệu hóa, khóa hoặc chờ xóa."
          tone="peach"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Danh sách nhân viên"
          description="Tìm theo tên hoặc email, sau đó sửa thông tin hoặc vô hiệu hóa quyền truy cập."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm nhân viên theo tên hoặc email"
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
          ) : filteredCollectors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Không tìm thấy nhân viên nào"
              description={
                collectors.length === 0
                  ? "Hãy bắt đầu bằng việc tạo tài khoản nhân viên thu gom đầu tiên."
                  : "Hãy thử từ khóa khác để tìm đúng nhân viên bạn cần."
              }
              action={
                collectors.length === 0 ? (
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm nhân viên đầu tiên
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollectors.map((collector) => {
                  const name = getCollectorName(collector);
                  const initials = name
                    .split(" ")
                    .map((word) => word[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <TableRow key={collector.userId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-[var(--primary-100)] text-xs font-bold text-[var(--primary-800)]">
                            {initials || "TG"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {name}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              Mã {collector.userId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{collector.email}</TableCell>
                      <TableCell>{collector.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(collector.accountStatus)}>
                          {formatStatusLabel(collector.accountStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditing(collector)}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Sửa
                          </Button>
                          {collector.accountStatus !== "DISABLED" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeactivating(collector)}
                            >
                              <UserX className="mr-2 h-3.5 w-3.5" />
                              Vô hiệu hóa
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
