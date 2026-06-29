import { redirect } from 'next/navigation';

import { isAdminAuthConfigured } from '@/lib/auth/admin-session';
import { isAdmin } from '@/lib/auth/require-admin';
import { LoginForm } from './LoginForm';

/**
 * Admin login (password-only). If admin auth is unconfigured, shows a clear
 * notice. If already signed in, bounces straight to the panel.
 */
export default async function AdminLoginPage() {
  const configured = isAdminAuthConfigured();

  if (configured && (await isAdmin())) {
    redirect('/admin');
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

          {configured ? (
            <LoginForm />
          ) : (
            <p className="text-center font-body text-sm leading-7 text-muted">
              Admin girişi yapılandırılmamış. Ortam değişkenlerini ekleyin
              (<code className="font-mono text-xs">ADMIN_PASSWORD</code> ve
              <code className="font-mono text-xs"> ADMIN_SESSION_SECRET</code>) ve sayfayı
              yenileyin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
