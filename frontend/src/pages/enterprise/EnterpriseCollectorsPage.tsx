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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

const editSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
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
      toast.success("Collector account created.");
      onCreated();
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create collector.";
      toast.error(message);
    }
  };

  return (
    <ModalShell
      title="Add collector"
      description="Create a new collector account under the current enterprise."
      icon={Users}
      onClose={onClose}
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="create-first-name" className="field-label">
            First name
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
            Last name
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
            Password
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
            Phone
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
      toast.success("Collector updated.");
      onSaved();
      onClose();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update collector.";
      toast.error(message);
    }
  };

  return (
    <ModalShell
      title="Edit collector"
      description={collector.email}
      icon={Pencil}
      onClose={onClose}
      widthClassName="max-w-xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </>
      }
    >
      <form className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-first-name" className="field-label">
            First name
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
            Last name
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
            Display name
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
            Phone
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
      toast.success("Collector deactivated.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-collectors"] });
      setDeactivating(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to deactivate collector.";
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
          title="Deactivate collector"
          description="The collector will no longer be able to sign in until re-enabled."
          icon={ShieldAlert}
          onClose={() => setDeactivating(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivating(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deactivateCollector.mutate(deactivating.userId)}
                disabled={deactivateCollector.isPending}
              >
                {deactivateCollector.isPending ? "Deactivating..." : "Deactivate"}
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
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Collector management"
        description="Manage the collector accounts assigned to your enterprise with a cleaner directory, search and edit flow."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add collector
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Team capacity</span>}
        title="Keep the collection network coordinated."
        description="Account creation, editing and deactivation continue to use the existing backend endpoints. This view simply standardizes search, table actions and dialog behavior."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Users className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Active collectors
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {activeCollectors}
                </p>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {collectors.length - activeCollectors} accounts are currently paused or
              restricted.
            </p>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total collectors"
          value={collectors.length}
          description="All collector accounts under this enterprise."
          tone="mint"
          featured
        />
        <StatCard
          icon={UserIcon}
          label="Active"
          value={activeCollectors}
          description="Accounts ready to receive assignments."
          tone="sky"
        />
        <StatCard
          icon={UserX}
          label="Inactive"
          value={collectors.length - activeCollectors}
          description="Disabled, banned or pending deletion."
          tone="peach"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Collector directory"
          description="Search by name or email, then edit details or deactivate access."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search collectors by name or email"
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
              title="No collectors found"
              description={
                collectors.length === 0
                  ? "Start by creating your first collector account."
                  : "Try another search term to find the collector you need."
              }
              action={
                collectors.length === 0 ? (
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add first collector
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collector</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                            {initials || "CU"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {name}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              ID {collector.userId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{collector.email}</TableCell>
                      <TableCell>{collector.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(collector.accountStatus)}>
                          {collector.accountStatus}
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
                            Edit
                          </Button>
                          {collector.accountStatus !== "DISABLED" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeactivating(collector)}
                            >
                              <UserX className="mr-2 h-3.5 w-3.5" />
                              Deactivate
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
