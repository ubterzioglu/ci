import type { RevisionStatus } from '@/lib/db/admin/revision-types';

/**
 * Pure helpers and constants for RevisionsClient. Extracted so the component
 * file stays focused on React state and JSX.
 */

export const STATUS_LABELS: Record<RevisionStatus, string> = {
  open: 'Açık',
  progress: 'Devam Ediyor',
  done: 'Tamamlandı',
};

export const STATUS_TONE: Record<RevisionStatus, 'terracotta' | 'olive' | 'neutral'> = {
  open: 'terracotta',
  progress: 'olive',
  done: 'neutral',
};

/** Maps an urgency score (1–10) to a StatusPill tone. */
export function urgencyTone(u: number): 'wine' | 'terracotta' | 'olive' {
  if (u >= 8) return 'wine';
  if (u >= 4) return 'terracotta';
  return 'olive';
}

export const ACTIVE_FILTERS: { key: 'all' | 'open' | 'progress'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'open', label: STATUS_LABELS.open },
  { key: 'progress', label: STATUS_LABELS.progress },
];
