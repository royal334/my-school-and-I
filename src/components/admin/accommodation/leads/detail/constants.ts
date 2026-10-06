import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  House,
  PhoneCall,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import type { LeadAction } from '@/components/admin/accommodation/types';

export type LeadActionTone = 'info' | 'success' | 'neutral' | 'error';

export interface LeadActionConfig {
  label: string;
  icon: LucideIcon;
  tone: LeadActionTone;
  cta: string;
  title: string;
  description: string;
  confirmLabel: string;
}

export const INPUT_CLASS =
  'w-full rounded-lg border border-primary-100 bg-white px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary-500 dark:border-white/10 dark:bg-primary-500/5 dark:text-white';

export const TEXTAREA_CLASS = `${INPUT_CLASS} resize-y`;

export const PRIMARY_BTN_CLASS =
  'min-h-10 flex-1 cursor-pointer rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-primary-600 dark:hover:bg-primary-500';

export const SECONDARY_BTN_CLASS =
  'min-h-10 cursor-pointer rounded-lg bg-primary-50 px-4 py-2.5 text-[13px] font-medium text-primary-700 transition-colors hover:bg-primary-100 disabled:opacity-60 dark:bg-white/10 dark:text-white dark:hover:bg-white/15';

/** Card-style trigger used for each action in the collapsed list. */
export const ACTION_TRIGGER_CLASS: Record<LeadActionTone, string> = {
  info: 'bg-info-bg text-info-text hover:bg-info-bg/70 dark:bg-info-bg dark:text-info-text',
  success:
    'bg-success-bg text-success-text hover:bg-success-bg/70 dark:bg-success-bg dark:text-success-text',
  neutral:
    'bg-muted text-muted-foreground hover:bg-muted/70 dark:bg-muted dark:text-muted-foreground',
  error: 'bg-error-bg text-error hover:bg-error-bg/70 dark:bg-error-bg dark:text-error',
};

export const DANGER_BTN_CLASS =
  'min-h-10 cursor-pointer rounded-lg bg-error-bg px-4 py-2.5 text-[13px] font-medium text-error transition-colors hover:bg-error-bg/70 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-error-bg dark:text-error';

/** Which actions staff may take from each status. `correction` is additionally
 *  gated on the submission coming from an agent. */
export const LEAD_ACTIONS: Record<LeadAction, LeadActionConfig> = {
  reviewing: {
    label: 'Mark as reviewing',
    icon: PhoneCall,
    tone: 'info',
    cta: 'Mark as reviewing',
    title: 'Mark as reviewing?',
    description: 'The submission moves to review while you contact the owner.',
    confirmLabel: 'Mark as reviewing',
  },
  correction: {
    label: 'Request correction from agent',
    icon: ClipboardList,
    tone: 'info',
    cta: 'Send to agent',
    title: 'Request a correction?',
    description:
      'The agent is notified and can update their submission to address your feedback.',
    confirmLabel: 'Send to agent',
  },
  create_property: {
    label: 'Create property + unit',
    icon: House,
    tone: 'success',
    cta: 'Review and confirm listing',
    title: 'Create and list this property?',
    description:
      'This creates the property, verifies the unit and publishes it on Campus&Me.',
    confirmLabel: 'Create listing',
  },
  duplicate: {
    label: 'Mark as duplicate',
    icon: RefreshCw,
    tone: 'neutral',
    cta: 'Mark duplicate',
    title: 'Mark as duplicate?',
    description: 'The submission is flagged as a duplicate and cannot be listed.',
    confirmLabel: 'Mark duplicate',
  },
  rejected: {
    label: 'Reject submission',
    icon: XCircle,
    tone: 'error',
    cta: 'Reject submission',
    title: 'Reject this submission?',
    description: 'The submission is rejected and no further actions become available.',
    confirmLabel: 'Reject submission',
  },
};

export const AVAILABLE_ACTIONS: Record<string, LeadAction[]> = {
  pending: ['reviewing', 'correction', 'duplicate', 'rejected'],
  reviewing: ['create_property', 'correction', 'duplicate', 'rejected'],
  correction_required: ['reviewing', 'create_property', 'correction', 'duplicate', 'rejected'],
};