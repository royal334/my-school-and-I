import { MARKUP_RATE, PLATFORM_AGENT_RATE, PLATFORM_FEE_RATE, type CommissionRecord } from './types';
import { formatNaira, formatRatePercent } from './format';
import { cn } from '@/lib/utils';

interface CommissionBreakdownProps {
  record: CommissionRecord;
  accentClass: string;
}

function Row({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-mono text-xs',
          strong ? 'font-semibold' : 'font-normal',
          accent ? accent : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function CommissionBreakdown({ record, accentClass }: CommissionBreakdownProps) {
  const ratePercent = formatRatePercent(record.referrer_rate_bps);

  return (
    <div className="mt-3 flex flex-col gap-2.5 rounded-lg border border-border bg-muted/50 px-3 py-2.5">
      <Row label="Landlord rent" value={formatNaira(record.landlord_rent_minor)} />
      <Row
        label={`+ ${MARKUP_RATE}% markup`}
        value={formatNaira(record.markup_amount_minor)}
      />
      <Row
        label="Student pays total"
        value={formatNaira(record.student_pays_minor)}
        strong
      />

      <div className="h-px bg-border" role="presentation" />

      <Row
        label={`Platform keeps (${PLATFORM_FEE_RATE}%)`}
        value={formatNaira(Math.round(record.landlord_rent_minor * (PLATFORM_FEE_RATE / 100)))}
      />
      <Row
        label={`Your share (${ratePercent}%)`}
        value={formatNaira(record.agent_commission_minor)}
        strong
        accent={accentClass}
      />
      <Row
        label={`Platform agent (${PLATFORM_AGENT_RATE}%)`}
        value={formatNaira(Math.round(record.landlord_rent_minor * (PLATFORM_AGENT_RATE / 100)))}
      />
    </div>
  );
}
