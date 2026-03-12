import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, UserCog } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "react-toastify";

import { adminApi } from "../../api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  EmptyState,
  FilterTabs,
  ModalShell,
  PageHeader,
  SectionCard,
} from "../../components/ui/page";

type User = {
  userId: string;
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
  accountStatus?: string | null;
};

const ROLES = ["ALL", "CITIZEN", "COLLECTOR", "ENTERPRISE", "ADMIN"] as const;
const ROLE_VARIANT: Record<string, "default" | "assigned" | "ontheway" | "accepted" | "destructive"> = {
  ADMIN: "destructive",
  ENTERPRISE: "assigned",
  COLLECTOR: "accepted",
  CITIZEN: "default",
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState<{
    userId: string;
    current: string;
  } | null>(null);
  const [newRole, setNewRole] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter],
    queryFn: () =>
      adminApi
        .getUsers(0, roleFilter === "ALL" ? undefined : roleFilter, undefined)
        .then((response) => response.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRoleModal(null);
    },
    onError: () => toast.error("Failed to update role"),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteConfirm(null);
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const allUsers: User[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const users = allUsers.filter(
    (user) =>
      (user.displayName ?? "").toLowerCase().includes(normalizedSearch) ||
      (user.email ?? "").toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="User management"
        description={`${allUsers.length} users available across all current roles. Filter, change status or update permissions without changing the backend workflow.`}
      />

      <div className="shell-toolbar">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="pl-11"
          />
        </div>
        <FilterTabs
          value={roleFilter}
          options={ROLES}
          onChange={(value) => setRoleFilter(value)}
        />
      </div>

      <SectionCard className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="shimmer h-18 rounded-[20px]" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={UserCog}
              title="No users found"
              description="Try a different role filter or search keyword to locate the account you need."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="shell-table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.userId}
                    className="border-b border-[rgba(94,110,125,0.08)]"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {user.displayName || "Unnamed user"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          User ID: {user.userId}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {user.email || "No email"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={ROLE_VARIANT[user.role ?? ""] ?? "secondary"}
                      >
                        {user.role ?? "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          user.accountStatus === "ACTIVE"
                            ? "collected"
                            : "rejected"
                        }
                      >
                        {user.accountStatus ?? "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setRoleModal({
                              userId: user.userId,
                              current: user.role ?? "CITIZEN",
                            });
                            setNewRole(user.role ?? "CITIZEN");
                          }}
                        >
                          <UserCog className="mr-1.5 h-3.5 w-3.5" />
                          Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus.mutate({
                              id: user.userId,
                              status:
                                user.accountStatus === "ACTIVE"
                                  ? "DISABLED"
                                  : "ACTIVE",
                            })
                          }
                        >
                          {user.accountStatus === "ACTIVE" ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => setDeleteConfirm(user.userId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {roleModal ? (
        <ModalShell
          title="Change role"
          description="Assign a new role without changing the user record or login flow."
          icon={UserCog}
          onClose={() => setRoleModal(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setRoleModal(null)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  updateRole.mutate({ id: roleModal.userId, role: newRole })
                }
                disabled={updateRole.isPending}
              >
                {updateRole.isPending ? "Saving..." : "Save role"}
              </Button>
            </>
          }
        >
          <select
            value={newRole}
            onChange={(event) => setNewRole(event.target.value)}
            className="shell-select"
          >
            {["CITIZEN", "COLLECTOR", "ENTERPRISE", "ADMIN"].map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </ModalShell>
      ) : null}

      {deleteConfirm ? (
        <ModalShell
          title="Delete user"
          description="This permanently removes the account and cannot be undone."
          icon={Trash2}
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteUser.mutate(deleteConfirm)}
                disabled={deleteUser.isPending}
              >
                {deleteUser.isPending ? "Deleting..." : "Delete user"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-red-200 bg-red-50/80 p-4 text-sm text-red-800">
            User ID: {deleteConfirm}
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
