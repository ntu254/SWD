const ESTIMATED_WEIGHT_PATTERN = /^\[EST_WEIGHT_KG:([0-9]+(?:\.[0-9]+)?)\]\s*/i;

export function buildReportDescription(
  description?: string,
  estimatedWeightKg?: number | null
) {
  const cleanDescription = description?.trim() ?? "";
  const hasWeight =
    typeof estimatedWeightKg === "number" &&
    Number.isFinite(estimatedWeightKg) &&
    estimatedWeightKg > 0;

  if (!hasWeight) {
    return cleanDescription;
  }

  const normalizedWeight = Number(estimatedWeightKg.toFixed(1));
  const metadata = `[EST_WEIGHT_KG:${normalizedWeight}]`;

  return cleanDescription ? `${metadata} ${cleanDescription}` : metadata;
}

export function parseReportDescription(rawDescription?: string | null) {
  const normalized = rawDescription?.trim() ?? "";
  if (!normalized) {
    return {
      cleanDescription: "",
      estimatedWeightKg: null as number | null,
    };
  }

  const match = normalized.match(ESTIMATED_WEIGHT_PATTERN);
  if (!match) {
    return {
      cleanDescription: normalized,
      estimatedWeightKg: null as number | null,
    };
  }

  const parsedWeight = Number(match[1]);

  return {
    cleanDescription: normalized.replace(ESTIMATED_WEIGHT_PATTERN, "").trim(),
    estimatedWeightKg:
      Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : null,
  };
}

export function withReportMetadata<T extends { description?: string | null }>(report: T) {
  const parsed = parseReportDescription(report.description);

  return {
    ...report,
    description: parsed.cleanDescription || null,
    estimatedWeightKg: parsed.estimatedWeightKg,
  };
}

export function withReportMetadataList<T extends { description?: string | null }>(reports: T[]) {
  return reports.map(withReportMetadata);
}
