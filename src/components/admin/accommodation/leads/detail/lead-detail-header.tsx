import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from '@/components/admin/accommodation/status-badge';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadBackButton } from './lead-back-button';
import { LeadSourceBadge } from './lead-source-badge';

export function LeadDetailHeader({ lead }: { lead: LeadDetail }) {
  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-4 dark:from-primary-900 dark:to-primary-800">
      <div className="flex items-center gap-3">
        <LeadBackButton />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg leading-snug font-semibold tracking-tight text-white">
              {lead.property_name}
            </h1>
            <LeadSourceBadge sourceType={lead.source_type} onDark />
          </div>
          <p className="mt-0.5 text-xs text-primary-200">
            {lead.area} · Submitted{' '}
            {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
          </p>
        </div>

        <StatusBadge status={lead.status} onDark />
      </div>
    </header>
  );
}