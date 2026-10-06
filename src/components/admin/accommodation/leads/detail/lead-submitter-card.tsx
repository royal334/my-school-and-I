import { Quote } from 'lucide-react';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

/** Attribution card for student-submitted leads, including any internal admin
 *  note captured while triaging the report. */
export function LeadSubmitterCard({ lead }: { lead: LeadDetail }) {
  const { submitter } = lead;

  return (
    <LeadCard>
      <SectionTitle>Submitted by</SectionTitle>

      <p className="mt-1 text-sm font-medium text-foreground">
        {submitter?.full_name || 'Unknown student'}
      </p>

      {submitter?.phone_number && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {submitter.phone_number}
        </p>
      )}

      {lead.submitter_relationship && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Quote className="mt-0.5 size-3 shrink-0 text-primary-400" aria-hidden />
          <span className="italic">{lead.submitter_relationship}</span>
        </p>
      )}

      {lead.admin_notes && (
        <div className="mt-2.5 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-relaxed text-primary-700 dark:bg-primary-500/10 dark:text-primary-100">
          <strong className="font-semibold">Admin note:</strong> {lead.admin_notes}
        </div>
      )}
    </LeadCard>
  );
}