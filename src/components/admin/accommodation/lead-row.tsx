import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './status-badge';
import type { Lead } from './types';

export function LeadRow({ lead, submitterPrefix = '' }: { lead: Lead; submitterPrefix?: string }) {
  return (
    <Link href={`/admin/accommodation/leads/${lead.id}`} className="block no-underline">
      <div className="flex items-center justify-between gap-2.5 rounded-[10px] border border-[#D6E5DF] bg-white p-3 dark:border-white/10 dark:bg-card">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-sm font-medium text-primary-600 dark:text-white">
            {lead.property_name}
          </p>
          <p className="truncate text-xs text-stone-500 dark:text-stone-300">
            {lead.area} · {lead.room_type}
            {lead.submitter && ` · ${submitterPrefix}${lead.submitter.full_name}`}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge status={lead.status} />
          <p className="text-[10px] text-stone-500 dark:text-stone-400">
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  );
}