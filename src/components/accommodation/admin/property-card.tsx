import type { Unit } from './types';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { InfoRow } from '@/components/admin/accommodation/info-row';

export function PropertyCard({ unit }: { unit: Unit }) {
  return (
    <Card>
      <SectionTitle>Property</SectionTitle>
      <InfoRow label="Name" value={unit.property.name} />
      <InfoRow label="Area" value={unit.property.area} />
      <InfoRow label="Street" value={unit.property.street} />
      <InfoRow label="Landmark" value={unit.property.landmark} />
      <InfoRow label="Landlord" value={unit.property.landlord_name} />
      <InfoRow label="Landlord phone" value={unit.property.landlord_phone} />
      <InfoRow label="Caretaker" value={unit.property.caretaker_name} />
      <InfoRow label="Caretaker phone" value={unit.property.caretaker_phone} />
    </Card>
  );
}