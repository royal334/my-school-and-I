import { BookCheck, BookX, Clock, Download, EyeOff, Library } from 'lucide-react';
import {
  LEVELS,
  MATERIAL_TYPES,
  MATERIAL_TYPE_LABELS,
  SEMESTERS,
  SEMESTER_NAMES,
} from '@/utils/constants/constants';
import type {
  AdminMaterialsTab,
  StatCardConfig,
} from './types';

export const ADMIN_MATERIALS_TABS: AdminMaterialsTab[] = [
  'overview',
  'submissions',
  'library',
  'upload',
];

export const ADMIN_MATERIALS_TAB_LABELS: Record<AdminMaterialsTab, string> = {
  overview: 'Overview',
  submissions: 'Submissions',
  library: 'Library',
  upload: 'Upload',
};

/** `''` means "all statuses". */
export const SUBMISSION_STATUS_FILTERS = ['pending', 'approved', 'rejected', ''] as const;

export const LIBRARY_STATUS_FILTERS = ['published', 'unpublished', ''] as const;

export interface StatusTone {
  label: string;
  /** Badge / strip foreground + background. Semantic tokens, so light + dark both work. */
  tone: string;
}

export const SUBMISSION_STATUS_TONES: Record<string, StatusTone> = {
  pending: { label: 'Pending review', tone: 'bg-warning-bg text-warning-text' },
  approved: { label: 'Approved', tone: 'bg-success-bg text-success-text' },
  rejected: { label: 'Rejected', tone: 'bg-error-bg text-error-text' },
};

export const MATERIAL_VISIBILITY_TONES: Record<string, StatusTone> = {
  published: { label: 'Published', tone: 'bg-success-bg text-success-text' },
  unpublished: { label: 'Unpublished', tone: 'bg-muted text-muted-foreground' },
};

export function getSubmissionStatusTone(status: string): StatusTone {
  return SUBMISSION_STATUS_TONES[status] ?? {
    label: status,
    tone: 'bg-muted text-muted-foreground',
  };
}

export function getMaterialVisibilityTone(isApproved: boolean): StatusTone {
  return isApproved ? MATERIAL_VISIBILITY_TONES.published : MATERIAL_VISIBILITY_TONES.unpublished;
}

export function getFilterLabel(value: string): string {
  return value || 'All';
}

export function isAdminMaterialsTab(value: unknown): value is AdminMaterialsTab {
  return typeof value === 'string' && (ADMIN_MATERIALS_TABS as string[]).includes(value);
}

export function getMaterialTypeLabel(type: string | null | undefined): string {
  if (!type) return 'Unknown type';
  return MATERIAL_TYPE_LABELS[type] ?? type;
}

export const MATERIAL_TYPE_OPTIONS = MATERIAL_TYPES.map((value) => ({
  value,
  label: MATERIAL_TYPE_LABELS[value],
}));

export const LEVEL_OPTIONS = LEVELS.map((value) => ({
  value: String(value),
  label: `${value}`,
}));

export const SEMESTER_OPTIONS = SEMESTERS.map((value) => ({
  value: String(value),
  label: SEMESTER_NAMES[value],
}));

export const OVERVIEW_STATS: StatCardConfig[] = [
  {
    key: 'pending_submissions',
    label: 'Awaiting review',
    icon: Clock,
    className: 'text-warning-text',
    tab: 'submissions',
    filter: 'pending',
  },
  {
    key: 'published_materials',
    label: 'Published materials',
    icon: Library,
    className: 'text-primary-600 dark:text-primary-300',
    tab: 'library',
    filter: 'published',
  },
  {
    key: 'unpublished_materials',
    label: 'Unpublished',
    icon: EyeOff,
    className: 'text-muted-foreground',
    tab: 'library',
    filter: 'unpublished',
  },
  {
    key: 'total_downloads',
    label: 'Total downloads',
    icon: Download,
    className: 'text-success-text',
    tab: 'library',
  },
];

export const REVIEWED_STATS: StatCardConfig[] = [
  {
    key: 'approved_submissions',
    label: 'Submissions approved',
    icon: BookCheck,
    className: 'text-success-text',
    tab: 'submissions',
    filter: 'approved',
  },
  {
    key: 'rejected_submissions',
    label: 'Submissions rejected',
    icon: BookX,
    className: 'text-error-text',
    tab: 'submissions',
    filter: 'rejected',
  },
];
