import type { AgentProfile } from '../types';

/** Totals returned by GET /api/agent/commissions. */
export interface DashboardCommissionSummary {
  total_pending: number;
  total_confirmed: number;
  total_paid: number;
}

export type DashboardAgent = Pick<
  AgentProfile,
  | 'id'
  | 'display_name'
  | 'status'
  | 'total_properties_submitted'
  | 'total_properties_approved'
  | 'total_transactions'
>;

export interface QuickAction {
  label: string;
  href: string;
  icon: 'submit' | 'properties' | 'commissions' | 'profile';
  primary?: boolean;
}
