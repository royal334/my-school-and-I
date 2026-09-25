import { cn } from '@/lib/utils';

export function VerificationCheckItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all duration-150',
        checked ? 'border-success/25 bg-success/5' : 'border-[#C8E8DA] bg-white dark:border-white/10 dark:bg-card',
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-150',
          checked ? 'border-success bg-success' : 'border-[#C8E8DA] bg-white dark:border-white/15',
        )}
      >
        {checked && <span className="text-xs text-white">✓</span>}
      </span>
      <span
        className={cn(
          'text-[13px]',
          checked ? 'font-medium text-success' : 'text-[#1A3C34] dark:text-white',
        )}
      >
        {label}
      </span>
    </button>
  );
}