import { format } from 'date-fns';
import type { Unit } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { InfoRow } from '@/components/admin/accommodation/info-row';
import { formatPrice } from '@/components/admin/accommodation/utils';

export function UnitDetailsCard({ unit }: { unit: Unit }) {
  return (
    <Card>
      <SectionTitle>Unit details</SectionTitle>
      <InfoRow label="Room type" value={unit.room_type} />
      <InfoRow label="Unit number" value={unit.unit_number} />
      <InfoRow label="Price" value={unit.price ? formatPrice(unit.price) + '/yr' : null} />
      <InfoRow label="Additional charges" value={unit.additional_charges ? formatPrice(unit.additional_charges) : null} />
      <InfoRow label="Additional charges note" value={unit.additional_charges_note} />
      <InfoRow label="Available from" value={unit.available_from ? format(new Date(unit.available_from), 'MMMM yyyy') : null} />
      <InfoRow label="Toilet/Bathroom" value={unit.toilet_bathroom} />
      {unit.facilities_notes && (
        <p className="mt-2.5 text-xs leading-relaxed text-stone-500 dark:text-stone-300">{unit.facilities_notes}</p>
      )}
    </Card>
  );
}