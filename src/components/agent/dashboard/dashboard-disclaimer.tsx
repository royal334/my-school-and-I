import { ShieldCheck } from 'lucide-react';

export function DashboardDisclaimer() {
  return (
    <p className="flex items-start justify-center gap-1.5 px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
      <ShieldCheck className="mt-0.5 size-3 shrink-0" aria-hidden />
      Commission payments are arranged off-platform by Campus&amp;Me. Records here reflect confirmed
      information only.
    </p>
  );
}
