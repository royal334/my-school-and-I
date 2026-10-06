export interface CommissionUnit {
  id: string;
  unit_number: string | null;
  room_type: string;
  property: { name: string; area: string } | null;
}

/** A row from GET /api/agent/commissions. */
export interface CommissionRecord {
  id: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  payment_recorded_at: string | null;
  landlord_rent_minor: number;
  markup_amount_minor: number;
  student_pays_minor: number;
  referrer_rate_bps: number;
  agent_commission_minor: number;
  payment_reference: string | null;
  payment_notes: string | null;
  unit: CommissionUnit | null;
}

export interface CommissionSummary {
  total_pending: number;
  total_confirmed: number;
  total_paid: number;
}

export type CommissionStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'payment_recorded'
  | 'disputed'
  | 'cancelled';

export interface CommissionStatusMeta {
  label: string;
  /** Text + accent classes for the status bar and the commission figure. */
  color: string;
  /** Tinted surface for the status bar and the amount block. */
  bg: string;
  /** Thin border matching the tinted surface. */
  border: string;
  description: string;
}

export const COMMISSION_STATUS_META: Record<string, CommissionStatusMeta> = {
  pending_confirmation: {
    label: 'Pending confirmation',
    color: 'text-warning-text',
    bg: 'bg-warning-bg',
    border: 'border-warning/25',
    description:
      'A transaction has been recorded. Campus&Me is confirming the details before your share is finalised.',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-info-text',
    bg: 'bg-info-bg',
    border: 'border-info/25',
    description:
      'Commission confirmed. Payment will be arranged off-platform by Campus&Me.',
  },
  payment_recorded: {
    label: 'Payment recorded',
    color: 'text-success-text',
    bg: 'bg-success-bg',
    border: 'border-success/25',
    description:
      'Campus&Me has recorded that payment was made. This is a platform record, not a live bank confirmation.',
  },
  disputed: {
    label: 'Disputed',
    color: 'text-error-text',
    bg: 'bg-error-bg',
    border: 'border-error/25',
    description: 'This commission is under review. Contact Campus&Me support for details.',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
    description: 'This commission was cancelled — the transaction may have been reversed.',
  },
};

const FALLBACK_STATUS_META = COMMISSION_STATUS_META.pending_confirmation;

export function getCommissionStatusMeta(status: string): CommissionStatusMeta {
  return COMMISSION_STATUS_META[status] ?? FALLBACK_STATUS_META;
}

export const COMMISSION_FILTERS: Array<{ key: string; label: string }> = [
  { key: '', label: 'All' },
  { key: 'pending_confirmation', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'payment_recorded', label: 'Paid' },
  { key: 'disputed', label: 'Disputed' },
];

/** The platform's own take of the landlord rent, shown in the breakdown. */
export const PLATFORM_FEE_RATE = 10;

/** Campus&Me's in-house agent take, shown in the breakdown. */
export const PLATFORM_AGENT_RATE = 5;

/** Markup added on top of the landlord rent before the student pays. */
export const MARKUP_RATE = 20;
