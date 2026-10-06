const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** Formats a kobo (minor-unit) amount as a naira string. */
export function formatNaira(minor: number): string {
  return nairaFormatter.format(minor / 100);
}

/** Basis points to a readable percentage, e.g. 500 -> "5". */
export function formatRatePercent(bps: number): string {
  return String(bps / 100);
}

export function totalForStatus(
  records: Array<{ status: string; agent_commission_minor: number }>,
  statuses: string[],
): number {
  return records
    .filter((r) => statuses.includes(r.status))
    .reduce((sum, r) => sum + r.agent_commission_minor, 0);
}

export function countForStatus(
  records: Array<{ status: string }>,
  status: string,
): number {
  return records.filter((r) => r.status === status).length;
}
