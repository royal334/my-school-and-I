import { TriDisplay } from '@/components/admin/accommodation/info-row';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

export function LeadFacilitiesCard({ lead }: { lead: LeadDetail }) {
  return (
    <LeadCard>
      <SectionTitle>Facilities (as reported)</SectionTitle>
      <TriDisplay label="Water" value={lead.has_water} />
      <TriDisplay label="Electricity" value={lead.has_electricity} />
      <TriDisplay label="Security" value={lead.has_security} />

      {lead.facilities_notes && (
        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground">
          {lead.facilities_notes}
        </p>
      )}

      {lead.other_notes && (
        <div className="mt-2.5 border-t border-primary-100 pt-2.5 dark:border-primary-500/25">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Other notes
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {lead.other_notes}
          </p>
        </div>
      )}
    </LeadCard>
  );
}