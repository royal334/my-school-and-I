import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubpageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: ReactNode;
}

/** Primary header bar shared by the my-listings, saved, sell, and boost pages. */
export function SubpageHeader({ title, subtitle, backHref, action }: SubpageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-primary p-4 dark:bg-primary-900">
      <div className="flex min-w-0 items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10">
            <Link href="/dashboard/marketplace" aria-label="Go back">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
        
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/70">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}