export function FacilityChip({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <span className="rounded bg-[#E8F5EF] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[#4A8C73] dark:bg-[#1E211F] dark:text-[#7EC8A0]">
      {label}
    </span>
  );
}