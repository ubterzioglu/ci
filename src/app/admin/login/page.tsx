import Image from 'next/image';
import { redirect } from 'next/navigation';

import { isAdminAuthConfigured } from '@/lib/auth/admin-session';
import { isAdmin } from '@/lib/auth/require-admin';
import { LoginForm } from './LoginForm';

/**
 * Admin login (password-only). Premium two-panel layout: an immersive image
 * panel on the left (collapses on mobile) and the sign-in form on the right.
 * Redirects to the panel if already signed in; shows a clear notice when admin
 * auth is unconfigured.
 */
export default async function AdminLoginPage() {
  const configured = isAdminAuthConfigured();

  if (configured && (await isAdmin())) {
    redirect('/admin');
  }

  return (
    <main className="grid min-h-screen bg-marble lg:grid-cols-[1.05fr_minmax(440px,0.95fr)]">
      {/* Left: immersive brand visual (hidden on small screens) */}
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/imported/home-hero-table.jpg"
          alt="Çi Neo Cucina"
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 0px"
          className="object-cover"
        />
        {/* Editorial dark wash for legible overlaid type */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(35,33,28,0.30) 0%, rgba(35,33,28,0.18) 38%, rgba(35,33,28,0.78) 100%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16">
          <div className="font-display text-3xl leading-none text-ivory drop-shadow-sm">
            Çi Neo Cucina
          </div>
          <div className="max-w-md">
            <div className="rule-olive mb-6 justify-start" aria-hidden="true" />
            <p className="font-display text-3xl leading-snug text-ivory drop-shadow-sm xl:text-4xl">
              Doğal malzemeler, zamansız bir mutfak dili.
            </p>
            <p className="mt-4 font-body text-sm leading-7 text-ivory/80">
              Kaş · Antalya — Yönetim Paneli
            </p>
          </div>
        </div>
      </aside>

      {/* Right: sign-in form */}
      <div className="relative flex items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 12%, color-mix(in srgb, var(--color-terracotta) 12%, transparent), transparent 32%), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--color-olive) 12%, transparent), transparent 30%)',
          }}
        />
        <div className="relative w-full max-w-sm">
          <div className="mb-2 lg:hidden">
            <div className="text-center font-display text-3xl leading-none text-charcoal">
              Çi Neo Cucina
            </div>
          </div>

          <div className="eyebrow text-center lg:text-left">Yönetim Paneli</div>
          <h1 className="mt-2 text-center font-display text-3xl text-charcoal lg:text-left">
            Tekrar hoş geldiniz
          </h1>
          <p className="mt-2 text-center font-body text-sm leading-6 text-muted lg:text-left">
            Devam etmek için admin şifrenizi girin.
          </p>

          <div className="mt-8">
            {configured ? (
              <LoginForm />
            ) : (
              <div className="rounded-lg border border-stone bg-cream-deep/40 p-5">
                <p className="font-body text-sm leading-7 text-muted">
                  Admin girişi yapılandırılmamış. Ortam değişkenlerini ekleyin
                  (<code className="font-mono text-xs">ADMIN_PASSWORD</code> ve
                  <code className="font-mono text-xs"> ADMIN_SESSION_SECRET</code>) ve sayfayı
                  yenileyin.
                </p>
              </div>
            )}
          </div>

          <p className="mt-10 text-center font-body text-xs text-muted lg:text-left">
            © {new Date().getFullYear()} Çi Neo Cucina
          </p>
        </div>
      </div>
    </main>
  );
}
