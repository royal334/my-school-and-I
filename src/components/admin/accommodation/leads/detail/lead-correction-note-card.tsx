import { MessageSquareQuote } from 'lucide-react';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { LeadCard } from './lead-card';

/** Shown after a correction has been requested so staff can see exactly what
 *  the agent was told while the submission sits with them. */
export function LeadCorrectionNoteCard({ note }: { note: string }) {
  return (
    <LeadCard className="border-info/25 bg-info-bg dark:bg-info-bg">
      <SectionTitle>Correction note sent to agent</SectionTitle>
      <p className="mt-1.5 flex items-start gap-2 text-[13px] leading-relaxed text-foreground">
        <MessageSquareQuote className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
        {note}
      </p>
    </LeadCard>
  );
}