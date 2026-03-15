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
      toast.success("Đã lưu cài đặt");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setEditKey(null);
    },
    onError: () => toast.error("Lưu cài đặt thất bại"),
  });

  const createSetting = useMutation({
    mutationFn: (body: object) => adminApi.createSetting(body),
    onSuccess: () => {
      toast.success("Đã tạo cài đặt");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setCreateModal(false);
      setNewKey("");
      setNewValue("");
      setNewDesc("");
    },
    onError: () => toast.error("Tạo cài đặt thất bại"),
  });

  const deleteSetting = useMutation({
    mutationFn: (key: string) => adminApi.deleteSetting(key),
    onSuccess: () => {
      toast.success("Đã xóa cài đặt");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setDeleteKey(null);
    },
    onError: () => toast.error("Xóa cài đặt thất bại"),
  });

  const settings: Setting[] = data?.data ?? [];

  const startEdit = (setting: Setting) => {
    setEditKey(setting.settingKey);
    setEditValue(setting.settingValue);
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian quản trị</span>}
        title="Cài đặt hệ thống"
        description={`Hiện có ${settings.length} khóa cấu hình đang điều khiển ứng dụng. Bạn có thể sửa giá trị, thêm khóa mới hoặc xóa khóa đã cũ trong một màn hình duy nhất.`}
        actions={
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Cài đặt mới
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
              title="Chưa có cài đặt nào"
              description="Hãy tạo cặp khóa - giá trị đầu tiên để bắt đầu quản lý cấu hình từ khu vực quản trị."
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
                        {updateSetting.isPending ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditKey(null)}
                      >
                        Hủy
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
                        Sửa
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
          title="Tạo cài đặt"
          description="Thêm khóa cấu hình mới mà không làm thay đổi phần còn lại của luồng quản trị."
          icon={Plus}
          onClose={() => setCreateModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setCreateModal(false)}>
                Hủy
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
                {createSetting.isPending ? "Đang tạo..." : "Tạo cài đặt"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">
                Khóa
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
                Giá trị
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
                Mô tả
              </label>
              <input
                value={newDesc}
                onChange={(event) => setNewDesc(event.target.value)}
                placeholder="Cài đặt này dùng để làm gì"
                className="shell-input"
              />
            </div>
          </div>
        </ModalShell>
      ) : null}

      {deleteKey ? (
        <ModalShell
          title="Xóa cài đặt"
          description="Thao tác này sẽ xóa vĩnh viễn khóa cấu hình."
          icon={Trash2}
          onClose={() => setDeleteKey(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteKey(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteSetting.mutate(deleteKey)}
                disabled={deleteSetting.isPending}
              >
                {deleteSetting.isPending ? "Đang xóa..." : "Xóa cài đặt"}
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
