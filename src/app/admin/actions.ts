'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { friendlyAuthError } from '@/lib/auth/auth-errors';
import type { ActionResult } from '@/lib/types';

const signInSchema = z.object({
  email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
  password: z.string().min(1, 'Lütfen şifrenizi girin.'),
});

/**
 * Admin sign-in. Validates input, signs in via Supabase Auth (which writes the
 * session cookie through the SSR client), then verifies the user is an
 * allow-listed admin via the is_admin() RLS function. A non-admin is signed
 * back out immediately so a valid-but-unauthorised account can never hold a
 * session against /admin.
 */
export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { ok: false, error: 'Lütfen formdaki hataları düzeltin.', fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase yapılandırılmamış. Lütfen yöneticinizle iletişime geçin.',
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) };
  }

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: 'Bu hesabın admin paneline erişim yetkisi yok.' };
  }

  return { ok: true };
}

/**
 * Sends a password-reset email. Only allowed for addresses; Supabase silently
 * no-ops for unknown emails, so we never leak whether an account exists.
 */
export async function requestPasswordResetAction(email: string): Promise<ActionResult> {
  const parsed = z.string().trim().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false, error: 'Önce geçerli bir e-posta adresi yazın.' };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase yapılandırılmamış.' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: siteUrl ? `${siteUrl}/admin` : undefined,
  });

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) };
  }

  return { ok: true };
}

/** Signs the admin out and returns to the login page. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
