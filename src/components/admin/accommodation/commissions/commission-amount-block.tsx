import { cn } from '@/lib/utils';
import { AGENT_COMMISSION_RATE, formatNairaMinor } from './constants';
import type { AdminCommission } from './types';

interface CommissionAmountBlockProps {
  commission: AdminCommission;
  colorClass: string;
}

export function CommissionAmountBlock({
  commission,
  colorClass,
}: CommissionAmountBlockProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">
        Agent commission ({AGENT_COMMISSION_RATE}%)
      </p>
      <p className={cn('font-mono text-xl font-bold leading-tight', colorClass)}>
        {formatNairaMinor(commission.agent_commission_minor)}
      </p>
      <p className="text-[11px] text-muted-foreground">
        of {formatNairaMinor(commission.landlord_rent_minor)} rent
      </p>
    </div>
  );
}
