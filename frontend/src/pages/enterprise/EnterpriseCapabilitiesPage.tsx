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
import { useDeferredValue, useMemo, useState } from "react";
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

type CapabilityBatchPayload = {
  serviceAreaId: string;
  wasteTypeId: string;
  dailyCapacityKg: number;
  effectiveFrom?: string;
  effectiveTo?: string;
};

type CapabilityForm = {
  serviceAreaIds: string[];
  wasteTypeIds: string[];
  dailyCapacityKg: string;
  effectiveFrom: string;
  effectiveTo: string;
};

const EMPTY_FORM: CapabilityForm = {
  serviceAreaIds: [],
  wasteTypeIds: [],
  dailyCapacityKg: "",
  effectiveFrom: "",
  effectiveTo: "",
};

function formatCapacity(value: number) {
  return `${value.toLocaleString()} kg`;
}

function TogglePills<T extends { name: string } | { areaId: string; name: string } | { wasteTypeId: string; name: string }>({
  items,
  selectedIds,
  getId,
  onToggle,
  activeClassName,
}: {
  items: T[];
  selectedIds: string[];
  getId: (item: T) => string;
  onToggle: (id: string) => void;
  activeClassName: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => {
        const id = getId(item);
        const isSelected = selectedIds.includes(id);

        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
              isSelected
                ? activeClassName
                : "border-[var(--stroke-soft)] bg-white text-[var(--text-secondary)]"
            }`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

function CreateCapabilityModal({
  serviceAreas,
  wasteTypes,
  existingPairs,
  onClose,
  onCreate,
  isPending,
}: {
  serviceAreas: ServiceArea[];
  wasteTypes: WasteType[];
  existingPairs: Set<string>;
  onClose: () => void;
  onCreate: (payloads: CapabilityBatchPayload[]) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<CapabilityForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const selectedCombinations = useMemo(
    () =>
      form.serviceAreaIds.flatMap((serviceAreaId) =>
        form.wasteTypeIds.map((wasteTypeId) => ({ serviceAreaId, wasteTypeId })),
      ),
    [form.serviceAreaIds, form.wasteTypeIds],
  );

  const toggleArea = (areaId: string) => {
    setForm((current) => ({
      ...current,
      serviceAreaIds: current.serviceAreaIds.includes(areaId)
        ? current.serviceAreaIds.filter((value) => value !== areaId)
        : [...current.serviceAreaIds, areaId],
    }));
  };

  const toggleWasteType = (wasteTypeId: string) => {
    setForm((current) => ({
      ...current,
      wasteTypeIds: current.wasteTypeIds.includes(wasteTypeId)
        ? current.wasteTypeIds.filter((value) => value !== wasteTypeId)
        : [...current.wasteTypeIds, wasteTypeId],
    }));
  };

  const submit = () => {
    const capacityValue = Number(form.dailyCapacityKg);

    if (form.serviceAreaIds.length === 0 || form.wasteTypeIds.length === 0) {
      setError("Vui long chon it nhat mot khu vuc va mot loai rac.");
      return;
    }

    if (!form.dailyCapacityKg.trim() || Number.isNaN(capacityValue) || capacityValue <= 0) {
      setError("Cong suat moi ngay phai lon hon 0.");
      return;
    }

    if (form.effectiveFrom && form.effectiveTo && form.effectiveFrom > form.effectiveTo) {
      setError("Ngay bat dau hieu luc phai nho hon hoac bang ngay ket thuc.");
      return;
    }

    const payloads = selectedCombinations
      .filter(
        ({ serviceAreaId, wasteTypeId }) =>
          !existingPairs.has(`${serviceAreaId}:${wasteTypeId}`),
      )
      .map(({ serviceAreaId, wasteTypeId }) => ({
        serviceAreaId,
        wasteTypeId,
        dailyCapacityKg: capacityValue,
        effectiveFrom: form.effectiveFrom || undefined,
        effectiveTo: form.effectiveTo || undefined,
      }));

    if (payloads.length === 0) {
      setError("Tat ca cap khu vuc va loai rac da ton tai.");
      return;
    }

    setError(null);
    onCreate(payloads);
  };

  return (
    <ModalShell
      title="Dang ky pham vi phuc vu"
      description="Chon nhieu quan huyen va nhieu loai rac. He thong se tao tung cap cau hinh hop le cho doanh nghiep."
      icon={MapPin}
      onClose={onClose}
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Huy
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? "Dang luu..." : "Tao cau hinh"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label">Khu vuc phuc vu</label>
          <TogglePills
            items={serviceAreas}
            selectedIds={form.serviceAreaIds}
            getId={(item) => item.areaId}
            onToggle={toggleArea}
            activeClassName="border-[var(--primary-500)] bg-[var(--primary-100)] text-[var(--primary-700)]"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">Loai rac</label>
          <TogglePills
            items={wasteTypes}
            selectedIds={form.wasteTypeIds}
            getId={(item) => item.wasteTypeId}
            onToggle={toggleWasteType}
            activeClassName="border-[var(--accent-500)] bg-[var(--accent-100)] text-[var(--accent-700)]"
          />
        </div>

        <div>
          <label htmlFor="capability-capacity" className="field-label">
            Cong suat moi ngay (kg)
          </label>
          <Input
            id="capability-capacity"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="vi du 250"
            value={form.dailyCapacityKg}
            onChange={(event) =>
              setForm((current) => ({ ...current, dailyCapacityKg: event.target.value }))
            }
          />
        </div>

        <div>
          <label htmlFor="capability-effective-from" className="field-label">
            Hieu luc tu
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
            Hieu luc den
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

      <div className="mt-4 rounded-[20px] border border-[var(--stroke-soft)] bg-[var(--bg-surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
        Dang chon {form.serviceAreaIds.length} khu vuc, {form.wasteTypeIds.length} loai rac
        va se tao {selectedCombinations.length} cau hinh.
      </div>

      {error ? (
        <div className="mt-4 rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--peach-600)]">
          {error}
        </div>
      ) : null}
    </ModalShell>
  );
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

  const capabilities: Capability[] = capabilitiesResponse?.data ?? [];
  const serviceAreas: ServiceArea[] = (serviceAreasResponse?.data ?? []).filter(
    (area: ServiceArea) => area.isActive !== false,
  );
  const wasteTypes: WasteType[] = (wasteTypesResponse?.data ?? []).filter(
    (wasteType: WasteType) => wasteType.isActive !== false,
  );

  const existingPairs = useMemo(
    () =>
      new Set(
        capabilities.map(
          (capability) => `${capability.serviceAreaId}:${capability.wasteTypeId}`,
        ),
      ),
    [capabilities],
  );

  const createCapability = useMutation({
    mutationFn: async (payloads: CapabilityBatchPayload[]) => {
      const results = await Promise.allSettled(
        payloads.map((payload) => enterpriseCapabilitiesApi.create(payload)),
      );
      const failed = results.filter(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );

      if (failed.length === results.length) {
        throw failed[0].reason;
      }

      return {
        createdCount: results.length - failed.length,
        failedCount: failed.length,
      };
    },
    onSuccess: ({ createdCount, failedCount }) => {
      toast.success(
        failedCount > 0
          ? `Da tao ${createdCount} cau hinh, ${failedCount} cau hinh bi bo qua hoac loi.`
          : `Da tao ${createdCount} cau hinh phuc vu.`,
      );
      queryClient.invalidateQueries({ queryKey: ["enterprise-capabilities"] });
      setShowCreate(false);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Dang ky pham vi phuc vu that bai.";
      toast.error(message);
    },
  });

  const deleteCapability = useMutation({
    mutationFn: (capabilityId: string) => enterpriseCapabilitiesApi.delete(capabilityId),
    onSuccess: () => {
      toast.success("Da xoa pham vi phuc vu.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-capabilities"] });
      setDeleting(null);
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Xoa pham vi phuc vu that bai.";
      toast.error(message);
    },
  });

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
          existingPairs={existingPairs}
          onClose={() => setShowCreate(false)}
          onCreate={(payloads) => createCapability.mutate(payloads)}
          isPending={createCapability.isPending}
        />
      ) : null}

      {deleting ? (
        <ModalShell
          title="Xoa pham vi phuc vu"
          description="Doanh nghiep se ngung nhan khop bao cao moi cho cap khu vuc va loai rac nay."
          icon={Trash2}
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Huy
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteCapability.mutate(deleting.capabilityId)}
                disabled={deleteCapability.isPending}
              >
                {deleteCapability.isPending ? "Dang xoa..." : "Xoa pham vi"}
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
        eyebrow={<span className="shell-chip shell-chip-primary">Khong gian doanh nghiep</span>}
        title="Dang ky pham vi phuc vu"
        description="Khai bao khu vuc va loai rac doanh nghiep co the xu ly de viec tiep nhan bao cao khop voi nang luc van hanh thuc te."
        actions={
          <>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Lam moi
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Them cau hinh
            </Button>
          </>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Muc san sang phuc vu</span>}
        title="Lien ket khu vuc, loai rac va cong suat thuc te trong cung mot noi."
        description="Ban co the chon nhieu quan huyen va nhieu loai rac trong mot lan thao tac. He thong tu tao tung cap cau hinh hop le va bo qua cac cap da ton tai."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Recycle className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Du lieu san sang de cau hinh
                </p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Co {serviceAreas.length} khu vuc va {wasteTypes.length} loai rac dang san sang de dang ky.
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard
          icon={MapPin}
          label="Muc dang ky"
          value={capabilities.length}
          description="Cac cap khu vuc va loai rac da dang ky."
          tone="mint"
          featured
        />
        <StatCard
          icon={PackageCheck}
          label="Khu vuc da phu"
          value={totalCoverageAreas}
          description="So khu vuc duy nhat dang duoc phu boi doanh nghiep nay."
          tone="sky"
        />
        <StatCard
          icon={Recycle}
          label="Cong suat moi ngay"
          value={formatCapacity(totalDailyCapacity)}
          description="Tong cong suat dang khai bao tren moi cau hinh."
          tone="violet"
        />
        <StatCard
          icon={Clock}
          label="Cong suat con lai"
          value={formatCapacity(remainingCapacity)}
          description="Cong suat chua su dung theo muc dung hien tai."
          tone="sand"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Pham vi da dang ky"
          description="Tim theo khu vuc hoac loai rac, sau do xoa nhung muc ma doanh nghiep khong con ho tro."
        />

        <div className="space-y-5 p-5 sm:p-6">
          <div className="shell-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tim theo khu vuc phuc vu hoac loai rac"
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
              title="Chua co pham vi nao duoc dang ky"
              description={
                capabilities.length === 0
                  ? "Hay bat dau bang viec dang ky khu vuc va loai rac dau tien ma doanh nghiep co the xu ly."
                  : "Hay thu tu khoa khac de tim dung muc dang ky ban can."
              }
              action={
                capabilities.length === 0 ? (
                  <Button onClick={() => setShowCreate(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Dang ky muc dau tien
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
                            <span>Da dung {formatCapacity(usedCapacity)}</span>
                            <span>{utilization}% cong suat</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-surface-muted)]">
                            <div
                              className="h-full rounded-full bg-[var(--primary-500)] transition-[width]"
                              style={{ width: `${utilization}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                          <span>Hieu luc tu: {capability.effectiveFrom ?? "Ngay lap tuc"}</span>
                          <span>Hieu luc den: {capability.effectiveTo ?? "Khong gioi han"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 lg:justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleting(capability)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xoa
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
