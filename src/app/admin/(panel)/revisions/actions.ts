'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireAdmin } from '@/lib/auth/require-admin';
import {
  createRevision,
  setRevisionStatus,
  deleteRevision,
  addComment,
  deleteComment,
  REVISION_STATUSES,
  type RevisionComment,
} from '@/lib/db/admin/revisions';
import type { ActionResult } from '@/lib/types';

const createSchema = z.object({
  requester: z.string().trim().min(1, 'Lütfen adınızı girin.').max(120),
  body: z.string().trim().min(1, 'Lütfen revizyon isteğini yazın.').max(4000),
  urgency: z.coerce
    .number()
    .int('Aciliyet tam sayı olmalı.')
    .min(1, 'Aciliyet en az 1 olmalı.')
    .max(10, 'Aciliyet en fazla 10 olmalı.'),
  status: z.enum(REVISION_STATUSES),
});

const idSchema = z.string().uuid('Geçersiz kayıt.');

/** Creates a new revision request. */
export async function createRevisionAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    requester: formData.get('requester'),
    body: formData.get('body'),
    urgency: formData.get('urgency'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { ok: false, error: 'Lütfen formdaki hataları düzeltin.', fieldErrors };
  }

  try {
    await createRevision(parsed.data);
  } catch {
    return { ok: false, error: 'İstek kaydedilemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/revisions');
  revalidatePath('/admin');
  return { ok: true };
}

/** Updates a revision's status. */
export async function updateRevisionStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = z.object({ id: idSchema, status: z.enum(REVISION_STATUSES) }).safeParse({
    id,
    status,
  });
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz durum değeri.' };
  }

  try {
    await setRevisionStatus(parsed.data.id, parsed.data.status);
  } catch {
    return { ok: false, error: 'Durum güncellenemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/revisions');
  revalidatePath('/admin');
  return { ok: true };
}

/** Deletes a revision request (cascades its comments). */
export async function deleteRevisionAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz kayıt.' };
  }

  try {
    await deleteRevision(parsed.data);
  } catch {
    return { ok: false, error: 'İstek silinemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/revisions');
  revalidatePath('/admin');
  return { ok: true };
}

const commentSchema = z.object({
  revisionId: idSchema,
  author: z.string().trim().min(1, 'Adınızı yazın.').max(120),
  body: z.string().trim().min(1, 'Yorum boş olamaz.').max(2000),
});

/** Adds a comment to a revision. Returns the created comment on success. */
export async function addCommentAction(
  revisionId: string,
  author: string,
  body: string,
): Promise<ActionResult<RevisionComment>> {
  await requireAdmin();

  const parsed = commentSchema.safeParse({ revisionId, author, body });
  if (!parsed.success) {
    return { ok: false, error: 'Yorum eklenemedi. Ad ve yorum gerekli.' };
  }

  try {
    const comment = await addComment(parsed.data.revisionId, parsed.data.author, parsed.data.body);
    revalidatePath('/admin/revisions');
    return { ok: true, data: comment };
  } catch {
    return { ok: false, error: 'Yorum eklenemedi. Lütfen tekrar deneyin.' };
  }
}

/** Deletes a comment. */
export async function deleteCommentAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, error: 'Geçersiz yorum.' };
  }

  try {
    await deleteComment(parsed.data);
  } catch {
    return { ok: false, error: 'Yorum silinemedi. Lütfen tekrar deneyin.' };
  }

  revalidatePath('/admin/revisions');
  return { ok: true };
}
