'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { ViewingActionPanel } from './viewing-action-panel';
import { DetailHeader } from './detail-header';
import { StatusBadge } from './status-badge';
import { Card } from './card';
import { SectionTitle } from './section-title';
import { InfoRow } from './info-row';
import { formatPrice } from './utils';
import type { ViewingDetail } from './types';

export function ViewingDetailView({ viewing: initialViewing }: { viewing: ViewingDetail }) {
  const router = useRouter();
  const [viewing, setViewing] = useState<ViewingDetail>(initialViewing);

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <DetailHeader
        title="Viewing request"
        subtitle={`${viewing.unit.property.name} · ${formatDistanceToNow(new Date(viewing.created_at), { addSuffix: true })}`}
        badge={<StatusBadge status={viewing.status} onDark />}
        onBack={() => router.back()}
      />

      <div className="flex flex-col gap-3 p-4">
        <ViewingActionPanel viewing={viewing} onUpdate={setViewing} />

        <Card>
          <SectionTitle>Student</SectionTitle>
          <InfoRow label="Name" value={viewing.student_name} />
          <InfoRow label="Phone" value={viewing.student_phone} />
          <InfoRow
            label="Preferred date"
            value={viewing.preferred_date ? format(new Date(viewing.preferred_date), 'MMMM d, yyyy') : null}
          />
          <InfoRow label="Preferred time" value={viewing.preferred_time} />
          {viewing.message && (
            <p className="mt-2.5 text-[13px] leading-relaxed text-stone-500 dark:text-stone-300">
              &quot;{viewing.message}&quot;
            </p>
          )}
        </Card>

        <Card>
          <SectionTitle>Property</SectionTitle>
          <InfoRow label="Lodge" value={viewing.unit.property.name} />
          <InfoRow label="Area" value={viewing.unit.property.area} />
          <InfoRow label="Unit" value={viewing.unit.unit_number || viewing.unit.room_type} />
          <InfoRow label="Price" value={viewing.unit.price ? formatPrice(viewing.unit.price) + '/yr' : null} />
          <InfoRow label="Landlord phone" value={viewing.unit.property.landlord_phone} />
          <InfoRow label="Caretaker phone" value={viewing.unit.property.caretaker_phone} />
          {viewing.scheduled_date && (
            <InfoRow
              label="Scheduled"
              value={format(new Date(viewing.scheduled_date), 'MMMM d, yyyy — h:mm a')}
            />
          )}
          {viewing.admin_notes && (
            <div className="mt-2.5 rounded-lg bg-primary-50 px-3 py-2 text-xs leading-relaxed text-primary-600 dark:bg-white/10 dark:text-white">
              {viewing.admin_notes}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}