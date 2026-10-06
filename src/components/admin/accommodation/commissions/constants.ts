import type { CommissionAction, CommissionStatus } from './types';

const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** Formats a kobo (minor-unit) amount as a naira string. */
export function formatNairaMinor(minor: number): string {
  return nairaFormatter.format(minor / 100);
}

/** The agent's cut of the landlord rent, as a percentage. */
export const AGENT_COMMISSION_RATE = 5;

export const COMMISSIONS_ENDPOINT = '/api/admin/accommodation/commission';

export function commissionEndpoint(id: string): string {
  return `/api/admin/accommodation/commission/${id}`;
}

/** Statuses that have reached a final resting state — no further actions. */
const CLOSED_STATUSES: CommissionStatus[] = ['disputed', 'cancelled'];

export function canDispute(status: string): boolean {
  return !CLOSED_STATUSES.includes(status as CommissionStatus);
}

export function availableActions(status: string): CommissionAction[] {
  const actions: CommissionAction[] = [];
  if (status === 'pending_confirmation') actions.push('confirm');
  if (status === 'confirmed') actions.push('record_payment');
  if (canDispute(status)) actions.push('dispute');
  return actions;
}
