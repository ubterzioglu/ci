/**
 * Turns Supabase Auth error messages (English, technical) into friendly Turkish
 * copy for the admin login form. Shared between the server actions and any
 * client-side fallbacks so the wording stays consistent.
 */
export function friendlyAuthError(message: string | null | undefined): string {
  const m = (message ?? '').toLowerCase();

  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'E-posta veya şifre hatalı.';
  }
  if (m.includes('email not confirmed')) {
    return 'E-posta adresi henüz doğrulanmamış.';
  }
  if (m.includes('rate limit') || m.includes('too many requests')) {
    return 'Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.';
  }
  if (m.includes('network') || m.includes('fetch')) {
    return 'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
  }
  if (!m) {
    return 'Giriş yapılamadı. Lütfen tekrar deneyin.';
  }
  return 'Giriş yapılamadı. Lütfen tekrar deneyin.';
}
