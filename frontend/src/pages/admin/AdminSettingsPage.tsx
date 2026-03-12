import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { adminApi } from "../../api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  EmptyState,
  ModalShell,
  PageHeader,
  SectionCard,
} from "../../components/ui/page";

type Setting = {
  settingKey: string;
  settingValue: string;
  description?: string;
};

export function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteKey, setDeleteKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.getSettings().then((response) => response.data),
  });

  const updateSetting = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: () => {
      toast.success("Setting saved");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setEditKey(null);
    },
    onError: () => toast.error("Failed to save setting"),
  });

  const createSetting = useMutation({
    mutationFn: (body: object) => adminApi.createSetting(body),
    onSuccess: () => {
      toast.success("Setting created");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setCreateModal(false);
      setNewKey("");
      setNewValue("");
      setNewDesc("");
    },
    onError: () => toast.error("Failed to create setting"),
  });

  const deleteSetting = useMutation({
    mutationFn: (key: string) => adminApi.deleteSetting(key),
    onSuccess: () => {
      toast.success("Setting deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDeleteKey(null);
    },
    onError: () => toast.error("Failed to delete setting"),
  });

  const settings: Setting[] = data?.data ?? [];

  const startEdit = (setting: Setting) => {
    setEditKey(setting.settingKey);
    setEditValue(setting.settingValue);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Admin workspace</span>}
        title="System settings"
        description={`${settings.length} configuration keys currently drive the application. Edit values, add new entries or remove deprecated keys from one clean screen.`}
        actions={
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New setting
          </Button>
        }
      />

      <SectionCard className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5 sm:p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="shimmer h-18 rounded-[20px]" />
            ))}
          </div>
        ) : settings.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={Settings}
              title="No settings configured"
              description="Create your first key-value pair to start managing runtime configuration from the admin area."
            />
          </div>
        ) : (
          <div className="divide-y divide-[rgba(94,110,125,0.08)]">
            {settings.map((setting) => (
              <div
                key={setting.settingKey}
                className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold text-[var(--text-primary)]">
                    {setting.settingKey}
                  </p>
                  {setting.description ? (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {setting.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {editKey === setting.settingKey ? (
                    <>
                      <Input
                        value={editValue}
                        onChange={(event) => setEditValue(event.target.value)}
                        autoFocus
                        className="min-w-[220px] font-mono"
                      />
                      <Button
                        size="sm"
                        onClick={() =>
                          updateSetting.mutate({
                            key: setting.settingKey,
                            value: editValue,
                          })
                        }
                        disabled={updateSetting.isPending}
                      >
                        {updateSetting.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditKey(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-[18px] border border-[var(--stroke-soft)] bg-white/86 px-4 py-3 font-mono text-sm text-[var(--text-secondary)]">
                        {setting.settingValue}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEdit(setting)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => setDeleteKey(setting.settingKey)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {createModal ? (
        <ModalShell
          title="Create setting"
          description="Add a new configuration key without changing the rest of the admin workflow."
          icon={Plus}
          onClose={() => setCreateModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() =>
                  createSetting.mutate({
                    settingKey: newKey,
                    settingValue: newValue,
                    description: newDesc,
                  })
                }
                disabled={createSetting.isPending || !newKey || !newValue}
              >
                {createSetting.isPending ? "Creating..." : "Create setting"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                Key
              </label>
              <Input
                value={newKey}
                onChange={(event) => setNewKey(event.target.value)}
                placeholder="MY_SETTING_KEY"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                Value
              </label>
              <Input
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                placeholder="value"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                Description
              </label>
              <input
                value={newDesc}
                onChange={(event) => setNewDesc(event.target.value)}
                placeholder="What this setting controls"
                className="shell-input"
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {deleteKey ? (
        <ModalShell
          title="Delete setting"
          description="This action removes the key permanently."
          icon={Trash2}
          onClose={() => setDeleteKey(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteKey(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteSetting.mutate(deleteKey)}
                disabled={deleteSetting.isPending}
              >
                {deleteSetting.isPending ? "Deleting..." : "Delete setting"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-red-200 bg-red-50/80 p-4">
            <p className="text-sm text-red-800">
              Key: <span className="font-mono font-semibold">{deleteKey}</span>
            </p>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
