import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  Clock3,
  Lock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type AgentStatusTone = 'warning' | 'success' | 'info' | 'error' | 'neutral';

export type AgentStatusCta = { label: string } & ({ href: string } | { mailto: string });

export interface AgentStatusMeta {
  label: string;
  tone: AgentStatusTone;
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: AgentStatusCta;
}

export const AGENT_STATUS_META: Record<string, AgentStatusMeta> = {
  pending_review: {
    label: 'Pending',
    tone: 'warning',
    icon: Clock3,
    title: 'Application under review',
    description:
      'Our team is reviewing your application. This usually takes 1–3 business days. We will notify you once a decision has been made.',
  },
  approved: {
    label: 'Approved',
    tone: 'success',
    icon: BadgeCheck,
    title: 'Application approved!',
    description:
      'Welcome to Campus&Me as an approved accommodation agent. You can now start submitting properties for review.',
    cta: { label: 'Go to agent dashboard', href: '/agent' },
  },
  more_information_required: {
    label: 'More info',
    tone: 'info',
    icon: ClipboardList,
    title: 'More information needed',
    description:
      'Our team needs additional information before we can approve your application. Please review the feedback below and resubmit.',
    // The apply endpoint rejects duplicate applications, so there is no self-serve
// update flow yet — agents respond to a request for information by email.
    cta: { label: 'Contact support to update', mailto: 'support@campusandme.com' },
  },
  rejected: {
    label: 'Rejected',
    tone: 'error',
    icon: XCircle,
    title: 'Application not approved',
    description:
      'Unfortunately we were unable to approve your application at this time. Please review the feedback below.',
  },
  suspended: {
    label: 'Suspended',
    tone: 'error',
    icon: AlertTriangle,
    title: 'Account suspended',
    description:
      'Your agent account has been suspended. Please contact Campus&Me support for more information.',
  },
  deactivated: {
    label: 'Deactivated',
    tone: 'neutral',
    icon: Lock,
    title: 'Account deactivated',
    description:
      'Your agent account has been deactivated. Please contact Campus&Me support if you believe this is an error.',
  },
};

const FALLBACK: AgentStatusMeta = AGENT_STATUS_META.pending_review;

export function getAgentStatusMeta(status: string): AgentStatusMeta {
  return AGENT_STATUS_META[status] ?? FALLBACK;
}

interface ToneClasses {
  card: string;
  badge: string;
  icon: string;
  solid: string;
}

/** Surfaces are always semantic, so both themes are handled by the tokens. */
export const TONE_CLASSES: Record<AgentStatusTone, ToneClasses> = {
  warning: {
    card: 'border-warning/25 bg-warning-bg',
    badge: 'bg-warning-bg text-warning-text',
    icon: 'bg-warning/15 text-warning',
    solid: 'bg-warning text-white hover:bg-warning/90 dark:bg-[#C2410C]',
  },
  success: {
    card: 'border-success/25 bg-success-bg',
    badge: 'bg-success-bg text-success-text',
    icon: 'bg-success/15 text-success',
    solid: 'bg-success text-white hover:bg-success/90 dark:bg-[#15803D]',
  },
  info: {
    card: 'border-info/25 bg-info-bg',
    badge: 'bg-info-bg text-info-text',
    icon: 'bg-info/15 text-info',
    solid: 'bg-info text-white hover:bg-info/90 dark:bg-[#1D4ED8]',
  },
  error: {
    card: 'border-error/25 bg-error-bg',
    badge: 'bg-error-bg text-error-text',
    icon: 'bg-error/15 text-error',
    solid: 'bg-error text-white hover:bg-error/90 dark:bg-[#B91C1C]',
  },
  neutral: {
    card: 'border-border bg-muted',
    badge: 'bg-muted text-muted-foreground',
    icon: 'bg-muted-foreground/15 text-muted-foreground',
    solid: 'bg-stone-600 text-white hover:bg-stone-600/90 dark:bg-stone-600',
  },
};