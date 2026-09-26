export function FacilityChip({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <span className="rounded bg-primary-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-primary-700 dark:bg-primary-950/50 dark:text-primary-300">
      {label}
    </span>
  );
}