import { Phone, User } from 'lucide-react';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

/** Rendered only when the lead reported an owner or caretaker. */
export function LeadOwnerCard({ lead }: { lead: LeadDetail }) {
  if (!lead.landlord_name && !lead.landlord_phone) return null;

  return (
    <LeadCard>
      <SectionTitle>Owner / caretaker</SectionTitle>
      {lead.landlord_name && (
        <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <User className="size-3.5 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden />
          {lead.landlord_name}
        </p>
      )}
      {lead.landlord_phone && (
        <p className="mb-1 flex items-center gap-1.5 text-[13px] text-foreground">
          <Phone className="size-3.5 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden />
          <a
            href={`tel:${lead.landlord_phone}`}
            className="rounded transition-colors hover:text-primary-600 hover:underline dark:hover:text-primary-300"
          >
            {lead.landlord_phone}
          </a>
        </p>
      )}
    </LeadCard>
  );
}