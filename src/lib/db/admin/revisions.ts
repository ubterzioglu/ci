import 'server-only';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  isRevisionStatus,
  type RevisionRequest,
  type RevisionComment,
  type RevisionStatus,
  type CreateRevisionInput,
} from './revision-types';

/**
 * Admin data layer for internal revision requests + their threaded comments.
 * RLS (migration 002) restricts all access to is_admin(); callers must run
 * requireAdmin() first. Functions throw on failure so actions can surface it.
 *
 * Status constants + types live in ./revision-types (no `server-only`) so
 * client components can share them; re-exported here for convenience.
 */

export {
  REVISION_STATUSES,
  type RevisionRequest,
  type RevisionComment,
  type RevisionStatus,
  type CreateRevisionInput,
} from './revision-types';

/* --- Revision requests ----------------------------------------------------- */

export async function listRevisions(): Promise<RevisionRequest[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('revision_requests')
    .select('id, requester, body, urgency, status, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    requester: row.requester,
    body: row.body,
    urgency: row.urgency,
    status: isRevisionStatus(row.status) ? row.status : 'open',
    createdAt: row.created_at,
  }));
}

export async function createRevision(input: CreateRevisionInput): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { error } = await supabase.from('revision_requests').insert({
    requester: input.requester,
    body: input.body,
    urgency: input.urgency,
    status: input.status,
  });
  if (error) throw new Error(error.message);
}

export async function setRevisionStatus(id: string, status: RevisionStatus): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { error } = await supabase.from('revision_requests').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteRevision(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { error } = await supabase.from('revision_requests').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/* --- Revision comments ----------------------------------------------------- */

/** Fetches all comments for the given revision IDs, oldest first. */
export async function listComments(revisionIds: string[]): Promise<RevisionComment[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase || revisionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('revision_comments')
    .select('id, revision_id, author, body, created_at')
    .in('revision_id', revisionIds)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    revisionId: row.revision_id,
    author: row.author,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function addComment(
  revisionId: string,
  author: string,
  body: string,
): Promise<RevisionComment> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { data, error } = await supabase
    .from('revision_comments')
    .insert({ revision_id: revisionId, author, body })
    .select('id, revision_id, author, body, created_at')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Yorum eklenemedi.');

  return {
    id: data.id,
    revisionId: data.revision_id,
    author: data.author,
    body: data.body,
    createdAt: data.created_at,
  };
}

export async function deleteComment(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const { error } = await supabase.from('revision_comments').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
