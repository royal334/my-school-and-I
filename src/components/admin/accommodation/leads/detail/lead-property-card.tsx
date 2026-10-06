import { format } from 'date-fns';
import { InfoRow } from '@/components/admin/accommodation/info-row';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { formatPrice } from '@/components/admin/accommodation/utils';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadCard } from './lead-card';

export function LeadPropertyCard({ lead }: { lead: LeadDetail }) {
  return (
    <LeadCard>
      <SectionTitle>Property details</SectionTitle>
      <InfoRow label="Property name" value={lead.property_name} />
      <InfoRow label="Area" value={lead.area} />
      <InfoRow label="Street" value={lead.street} />
      <InfoRow label="Landmark" value={lead.landmark} />
      <InfoRow label="Unit number" value={lead.unit_number} />
      <InfoRow label="Room type" value={lead.room_type} />
      <InfoRow
        label="Expected rent"
        value={lead.expected_price ? `${formatPrice(lead.expected_price)}/yr` : null}
      />
      <InfoRow
        label="Available from"
        value={lead.available_from ? format(new Date(lead.available_from), 'MMMM yyyy') : null}
      />
      <InfoRow label="Additional charges" value={lead.additional_charges_note} />
    </LeadCard>
  );
}