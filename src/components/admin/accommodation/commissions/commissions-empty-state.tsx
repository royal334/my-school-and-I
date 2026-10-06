import { Wallet } from 'lucide-react';

export function CommissionsEmptyState({ filterLabel }: { filterLabel: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Wallet className="size-5 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>
      <p className="text-[13px] text-muted-foreground">
        No {filterLabel ? `${filterLabel} ` : ''}commission records.
      </p>
      <p className="max-w-xs text-xs text-muted-foreground/80">
        Records appear here once a student rents a property submitted by an approved agent.
      </p>
    </div>
  );
}
