import type { ReactNode } from 'react';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-500 dark:text-primary-300">
      {children}
    </p>
  );
}