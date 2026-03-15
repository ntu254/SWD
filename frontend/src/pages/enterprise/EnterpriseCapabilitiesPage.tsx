import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Recycle,
  Search,
  Trash2,
} from "lucide-react";
import { useDeferredValue, useState } from "react";
import { toast } from "react-toastify";

import {
  enterpriseCapabilitiesApi,
  serviceAreasApi,
  wasteTypesApi,
} from "../../api";
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

type Capability = {
  capabilityId: string;
  serviceAreaId: string;
  serviceAreaName: string;
  wasteTypeId: string;
  wasteTypeName: string;
  dailyCapacityKg: number;
  usedCapacityKg: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

type ServiceArea = {
  areaId: string;
  name: string;
  isActive?: boolean | null;
};

type WasteType = {
  wasteTypeId: string;
  name: string;
  isActive?: boolean | null;
};

type CapabilityForm = {
  serviceAreaId: string;
  wasteTypeId: string;
  dailyCapacityKg: string;
  effectiveFrom: string;
  effectiveTo: string;
};

const EMPTY_FORM: CapabilityForm = {
  serviceAreaId: "",
  wasteTypeId: "",
  dailyCapacityKg: "",
  effectiveFrom: "",
  effectiveTo: "",
};

function CreateCapabilityModal({
  serviceAreas,
  wasteTypes,
  onClose,
  onCreate,
  isPending,
}: {
  serviceAreas: ServiceArea[];
  wasteTypes: WasteType[];
  onClose: () => void;
  onCreate: (payload: {
    serviceAreaId: string;
    wasteTypeId: string;
    dailyCapacityKg: number;
    effectiveFrom?: string;
    effectiveTo?: string;
  }) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<CapabilityForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const capacityValue = Number(form.dailyCapacityKg);

    if (!form.serviceAreaId || !form.wasteTypeId) {
      setError("Vui lòng chọn cả khu vực phục vụ và loại rác.");
      return;
    }

    if (!form.dailyCapacityKg.trim() || Number.isNaN(capacityValue) || capacityValue <= 0) {
      setError("Công suất mỗi ngày phải lớn hơn 0.");
      return;
    }

    if (form.effectiveFrom && form.effectiveTo && form.effectiveFrom > form.effectiveTo) {
      setError("Ngày bắt đầu hiệu lực phải nhỏ hơn hoặc bằng ngày kết thúc.");
      return;
    }

    setError(null);
    onCreate({
      serviceAreaId: form.serviceAreaId,
      wasteTypeId: form.wasteTypeId,
      dailyCapacityKg: capacityValue,
      effectiveFrom: form.effectiveFrom || undefined,
      effectiveTo: form.effectiveTo || undefined,
    });
  };

  return (
    <ModalShell
      title="Đăng ký phạm vi phục vụ"
      description="Gắn loại rác và công suất mỗi ngày cho một khu vực mà doanh nghiệp của bạn có thể phục vụ."
      icon={MapPin}
      onClose={onClose}
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Đang lưu..." : "Đăng ký phạm vi phục vụ"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="capability-area" className="field-label">
            Khu vực phục vụ
          </label>
          <select
            id="capability-area"
            value={form.serviceAreaId}
            onChange={(event) =>
              setForm((current) => ({ ...current, serviceAreaId: event.target.value }))
            }
            className="shell-select"
          >
            <option value="">Chọn khu vực phục vụ</option>
            {serviceAreas.map((area) => (
              <option key={area.areaId} value={area.areaId}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="capability-waste-type" className="field-label">
            Loại rác
          </label>
          <select
            id="capability-waste-type"
            value={form.wasteTypeId}
            onChange={(event) =>
              setForm((current) => ({ ...current, wasteTypeId: event.target.value }))
            }
            className="shell-select"
          >
            <option value="">Chọn loại rác</option>
            {wasteTypes.map((wasteType) => (
              <option key={wasteType.wasteTypeId} value={wasteType.wasteTypeId}>
                {wasteType.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="capability-capacity" className="field-label">
            Công suất mỗi ngày (kg)
          </label>
          <Input
            id="capability-capacity"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="ví dụ 250"
            value={form.dailyCapacityKg}
            onChange={(event) =>
              setForm((current) => ({ ...current, dailyCapacityKg: event.target.value }))
            }
          />
        </div>

        <div>
          <label htmlFor="capability-effective-from" className="field-label">
            Hiệu lực từ
          </label>
          <Input
            id="capability-effective-from"
            type="date"
            value={form.effectiveFrom}
            onChange={(event) =>
              setForm((current) => ({ ...current, effectiveFrom: event.target.value }))
            }
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="capability-effective-to" className="field-label">
            Hiệu lực đến
          </label>
          <Input
            id="capability-effective-to"
            type="date"
            value={form.effectiveTo}
            onChange={(event) =>
              setForm((current) => ({ ...current, effectiveTo: event.target.value }))
            }
          />
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--peach-600)]">
          {error}
        </div>
      ) : null}
    </ModalShell>
  );
}

function formatCapacity(value: number) {
  return `${value.toLocaleString()} kg`;
}

export function EnterpriseCapabilitiesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleting, setDeleting] = useState<Capability | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { data: capabilitiesResponse, isLoading: capabilitiesLoading, refetch } = useQuery({
    queryKey: ["enterprise-capabilities"],
    queryFn: () => enterpriseCapabilitiesApi.getAll().then((response) => response.data),
  });
  const { data: serviceAreasResponse, isLoading: serviceAreasLoading } = useQuery({
    queryKey: ["service-areas"],
    queryFn: () => serviceAreasApi.getAll().then((response) => response.data),
  });
  const { data: wasteTypesResponse, isLoading: wasteTypesLoading } = useQuery({
    queryKey: ["waste-types"],
    queryFn: () => wasteTypesApi.getAll().then((response) => response.data),
  });

  const createCapability = useMutation({
    mutationFn: (payload: {
      serviceAreaId: string;
      wasteTypeId: string;
      dailyCapacityKg: number;
      effectiveFrom?: string;
      effectiveTo?: string;
    }) => enterpriseCapabilitiesApi.create(payload),
    onSuccess: () => {
      toast.success("Đăng ký phạm vi phục vụ thành công.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-capabilities"] });
      setShowCreate(false);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Đăng ký phạm vi phục vụ thất bại.";
      toast.error(message);
    },
  });

  const deleteCapability = useMutation({
    mutationFn: (capabilityId: string) => enterpriseCapabilitiesApi.delete(capabilityId),
    onSuccess: () => {
      toast.success("Đã xóa phạm vi phục vụ.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-capabilities"] });
      setDeleting(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Xóa phạm vi phục vụ thất bại.";
      toast.error(message);
    },
  });

  const capabilities: Capability[] = capabilitiesResponse?.data ?? [];
  const serviceAreas: ServiceArea[] = (serviceAreasResponse?.data ?? []).filter(
    (area: ServiceArea) => area.isActive !== false,
  );
  const wasteTypes: WasteType[] = (wasteTypesResponse?.data ?? []).filter(
    (wasteType: WasteType) => wasteType.isActive !== false,
  );

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredCapabilities = capabilities.filter((capability) => {
    const haystack = `${capability.serviceAreaName} ${capability.wasteTypeName}`.toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const totalCoverageAreas = new Set(capabilities.map((capability) => capability.serviceAreaId)).size;
  const totalDailyCapacity = capabilities.reduce(
    (sum, capability) => sum + (capability.dailyCapacityKg ?? 0),
    0,
  );
  const remainingCapacity = capabilities.reduce((sum, capability) => {
    const available = (capability.dailyCapacityKg ?? 0) - (capability.usedCapacityKg ?? 0);
    return sum + Math.max(available, 0);
  }, 0);

  const isLoading = capabilitiesLoading || serviceAreasLoading || wasteTypesLoading;

  return (
    <div className="space-y-4 lg:space-y-5">
      {showCreate ? (
        <CreateCapabilityModal
          serviceAreas={serviceAreas}
          wasteTypes={wasteTypes}
          onClose={() => setShowCreate(false)}
          onCreate={(payload) => createCapability.mutate(payload)}
          isPending={createCapability.isPending}
        />
      ) : null}

      {deleting ? (
        <ModalShell
          title="Xóa phạm vi phục vụ"
          description="Doanh nghiệp sẽ ngừng nhận khớp báo cáo mới cho khu vực và loại rác đã chọn."
          icon={Trash2}
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteCapability.mutate(deleting.capabilityId)}
                disabled={deleteCapability.isPending}
              >
                {deleteCapability.isPending ? "Đang xóa..." : "Xóa phạm vi"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {deleting.serviceAreaName} · {deleting.wasteTypeName}
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Không gian doanh nghiệp</span>}
        title="Đăng ký phạm vi phục vụ"
        description="Khai báo khu vực và loại rác doanh nghiệp có thể xử lý để việc tiếp nhận báo cáo và tạo nhiệm vụ khớp với khả năng vận hành thực tế."
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Đăng ký phạm vi phục vụ
            </Button>
          </>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Mức sẵn sàng phục vụ</span>}
        title="Liên kết khu vực, loại rác và công suất thực tế trong cùng một nơi."
        description="Trang này kích hoạt API capability của doanh nghiệp đã có sẵn ở backend, nên việc đăng ký phạm vi phục vụ giờ đã có luồng frontend đầy đủ thay vì bị thiếu giao diện."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Recycle className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Dữ liệu sẵn sàng để cấu hình
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Có {serviceAreas.length} khu vực phục vụ và {wasteTypes.length} loại rác sẵn sàng để đăng ký.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="Mục đăng ký"
          value={capabilities.length}
          description="Các cặp khu vực phục vụ và loại rác đã đăng ký."
          tone="mint"
          featured
        />
        <StatCard
          icon={PackageCheck}
          label="Khu vực đã phủ"
          value={totalCoverageAreas}
          description="Số khu vực duy nhất đang được gán cho doanh nghiệp này."
          tone="sky"
        />
        <StatCard
          icon={Recycle}
          label="Công suất mỗi ngày"
          value={formatCapacity(totalDailyCapacity)}
          description="Tổng công suất đã khai báo trên mọi mục đăng ký."
          tone="violet"
        />
        <StatCard
          icon={Clock}
          label="Công suất còn lại"
          value={formatCapacity(remainingCapacity)}
          description="Công suất chưa sử dụng theo mức dùng hiện tại."
          tone="sand"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Phạm vi đã đăng ký"
          description="Tìm theo khu vực hoặc loại rác, sau đó xóa những mục mà doanh nghiệp không còn hỗ trợ."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo khu vực phục vụ hoặc loại rác"
                className="pl-11"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="shimmer h-32 rounded-[24px]" />
              ))}
            </div>
          ) : filteredCapabilities.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Chưa có phạm vi nào được đăng ký"
              description={
                capabilities.length === 0
                  ? "Hãy bắt đầu bằng việc đăng ký khu vực và loại rác đầu tiên mà doanh nghiệp có thể xử lý."
                  : "Hãy thử từ khóa khác để tìm đúng mục đăng ký bạn cần."
              }
              action={
                capabilities.length === 0 ? (
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Đăng ký mục đầu tiên
                  </Button>
                ) : undefined
              }
              tone="slate"
            />
          ) : (
            <div className="space-y-4">
              {filteredCapabilities.map((capability) => {
                const usedCapacity = capability.usedCapacityKg ?? 0;
                const dailyCapacity = capability.dailyCapacityKg ?? 0;
                const utilization =
                  dailyCapacity > 0 ? Math.min(Math.round((usedCapacity / dailyCapacity) * 100), 100) : 0;

                return (
                  <div
                    key={capability.capabilityId}
                    className="shell-card shell-card-hover rounded-[26px] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {capability.serviceAreaName}
                          </p>
                          <Badge variant="accepted">{capability.wasteTypeName}</Badge>
                          <Badge variant="assigned">{formatCapacity(dailyCapacity)}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
                            <span>Đã dùng {formatCapacity(usedCapacity)}</span>
                            <span>{utilization}% công suất</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-surface-muted)]">
                            <div
                              className="h-full rounded-full bg-[var(--primary-500)] transition-[width]"
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                          <span>
                            Hiệu lực từ: {capability.effectiveFrom ?? "Ngay lập tức"}
                          </span>
                          <span>
                            Hiệu lực đến: {capability.effectiveTo ?? "Không giới hạn"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleting(capability)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
