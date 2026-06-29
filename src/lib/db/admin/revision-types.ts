/**
 * Shared revision status constants + types. Kept free of `server-only` so both
 * server repositories/actions and client components can import them. The actual
 * data-access functions live in revisions.ts (server-only).
 */

export const REVISION_STATUSES = ['open', 'progress', 'done'] as const;
export type RevisionStatus = (typeof REVISION_STATUSES)[number];

export interface RevisionRequest {
  id: string;
  requester: string;
  body: string;
  urgency: number;
  status: RevisionStatus;
  createdAt: string;
}

export interface RevisionComment {
  id: string;
  revisionId: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface CreateRevisionInput {
  requester: string;
  body: string;
  urgency: number;
  status: RevisionStatus;
}

export function isRevisionStatus(value: string): value is RevisionStatus {
  return (REVISION_STATUSES as readonly string[]).includes(value);
}
