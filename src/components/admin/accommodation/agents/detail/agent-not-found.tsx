import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function AgentNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/15">
        <Building2 className="size-6 text-primary-600 dark:text-primary-300" aria-hidden />
      </span>
      <h1 className="text-xl tracking-tight text-foreground">Agent not found</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        This agent application may have been removed, or the link is incorrect.
      </p>
      <Link
        href="/admin/accommodation/agents"
        className="mt-1 text-sm font-medium text-primary-600 no-underline hover:underline dark:text-primary-300"
      >
        Back to agent applications
      </Link>
    </div>
  );
}