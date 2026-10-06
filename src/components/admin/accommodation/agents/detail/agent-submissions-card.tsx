import { formatDistanceToNow } from 'date-fns';
import { Building2 } from 'lucide-react';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { StatusBadge } from '@/components/admin/accommodation/status-badge';
import type { AgentSubmission } from '@/components/agent/types';

export function AgentSubmissionsCard({ submissions }: { submissions: AgentSubmission[] }) {
  if (submissions.length === 0) return null;

  return (
    <Card>
      <SectionTitle>Recent submissions</SectionTitle>
      <ul className="flex flex-col">
        {submissions.map(submission => (
          <li
            key={submission.id}
            className="flex items-start justify-between gap-3 border-b border-border/70 py-2.5 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-foreground">
                {submission.property_name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Building2 className="size-3 shrink-0" aria-hidden />
                {submission.area} · {submission.room_type} ·{' '}
                {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
              </p>
            </div>
            <StatusBadge status={submission.status} className="shrink-0" />
          </li>
        ))}
      </ul>
    </Card>
  );
}