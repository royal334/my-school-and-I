import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';
import { AGENT_STATUS_META } from '../status-meta';

interface PendingApprovalCardProps {
  status: string;
}

export function PendingApprovalCard({ status }: PendingApprovalCardProps) {
  const meta = AGENT_STATUS_META[status] ?? AGENT_STATUS_META.pending_review;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
        <h1 className="text-lg tracking-tight text-white">Agent portal</h1>
      </header>

      <div className="px-6 py-12 text-center">
        <span className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-warning-bg">
          <Clock3 className="size-6 text-warning" aria-hidden />
        </span>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Your application is currently{' '}
          <strong className="font-semibold text-foreground">{meta.label}</strong>.
        </p>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
          {meta.description}
        </p>

        <Link
          href="/agent/status"
          className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary/90 dark:hover:bg-primary-500"
        >
          View application
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
