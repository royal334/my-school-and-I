import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiabilityNotice({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning-bg p-3 dark:border-warning/30 dark:bg-warning/10',
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
      <p className="text-xs leading-relaxed text-warning-text">
        Always verify the product or service before you pay. Campus&amp;Me is a listing platform
        only — we do not handle payments or delivery and are not responsible for the quality,
        safety, or legitimacy of any product, service, or transaction. Trade at your own risk.
      </p>
    </div>
  );
}
