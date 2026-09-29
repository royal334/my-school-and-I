import { cn } from '@/lib/utils';

interface InfoRowProps {
  label: string;
  value?: string | number | null;
  tone?: string;
}

export function InfoRow({ label, value, tone }: InfoRowProps) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 py-2 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className={cn('text-right text-[13px] text-foreground', tone)}>{value}</span>
    </div>
  );
}
