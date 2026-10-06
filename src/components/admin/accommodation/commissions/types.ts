import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, Ban, CheckCircle2, Clock3, Receipt } from 'lucide-react';

export interface AdminCommissionUnit {
  id: string;
  unit_number: string | null;
  room_type: string;
  property: { name: string; area: string } | null;
}

export interface AdminCommissionAgent {
  id: string;
  display_name: string;
  phone_number: string;
}

/** A row from the admin commissions feed. */
export interface AdminCommission {
  id: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
  payment_recorded_at: string | null;
  landlord_rent_minor: number;
  agent_commission_minor: number;
  payment_reference: string | null;
  agent: AdminCommissionAgent | null;
  unit: AdminCommissionUnit | null;
}

export type CommissionStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'payment_recorded'
  | 'disputed'
  | 'cancelled';

/** Actions accepted by PATCH /api/admin/accommodation/commission/[id]. */
export type CommissionAction = 'confirm' | 'record_payment' | 'dispute';

export interface CommissionStatusMeta {
  label: string;
  icon: LucideIcon;
  /** Status pill and the commission figure. */
  color: string;
  /** Tinted bar behind the status pill and the figure. */
  bg: string;
  /** Thin border matching the tinted surface. */
  border: string;
}

export const COMMISSION_STATUS_META: Record<string, CommissionStatusMeta> = {
  pending_confirmation: {
    label: 'Pending',
    icon: Clock3,
    color: 'text-warning-text',
    bg: 'bg-warning-bg',
    border: 'border-warning/25',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'text-info-text',
    bg: 'bg-info-bg',
    border: 'border-info/25',
  },
  payment_recorded: {
    label: 'Payment recorded',
    icon: Receipt,
    color: 'text-success-text',
    bg: 'bg-success-bg',
    border: 'border-success/25',
  },
  disputed: {
    label: 'Disputed',
    icon: AlertTriangle,
    color: 'text-error-text',
    bg: 'bg-error-bg',
    border: 'border-error/25',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    border: 'border-border',
  },
};

const FALLBACK_STATUS_META = COMMISSION_STATUS_META.pending_confirmation;

export function getCommissionStatusMeta(status: string): CommissionStatusMeta {
  return COMMISSION_STATUS_META[status] ?? FALLBACK_STATUS_META;
}

export const COMMISSION_FILTERS = [
  { key: '', label: 'All' },
  { key: 'pending_confirmation', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'payment_recorded', label: 'Paid' },
  { key: 'disputed', label: 'Disputed' },
] as const;

export type CommissionFilterKey = (typeof COMMISSION_FILTERS)[number]['key'];

export function isCommissionFilterKey(value: string): value is CommissionFilterKey {
  return COMMISSION_FILTERS.some(f => f.key === value);
}

export function getCommissionFilterLabel(key: string): string {
  return COMMISSION_FILTERS.find(f => f.key === key)?.label.toLowerCase() ?? '';
}
