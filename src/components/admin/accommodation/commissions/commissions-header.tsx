import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface CommissionsHeaderProps {
  pendingCount: number;
  awaitingPaymentCount: number;
}

export function CommissionsHeader({
  pendingCount,
  awaitingPaymentCount,
}: CommissionsHeaderProps) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <Link
        href="/admin/accommodation"
        className="mb-2 flex w-fit items-center gap-1.5 text-xs text-white/70 no-underline transition-colors hover:text-white"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to accommodation
      </Link>

      <h1 className="font-display text-xl tracking-tight text-white">Agent commissions</h1>
      <p className="mt-0.5 text-xs text-primary-200 dark:text-primary-300">
        {pendingCount > 0 && <>{pendingCount} pending · </>}
        {awaitingPaymentCount > 0 && <>{awaitingPaymentCount} awaiting payment · </>}
        Off-platform payments only
      </p>
    </header>
  );
}
