'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { LeadActionPanel } from './lead-action-panel';
import { DetailHeader } from './detail-header';
import { StatusBadge } from './status-badge';
import { Card } from './card';
import { SectionTitle } from './section-title';
import { InfoRow, TriDisplay } from './info-row';
import { MediaGallery } from './media-gallery';
import { formatPrice } from './utils';
import type { LeadDetail } from './types';

export function LeadDetailView({ lead: initialLead }: { lead: LeadDetail }) {
  const router = useRouter();
  const [lead, setLead] = useState<LeadDetail>(initialLead);

  const media = lead.media || [];

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <DetailHeader
        title={lead.property_name}
        subtitle={`${lead.area} · Submitted ${formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}`}
        badge={<StatusBadge status={lead.status} onDark />}
        onBack={() => router.back()}
      />

      <div className="flex flex-col gap-3 p-4">
        <LeadActionPanel lead={lead} onUpdate={setLead} />

        <Card>
          <SectionTitle>Submitted by</SectionTitle>
          <p className="mt-1 text-sm text-primary-600 dark:text-white">
            {lead.submitter?.full_name || 'Unknown student'} {lead.submitter?.phone_number && `· ${lead.submitter.phone_number}`}
          </p>
          {lead.submitter_relationship && (
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-300">
              &quot;{lead.submitter_relationship}&quot;
            </p>
          )}
          {lead.admin_notes && (
            <div className="mt-2.5 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-relaxed text-primary-600 dark:bg-white/10 dark:text-white">
              <strong>Admin note:</strong> {lead.admin_notes}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle>Property details</SectionTitle>
          <InfoRow label="Property name" value={lead.property_name} />
          <InfoRow label="Area" value={lead.area} />
          <InfoRow label="Street" value={lead.street} />
          <InfoRow label="Landmark" value={lead.landmark} />
          <InfoRow label="Unit number" value={lead.unit_number} />
          <InfoRow label="Room type" value={lead.room_type} />
          <InfoRow
            label="Expected rent"
            value={lead.expected_price ? formatPrice(lead.expected_price) + '/yr' : null}
          />
          <InfoRow
            label="Available from"
            value={lead.available_from ? format(new Date(lead.available_from), 'MMMM yyyy') : null}
          />
          <InfoRow label="Additional charges" value={lead.additional_charges_note} />
        </Card>

        {(lead.landlord_name || lead.landlord_phone) && (
          <Card>
            <SectionTitle>Owner / caretaker</SectionTitle>
            <InfoRow label="Name" value={lead.landlord_name} />
            <InfoRow label="Phone" value={lead.landlord_phone} />
          </Card>
        )}

        <Card>
          <SectionTitle>Facilities (as reported)</SectionTitle>
          <TriDisplay label="Water" value={lead.has_water} />
          <TriDisplay label="Electricity" value={lead.has_electricity} />
          <TriDisplay label="Security" value={lead.has_security} />
          {lead.facilities_notes && (
            <p className="mt-2.5 text-[13px] leading-relaxed text-stone-500 dark:text-stone-300">
              {lead.facilities_notes}
            </p>
          )}
          {lead.other_notes && (
            <p className="mt-2 text-[13px] leading-relaxed text-stone-500 dark:text-stone-300">
              <strong>Other notes:</strong> {lead.other_notes}
            </p>
          )}
        </Card>

        <MediaGallery media={media} />

        {(lead.matched_property || lead.matched_unit) && (
          <Card className="border-success/20 bg-success/5">
            <SectionTitle>Linked property</SectionTitle>
            {lead.matched_property && (
              <p className="mt-1 text-sm font-medium text-primary-600 dark:text-white">
                {lead.matched_property.name} · {lead.matched_property.area}
              </p>
            )}
            {lead.matched_unit && (
              <p className="mt-0.5 text-[13px] text-stone-500 dark:text-stone-300">
                {lead.matched_unit.unit_number || lead.matched_unit.room_type}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}