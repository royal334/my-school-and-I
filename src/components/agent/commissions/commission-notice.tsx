import { Info } from 'lucide-react';

export function CommissionNotice() {
  return (
    <div className="mx-4 mt-3 flex items-start gap-2.5 rounded-xl border border-info/25 bg-info-bg px-3.5 py-3">
      <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
      <p className="text-xs leading-relaxed text-info-text">
        Commission amounts here are calculated records. Actual payments are arranged directly by
        Campus&Me and confirmed by our team after payment is made off-platform.
      </p>
    </div>
  );
}
