import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  Lock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type AgentActionKey =
  | 'approved'
  | 'more_information_required'
  | 'rejected'
  | 'suspended'
  | 'deactivated';

export interface AgentAction {
  key: AgentActionKey;
  label: string;
  icon: LucideIcon;
  tone: 'success' | 'info' | 'error' | 'neutral';
}

/** Actions offered for each agent status, in display order. */
export const AGENT_ACTIONS: Record<string, AgentAction[]> = {
  pending_review: [
    {
      key: 'approved',
      label: 'Approve application',
      icon: BadgeCheck,
      tone: 'success',
    },
    {
      key: 'more_information_required',
      label: 'Request more information',
      icon: ClipboardList,
      tone: 'info',
    },
    { key: 'rejected', label: 'Reject application', icon: XCircle, tone: 'error' },
  ],
  more_information_required: [
    { key: 'approved', label: 'Approve application', icon: BadgeCheck, tone: 'success' },
    { key: 'rejected', label: 'Reject application', icon: XCircle, tone: 'error' },
  ],
  approved: [
    { key: 'suspended', label: 'Suspend agent', icon: AlertTriangle, tone: 'error' },
    { key: 'deactivated', label: 'Deactivate agent', icon: Lock, tone: 'neutral' },
  ],
  suspended: [
    { key: 'approved', label: 'Reinstate agent', icon: BadgeCheck, tone: 'success' },
    { key: 'deactivated', label: 'Deactivate agent', icon: Lock, tone: 'neutral' },
  ],
  rejected: [{ key: 'approved', label: 'Reinstate agent', icon: BadgeCheck, tone: 'success' }],
  deactivated: [],
};

export const EVENT_LABELS: Record<string, string> = {
  application_submitted: 'Application submitted',
  status_changed: 'Status changed',
  property_submitted: 'Property submitted',
  property_approved: 'Property approved',
  property_rejected: 'Property rejected',
  correction_requested: 'Correction requested',
  transaction_confirmed: 'Transaction confirmed',
  commission_created: 'Commission created',
  commission_adjusted: 'Commission adjusted',
  payment_recorded: 'Payment recorded',
  agent_suspended: 'Agent suspended',
};