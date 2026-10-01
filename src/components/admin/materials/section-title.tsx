export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
      {children}
    </p>
  );
}
