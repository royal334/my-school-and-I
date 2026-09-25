import { cn } from '@/lib/utils';

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#D6E5DF]/70 py-2 dark:border-white/10">
      <span className="shrink-0 text-xs text-stone-500 dark:text-stone-300">{label}</span>
      <span className="text-right text-[13px] text-primary-600 dark:text-white">{value}</span>
    </div>
  );
}

export function TriDisplay({ label, value }: { label: string; value?: boolean | null }) {
  const text = value === true ? 'Yes' : value === false ? 'No' : "Don't know";
  return (
    <div className="flex items-center justify-between border-b border-[#D6E5DF]/70 py-2 dark:border-white/10">
      <span className="text-xs text-stone-500 dark:text-stone-300">{label}</span>
      <span
        className={cn(
          'text-[13px] font-medium',
          value === true ? 'text-success' : value === false ? 'text-error' : 'text-stone-500',
        )}
      >
        {text}
      </span>
    </div>
  );
}