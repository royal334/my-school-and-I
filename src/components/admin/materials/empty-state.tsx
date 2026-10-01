import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#D6E5DF] px-6 py-12 text-center dark:border-white/10">
      <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Icon className="size-5 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>
      <p className="mt-2.5 text-[13px] font-medium text-stone-600 dark:text-stone-200">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          {description}
        </p>
      )}
    </div>
  );
}
