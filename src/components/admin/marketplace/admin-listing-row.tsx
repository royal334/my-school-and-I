'use client';

import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { formatPrice } from '@/components/marketplace/format';
import { getCategoryEmoji } from '@/components/marketplace/constants';
import { Badge } from '@/components/ui/badge';
import { adminListingPath, getListingStatusTone } from './constants';
import type { AdminListingSummary } from './types';

interface AdminListingRowProps {
  listing: AdminListingSummary;
  onRemove: (id: string) => void;
}

export function AdminListingRow({ listing, onRemove }: AdminListingRowProps) {
  const statusTone = getListingStatusTone(listing.status);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
        {getCategoryEmoji(listing.category)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <Badge className={statusTone.tone}>{statusTone.label}</Badge>
          {listing.is_boosted && (
            <Badge className="bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300">
              🔥 Boosted
            </Badge>
          )}
        </div>
        <p className="truncate text-[13px] font-medium text-foreground">{listing.title}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {formatPrice(listing.price)} · {listing.seller_name} · {listing.category}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={adminListingPath(listing.id)}
          className="rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground no-underline transition-colors hover:border-primary-300 hover:text-primary-600 dark:hover:text-primary-300"
        >
          View
        </Link>
        {listing.status === 'active' && (
          <button
            type="button"
            onClick={() => onRemove(listing.id)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-error/25 bg-error-bg px-2.5 py-1.5 text-xs font-medium text-error-text transition-colors hover:border-error/40"
          >
            <EyeOff className="size-3.5" />
            <span className="sr-only sm:not-sr-only">Remove</span>
          </button>
        )}
        <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
          <Eye className="size-3.5" />
          {listing.views}
        </span>
      </div>
    </div>
  );
}
