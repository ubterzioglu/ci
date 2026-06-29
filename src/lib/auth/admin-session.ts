import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Password-based admin auth core.
 *
 * The admin panel is gated by a single shared password (ADMIN_PASSWORD). On a
 * correct password we issue a signed session token stored in an httpOnly
 * cookie; every admin page/action verifies that cookie. No Supabase Auth, no
 * per-user accounts — one password, server-checked.
 *
 * Security notes:
 *   * ADMIN_PASSWORD / ADMIN_SESSION_SECRET are server-only (no NEXT_PUBLIC_).
 *   * The cookie holds an HMAC signature, NOT the password, so it never leaks.
 *   * Comparisons are timing-safe.
 */

export const ADMIN_COOKIE = 'ci_admin';

interface AdminEnv {
  password: string;
  secret: string;
}

/** Reads the admin auth env, or null if not configured. */
export function getAdminEnv(): AdminEnv | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return null;
  return { password, secret };
}

export function isAdminAuthConfigured(): boolean {
  return getAdminEnv() !== null;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** True when the supplied password matches ADMIN_PASSWORD (timing-safe). */
export function verifyPassword(input: string): boolean {
  const env = getAdminEnv();
  if (!env) return false;
  return safeEqual(input, env.password);
}

/**
 * The session token. It is a deterministic HMAC of a fixed payload keyed by the
 * secret + password, so rotating either invalidates all existing sessions. The
 * token carries no secret material itself.
 */
export function createSessionToken(): string {
  const env = getAdminEnv();
  if (!env) throw new Error('Admin auth not configured.');
  return createHmac('sha256', env.secret).update(`admin:${env.password}`).digest('hex');
}

/** Verifies a session cookie value against the expected token (timing-safe). */
export function verifySessionToken(token: string | undefined | null): boolean {
  const env = getAdminEnv();
  if (!env || !token) return false;
  const expected = createHmac('sha256', env.secret).update(`admin:${env.password}`).digest('hex');
  return safeEqual(token, expected);
}
