'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  ADMIN_COOKIE,
  createSessionToken,
  isAdminAuthConfigured,
  verifyPassword,
} from '@/lib/auth/admin-session';
import type { ActionResult } from '@/lib/types';

const signInSchema = z.object({
  password: z.string().min(1, 'Lütfen şifreyi girin.'),
});

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Admin sign-in via the single shared password. On success, sets a signed
 * httpOnly session cookie (the cookie holds an HMAC, never the password).
 */
export async function signInAction(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      error: 'Admin girişi yapılandırılmamış. Lütfen yöneticinizle iletişime geçin.',
    };
  }

  const parsed = signInSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { ok: false, error: 'Lütfen şifreyi girin.', fieldErrors };
  }

  if (!verifyPassword(parsed.data.password)) {
    return { ok: false, error: 'Şifre hatalı.' };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return { ok: true };
}

/** Signs the admin out by clearing the session cookie. */
export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect('/admin/login');
}
