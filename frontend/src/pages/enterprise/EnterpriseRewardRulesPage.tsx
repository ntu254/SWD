import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Gift, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { enterpriseRewardRulesApi, wasteTypesApi } from "../../api";
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

interface RewardRule {
  ruleId: string;
  wasteTypeId: string;
  wasteTypeName: string;
  sortingLevel: string;
  pointsFixed?: number;
  pointsPerKg?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive: boolean;
}

interface WasteType {
  wasteTypeId: string;
  name?: string;
  typeName?: string;
}

interface RuleFormData {
  wasteTypeId: string;
  sortingLevel: string;
  pointsFixed: string;
  pointsPerKg: string;
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

const EMPTY_FORM: RuleFormData = {
  wasteTypeId: "",
  sortingLevel: "GOOD",
  pointsFixed: "",
  pointsPerKg: "",
  effectiveFrom: "",
  effectiveTo: "",
  isActive: true,
};

const SORTING_LEVELS = ["GOOD", "ACCEPTABLE", "POOR"] as const;

function getWasteTypeLabel(wasteType: WasteType) {
  return wasteType.name ?? wasteType.typeName ?? "Unknown";
}

function getSortingVariant(level: string) {
  switch (level) {
    case "GOOD":
      return "collected" as const;
    case "ACCEPTABLE":
      return "pending" as const;
    case "POOR":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

function RuleModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  isPending,
  wasteTypes,
}: {
  title: string;
  form: RuleFormData;
  onChange: (patch: Partial<RuleFormData>) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
  wasteTypes: WasteType[];
}) {
  return (
    <ModalShell
      title={title}
      description="Define the waste type, sorting level and points logic for citizen rewards."
      icon={Gift}
      onClose={onClose}
      widthClassName="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!form.wasteTypeId || !form.sortingLevel || isPending}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isPending ? "Saving..." : "Save rule"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="reward-rule-type" className="field-label">
            Waste type
          </label>
          <select
            id="reward-rule-type"
            value={form.wasteTypeId}
            onChange={(event) => onChange({ wasteTypeId: event.target.value })}
            className="shell-select"
          >
            <option value="">Select waste type</option>
            {wasteTypes.map((wasteType) => (
              <option key={wasteType.wasteTypeId} value={wasteType.wasteTypeId}>
                {getWasteTypeLabel(wasteType)}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">Sorting level</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {SORTING_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ sortingLevel: level })}
                className={`rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
                  form.sortingLevel === level
                    ? "border-[rgba(31,93,78,0.18)] bg-[var(--primary-100)] text-[var(--primary-700)]"
                    : "border-[var(--stroke-soft)] bg-white/84 text-[var(--text-secondary)]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reward-fixed" className="field-label">
            Fixed points
          </label>
          <Input
            id="reward-fixed"
            type="number"
            min="0"
            value={form.pointsFixed}
            onChange={(event) => onChange({ pointsFixed: event.target.value })}
            placeholder="e.g. 50"
          />
        </div>

        <div>
          <label htmlFor="reward-per-kg" className="field-label">
            Points per kg
          </label>
          <Input
            id="reward-per-kg"
            type="number"
            min="0"
            step="0.1"
            value={form.pointsPerKg}
            onChange={(event) => onChange({ pointsPerKg: event.target.value })}
            placeholder="e.g. 10"
          />
        </div>

        <div>
          <label htmlFor="reward-effective-from" className="field-label">
            Effective from
          </label>
          <Input
            id="reward-effective-from"
            type="date"
            value={form.effectiveFrom}
            onChange={(event) => onChange({ effectiveFrom: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="reward-effective-to" className="field-label">
            Effective to
          </label>
          <Input
            id="reward-effective-to"
            type="date"
            value={form.effectiveTo}
            onChange={(event) => onChange({ effectiveTo: event.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">Rule state</label>
          <button
            type="button"
            onClick={() => onChange({ isActive: !form.isActive })}
            className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-sm font-semibold transition-colors ${
              form.isActive
                ? "border-[rgba(31,93,78,0.18)] bg-[var(--primary-100)] text-[var(--primary-700)]"
                : "border-[var(--stroke-soft)] bg-white/84 text-[var(--text-secondary)]"
            }`}
          >
            <span>{form.isActive ? "Active reward rule" : "Inactive reward rule"}</span>
            <span>{form.isActive ? "On" : "Off"}</span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function EnterpriseRewardRulesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRule, setEditRule] = useState<RewardRule | null>(null);
  const [deleteRule, setDeleteRule] = useState<RewardRule | null>(null);
  const [form, setForm] = useState<RuleFormData>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<RuleFormData>(EMPTY_FORM);

  const { data: rulesData, isLoading } = useQuery({
    queryKey: ["enterprise-reward-rules"],
    queryFn: () => enterpriseRewardRulesApi.getAll().then((response) => response.data),
  });

  const { data: wasteTypesData } = useQuery({
    queryKey: ["waste-types"],
    queryFn: () => wasteTypesApi.getAll().then((response) => response.data),
  });

  const createRule = useMutation({
    mutationFn: (data: unknown) => enterpriseRewardRulesApi.create(data),
    onSuccess: () => {
      toast.success("Reward rule created.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-reward-rules"] });
      setCreateOpen(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error("Failed to create reward rule."),
  });

  const updateRule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      enterpriseRewardRulesApi.update(id, data),
    onSuccess: () => {
      toast.success("Reward rule updated.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-reward-rules"] });
      setEditRule(null);
    },
    onError: () => toast.error("Failed to update reward rule."),
  });

  const removeRule = useMutation({
    mutationFn: (id: string) => enterpriseRewardRulesApi.delete(id),
    onSuccess: () => {
      toast.success("Reward rule removed.");
      queryClient.invalidateQueries({ queryKey: ["enterprise-reward-rules"] });
      setDeleteRule(null);
    },
    onError: () => toast.error("Failed to remove reward rule."),
  });

  const rules: RewardRule[] = rulesData?.data ?? [];
  const wasteTypes: WasteType[] = wasteTypesData?.data ?? [];
  const activeCount = rules.filter((rule) => rule.isActive).length;

  const toPayload = (ruleForm: RuleFormData) => ({
    wasteTypeId: ruleForm.wasteTypeId,
    sortingLevel: ruleForm.sortingLevel,
    pointsFixed: ruleForm.pointsFixed ? Number(ruleForm.pointsFixed) : undefined,
    pointsPerKg: ruleForm.pointsPerKg ? Number(ruleForm.pointsPerKg) : undefined,
    effectiveFrom: ruleForm.effectiveFrom || undefined,
    effectiveTo: ruleForm.effectiveTo || undefined,
    isActive: ruleForm.isActive,
  });

  const openEdit = (rule: RewardRule) => {
    setEditRule(rule);
    setEditForm({
      wasteTypeId: rule.wasteTypeId,
      sortingLevel: rule.sortingLevel,
      pointsFixed: rule.pointsFixed?.toString() ?? "",
      pointsPerKg: rule.pointsPerKg?.toString() ?? "",
      effectiveFrom: rule.effectiveFrom?.split("T")[0] ?? "",
      effectiveTo: rule.effectiveTo?.split("T")[0] ?? "",
      isActive: rule.isActive,
    });
  };

  return (
    <div className="space-y-4 lg:space-y-5">
      {createOpen ? (
        <RuleModal
          title="Create reward rule"
          form={form}
          onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
          onClose={() => {
            setCreateOpen(false);
            setForm(EMPTY_FORM);
          }}
          onSubmit={() => createRule.mutate(toPayload(form))}
          isPending={createRule.isPending}
          wasteTypes={wasteTypes}
        />
      ) : null}

      {editRule ? (
        <RuleModal
          title="Edit reward rule"
          form={editForm}
          onChange={(patch) => setEditForm((current) => ({ ...current, ...patch }))}
          onClose={() => setEditRule(null)}
          onSubmit={() =>
            updateRule.mutate({ id: editRule.ruleId, data: toPayload(editForm) })
          }
          isPending={updateRule.isPending}
          wasteTypes={wasteTypes}
        />
      ) : null}

      {deleteRule ? (
        <ModalShell
          title="Remove reward rule"
          description="Citizens will no longer receive points under this rule after deletion."
          icon={ShieldAlert}
          onClose={() => setDeleteRule(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteRule(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeRule.mutate(deleteRule.ruleId)}
                disabled={removeRule.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {removeRule.isPending ? "Removing..." : "Remove rule"}
              </Button>
            </>
          }
        >
          <div className="rounded-[20px] border border-[rgba(217,124,87,0.18)] bg-[var(--peach-100)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
            {deleteRule.wasteTypeName} | {deleteRule.sortingLevel}
          </div>
        </ModalShell>
      ) : null}

      <PageHeader
        eyebrow={<span className="shell-chip shell-chip-primary">Enterprise workspace</span>}
        title="Reward rules"
        description="Configure how citizens earn points based on waste type and sorting quality inside your enterprise program."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New rule
          </Button>
        }
      />

      <PageHero
        eyebrow={<span className="shell-chip shell-chip-accent">Reward policy</span>}
        title="Align waste quality with a clear points model."
        description="Rule creation, edits and removal continue to use the same enterprise reward endpoints. The interface is now standardized with the rest of the product shell."
        tone="mint"
        aside={
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="shell-icon-chip">
                <Gift className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Active rules
                </p>
                <p className="text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                  {activeCount}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Gift}
          label="Total rules"
          value={rules.length}
          description="All reward rules configured for this enterprise."
          tone="mint"
          featured
        />
        <StatCard
          icon={CheckCircle}
          label="Active"
          value={activeCount}
          description="Rules currently used to calculate citizen points."
          tone="sky"
        />
        <StatCard
          icon={Trash2}
          label="Inactive"
          value={rules.length - activeCount}
          description="Rules not currently applied."
          tone="peach"
        />
      </div>

      <SectionCard className="overflow-hidden">
        <SectionHeader
          title="Rule table"
          description="Review rule thresholds, effective periods and activation state from one place."
        />

        <div className="p-5 sm:p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="shimmer h-18 rounded-[20px]" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="No reward rules yet"
              description="Create your first rule to start awarding citizens for sorting quality and waste type."
              action={
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create first rule
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waste type</TableHead>
                  <TableHead>Sorting level</TableHead>
                  <TableHead>Fixed points</TableHead>
                  <TableHead>Points / kg</TableHead>
                  <TableHead>Effective period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.ruleId}>
                    <TableCell>{rule.wasteTypeName}</TableCell>
                    <TableCell>
                      <Badge variant={getSortingVariant(rule.sortingLevel)}>
                        {rule.sortingLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.pointsFixed ?? "-"}</TableCell>
                    <TableCell>{rule.pointsPerKg ?? "-"}</TableCell>
                    <TableCell>
                      {rule.effectiveFrom
                        ? `${rule.effectiveFrom.split("T")[0]} -> ${rule.effectiveTo?.split("T")[0] ?? "Open"}`
                        : "Always"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "collected" : "secondary"}>
                        {rule.isActive ? "ACTIVE" : "INACTIVE"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEdit(rule)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteRule(rule)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Remove
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
