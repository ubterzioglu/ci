import { redirect } from 'next/navigation';

import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getAdminUser } from '@/lib/auth/require-admin';
import { LoginForm } from './LoginForm';

const DENIED_MESSAGES: Record<string, string> = {
  '1': 'Bu hesabın admin paneline erişim yetkisi yok.',
  oauth: 'Google ile giriş tamamlanamadı. Lütfen tekrar deneyin.',
  config: 'Supabase yapılandırılmamış.',
};

/**
 * Admin login. If Supabase is unconfigured, shows a clear notice instead of a
 * dead form. If an admin is already signed in, bounces straight to the panel.
 * A `?denied=` param (set by the OAuth callback or the sign-in action) surfaces
 * a rejection message.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const configured = isSupabaseConfigured();
  const { denied } = await searchParams;
  const deniedMessage = denied ? (DENIED_MESSAGES[denied] ?? DENIED_MESSAGES['1']) : null;

  if (configured) {
    const admin = await getAdminUser();
    if (admin) redirect('/admin');
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-marble px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 12%, color-mix(in srgb, var(--color-terracotta) 12%, transparent), transparent 32%), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--color-olive) 12%, transparent), transparent 30%)',
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="rounded-lg border border-stone bg-marble p-8 shadow-[0_28px_80px_rgba(35,33,28,0.12)] sm:p-10">
          <div className="text-center">
            <div className="font-display text-4xl leading-none text-charcoal">Çi Neo Cucina</div>
            <div className="eyebrow mt-3">Yönetim Paneli</div>
          </div>

          <div className="rule-olive my-7" aria-hidden="true" />

          {deniedMessage && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-wine/30 bg-wine/5 px-4 py-3 font-body text-sm text-wine"
            >
              {deniedMessage}
            </div>
          )}

          {configured ? (
            <LoginForm />
          ) : (
            <p className="text-center font-body text-sm leading-7 text-muted">
              Supabase yapılandırılmamış. Ortam değişkenlerini ekleyin
              (<code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> ve
              <code className="font-mono text-xs"> NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) ve sayfayı
              yenileyin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
