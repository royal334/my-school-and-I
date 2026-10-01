import { MATERIAL_TYPES } from '@/utils/constants/constants';

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)}k`;
  return `${(value / 1_000_000).toFixed(1)}M`;
}

/**
 * Student submissions store the title as `"EEE301 - Electrical Power Systems I"`,
 * so the approve form can be prefilled by splitting on the dash.
 */
export function splitSubmissionTitle(title: string): { code: string; name: string } {
  const match = /^\s*([A-Za-z]{2,4}\s?\d{3})\s*[-–—]\s*(.+)$/.exec(title);
  if (!match) return { code: '', name: title.trim() };
  return { code: match[1].replace(/\s+/g, '').toUpperCase(), name: match[2].trim() };
}

/** Submissions pack the semester into the description string; recover it if present. */
export function extractSemester(description: string | null | undefined): number | null {
  if (!description) return null;
  const lower = description.toLowerCase();
  if (lower.includes('second')) return 2;
  if (lower.includes('first')) return 1;
  const digit = /\bsem(?:ester)?\.?\s*([12])\b/i.exec(description);
  return digit ? Number(digit[1]) : null;
}

const SUBMISSION_CATEGORIES = new Set<string>(MATERIAL_TYPES);

export function extractCategory(category: string | null | undefined): string {
  return category && SUBMISSION_CATEGORIES.has(category) ? category : 'lecture_note';
}
