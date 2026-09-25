import { DetailHeader } from '@/components/admin/accommodation/detail-header';
import { StatusBadge } from '@/components/admin/accommodation/status-badge';
import type { Unit } from './types';

export function UnitHeader({ unit, onBack }: { unit: Unit; onBack: () => void }) {
  return (
    <DetailHeader
      title={unit.property.name + (unit.unit_number ? ` · ${unit.unit_number}` : '')}
      subtitle={`${unit.property.area} · ${unit.room_type}`}
      badge={<StatusBadge status={unit.availability_status} onDark />}
      onBack={onBack}
    />
  );
}