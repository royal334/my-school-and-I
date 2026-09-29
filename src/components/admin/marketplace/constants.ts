import type { AdminMarketplaceTab } from './types';

export const ADMIN_MARKETPLACE_PATH = '/admin/marketplace';

export function adminListingPath(id: string): string {
  return `${ADMIN_MARKETPLACE_PATH}/listings/${id}`;
}

export const ADMIN_MARKETPLACE_TABS: AdminMarketplaceTab[] = ['overview', 'reports', 'listings'];

export const ADMIN_MARKETPLACE_TAB_LABELS: Record<AdminMarketplaceTab, string> = {
  overview: 'Overview',
  reports: 'Reports',
  listings: 'Listings',
};

/** `''` means "all statuses". */
export const REPORT_STATUS_FILTERS = ['pending', 'reviewed', 'actioned', 'dismissed', ''] as const;

export const LISTING_STATUS_FILTERS = ['active', 'sold', 'archived', 'removed', ''] as const;

/** Compact reason labels — the full wording lives in `REPORT_REASONS`. */
export const REPORT_REASON_LABELS: Record<string, string> = {
  scam: '⚠️ Scam',
  fake_product: '❌ Fake product',
  prohibited: '🚫 Prohibited',
  misleading: '📝 Misleading',
  inappropriate: '🔞 Inappropriate',
  other: '📌 Other',
};

export function getReportReasonLabel(reason: string): string {
  return REPORT_REASON_LABELS[reason] || reason;
}

interface StatusTone {
  label: string;
  /** Badge / bar foreground + background. */
  tone: string;
}

/** Tones are semantic tokens, so they resolve correctly in light and dark. */
export const REPORT_STATUS_TONES: Record<string, StatusTone> = {
  pending: { label: 'Pending', tone: 'bg-warning-bg text-warning-text' },
  reviewed: { label: 'Reviewed', tone: 'bg-info-bg text-info-text' },
  actioned: { label: 'Actioned', tone: 'bg-success-bg text-success-text' },
  dismissed: { label: 'Dismissed', tone: 'bg-muted text-muted-foreground' },
};

export const LISTING_STATUS_TONES: Record<string, StatusTone> = {
  active: { label: 'Active', tone: 'bg-success-bg text-success-text' },
  sold: { label: 'Sold', tone: 'bg-info-bg text-info-text' },
  archived: { label: 'Archived', tone: 'bg-muted text-muted-foreground' },
  removed: { label: 'Removed', tone: 'bg-error-bg text-error-text' },
  expired: { label: 'Expired', tone: 'bg-warning-bg text-warning-text' },
};

export function getReportStatusTone(status: string): StatusTone {
  return REPORT_STATUS_TONES[status] ?? REPORT_STATUS_TONES.pending;
}

export function getListingStatusTone(status: string): StatusTone {
  return LISTING_STATUS_TONES[status] ?? { label: status, tone: 'bg-muted text-muted-foreground' };
}

export function getFilterLabel(value: string): string {
  return value || 'All';
}
