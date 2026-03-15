import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gift, Pencil, Plus, Search, ShieldAlert } from "lucide-react";
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

type RewardItem = {
  itemId: string;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  stock: number;
  isActive: boolean;
};

type ItemForm = {
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: string;
  stock: string;
  isActive: boolean;
};

const EMPTY_FORM: ItemForm = {
  name: "",
  description: "",
  imageUrl: "",
  pointsCost: "",
  stock: "",
  isActive: true,
};

export function AdminRewardItemsPage() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    item?: RewardItem;
  } | null>(null);
  const [form, setForm] = useState<ItemForm>(EMPTY_FORM);
  const [deactivateTarget, setDeactivateTarget] = useState<RewardItem | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reward-items"],
    queryFn: () => adminApi.getRewardItems(0).then((response) => response.data),
  });

  const createItem = useMutation({
    mutationFn: (body: object) => adminApi.createRewardItem(body),
    onSuccess: () => {
      toast.success("Đã tạo vật phẩm thưởng.");
      queryClient.invalidateQueries({ queryKey: ["admin-reward-items"] });
      setModal(null);
    },
    onError: () => toast.error("Tạo vật phẩm thưởng thất bại."),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      adminApi.updateRewardItem(id, body),
    onSuccess: () => {
      toast.success("Đã cập nhật vật phẩm thưởng.");
      queryClient.invalidateQueries({ queryKey: ["admin-reward-items"] });
      setModal(null);
    },
    onError: () => toast.error("Cập nhật vật phẩm thưởng thất bại."),
  });

  const deactivateItem = useMutation({
    mutationFn: (id: string) => adminApi.deactivateRewardItem(id),
    onSuccess: () => {
      toast.success("Đã ngừng kích hoạt vật phẩm thưởng.");
      queryClient.invalidateQueries({ queryKey: ["admin-reward-items"] });
      setDeactivateTarget(null);
    },
    onError: () => toast.error("Ngừng kích hoạt vật phẩm thưởng thất bại."),
  });

  const items: RewardItem[] = data?.data?.content ?? [];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedSearch) ||
      (item.description ?? "").toLowerCase().includes(normalizedSearch),
  );
  const activeCount = items.filter((item) => item.isActive).length;
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ mode: "create" });
  };

  const openEdit = (item: RewardItem) => {
    setForm({
      name: item.name,
      description: item.description ?? "",
      imageUrl: item.imageUrl ?? "",
      pointsCost: String(item.pointsCost),
      stock: String(item.stock),
      isActive: item.isActive,
    });
    setModal({ mode: "edit", item });
  };

  const submitForm = () => {
    const body = {
      name: form.name,
      description: form.description,
      imageUrl: form.imageUrl,
      pointsCost: Number(form.pointsCost),
      stock: Number(form.stock),
      isActive: form.isActive,
    };

    if (modal?.mode === "create") {
      createItem.mutate(body);
    } else if (modal?.item) {
      updateItem.mutate({ id: modal.item.itemId, body });
    }
  };

  const isSaving = createItem.isPending || updateItem.isPending;

  return (
    <div className="space-y-4 lg:space-y-5">
      {modal ? (
        <ModalShell
          title={modal.mode === "create" ? "Tạo vật phẩm thưởng" : "Sửa vật phẩm thưởng"}
          description="Cấu hình thông tin danh mục, tồn kho và số điểm cần đổi."
          icon={modal.mode === "create" ? Plus : Pencil}
          onClose={() => setModal(null)}
          widthClassName="max-w-xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setModal(null)}>
                Hủy
              </Button>
              <Button
                onClick={submitForm}
                disabled={isSaving || !form.name || !form.pointsCost || !form.stock}
              >
                {isSaving
                  ? "Đang lưu..."
                  : modal.mode === "create"
                    ? "Tạo vật phẩm"
                    : "Lưu thay đổi"}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="reward-name" className="field-label">
                Tên vật phẩm
              </label>
              <Input
                id="reward-name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="reward-description" className="field-label">
                Mô tả
              </label>
              <textarea
                id="reward-description"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                rows={4}
                className="shell-textarea"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="reward-image" className="field-label">
                URL ảnh
              </label>
              <Input
                id="reward-image"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    imageUrl: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label htmlFor="reward-points" className="field-label">
                Điểm đổi
              </label>
              <Input
                id="reward-points"
                type="number"
                min="0"
                value={form.pointsCost}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pointsCost: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label htmlFor="reward-stock" className="field-label">
                Tồn kho
              </label>
              <Input
                id="reward-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label className="field-label">Trạng thái khả dụng</label>
              <button
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    isActive: !current.isActive,
                  }))
                }
                className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
                  form.isActive
                    ? "border-[rgba(31,93,78,0.18)] bg-[var(--primary-100)] text-[var(--primary-700)]"
                    : "border-[var(--stroke-soft)] bg-white/84 text-[var(--text-secondary)]"
                }`}
              >
                <span>{form.isActive ? "Đang hoạt động và có thể đổi" : "Ngừng hoạt động"}</span>
                <span>{form.isActive ? "Bật" : "Tắt"}</span>
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {deactivateTarget ? (
        <ModalShell
          title="Ngừng kích hoạt vật phẩm thưởng"
          description="Vật phẩm này sẽ không còn khả dụng để đổi."
          icon={ShieldAlert}
          onClose={() => setDeactivateTarget(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deactivateItem.mutate(deactivateTarget.itemId)}
                disabled={deactivateItem.isPending}
              >
                {deactivateItem.isPending ? "Đang ngừng kích hoạt..." : "Ngừng kích hoạt"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {deactivateTarget.name}
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian quản trị</span>}
        title="Danh mục phần thưởng"
        description="Quản lý tồn kho, mức điểm và khả năng đổi quà trong chương trình dành cho công dân."
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Vật phẩm mới
          </Button>
        }
      />

      {/* <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Catalog operations</span>}
        title="Keep the reward program stocked and credible."
        description="Reward item creation, updates and deactivation still use the same admin endpoints. This redesign standardizes the catalog table and modal editing workflow."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Gift className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Active catalog items
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>
        }
      /> */}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Gift}
          label="Vật phẩm trong danh mục"
          value={items.length}
          description="Tổng số vật phẩm thưởng đã cấu hình."
          tone="mint"
          featured
        />
        <StatCard
          icon={Plus}
          label="Đang hoạt động"
          value={activeCount}
          description="Những vật phẩm hiện đang hiển thị để đổi."
          tone="sky"
        />
        <StatCard
          icon={ShieldAlert}
          label="Tổng tồn kho"
          value={totalStock}
          description="Tổng số lượng còn lại của mọi vật phẩm."
          tone="sand"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Bảng danh mục"
          description="Tìm theo tên hoặc mô tả vật phẩm, sau đó sửa chi tiết hoặc ngừng kích hoạt."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm vật phẩm thưởng"
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
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Không tìm thấy vật phẩm thưởng"
              description="Tạo vật phẩm mới hoặc đổi từ khóa tìm kiếm để xem tồn kho hiện tại."
              tone="slate"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vật phẩm</TableHead>
                  <TableHead>Điểm</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.itemId}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {item.name}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {item.description || "Không có mô tả."}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{item.pointsCost.toLocaleString()} pts</TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? "collected" : "secondary"}>
                        {item.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Sửa
                        </Button>
                        {item.isActive ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeactivateTarget(item)}
                          >
                            Ngừng kích hoạt
                          </Button>
                        ) : null}
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
