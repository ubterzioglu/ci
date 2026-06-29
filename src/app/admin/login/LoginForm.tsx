'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/admin/Toast';
import type { ActionResult } from '@/lib/types';
import { signInAction, requestPasswordResetAction } from '@/app/admin/actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const GoogleMark = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.99 8.99 0 0 0 9 0 9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"
    />
  </svg>
);

/**
 * Login form. On a successful sign-in the server action has already written the
 * session cookie, so we refresh + push to /admin to enter the panel.
 */
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    (_prev, formData) => signInAction(_prev, formData),
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success('Giriş başarılı. Panel yükleniyor…');
      router.replace('/admin');
      router.refresh();
    }
  }, [state, router, toast]);

  const fieldError = (name: string): string | undefined =>
    state && !state.ok ? state.fieldErrors?.[name]?.[0] : undefined;

  const handleGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      toast.error('Supabase yapılandırılmamış.');
      return;
    }
    setGoogleBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
    if (error) {
      setGoogleBusy(false);
      toast.error('Google ile giriş başlatılamadı. Lütfen tekrar deneyin.');
    }
    // On success the browser is redirected to Google; no further work here.
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      toast.error("Önce e-posta adresinizi yazın, sonra 'Şifremi unuttum'a basın.");
      return;
    }
    setResetBusy(true);
    const result = await requestPasswordResetAction(email);
    setResetBusy(false);
    if (result.ok) {
      toast.success('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form action={formAction} className="space-y-5">
      <Input
        id="email"
        name="email"
        type="email"
        label="E-posta"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldError('email')}
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Şifre"
        autoComplete="current-password"
        required
        error={fieldError('password')}
      />

      {state && !state.ok && !state.fieldErrors && (
        <div className="rounded-md border border-wine/30 bg-wine/5 px-4 py-3 font-body text-sm text-wine">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-olive px-5 py-3 font-body font-medium text-ivory transition-colors hover:bg-olive-deep disabled:opacity-50"
      >
        {pending ? 'Giriş yapılıyor…' : 'Panele Gir'}
      </button>

      <button
        type="button"
        onClick={handleForgot}
        disabled={resetBusy}
        className="block w-full text-center font-body text-sm font-medium text-muted underline-offset-2 transition-colors hover:text-terracotta hover:underline disabled:opacity-50"
      >
        {resetBusy ? 'Gönderiliyor…' : 'Şifremi unuttum'}
      </button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-stone" />
        <span className="font-body text-xs uppercase tracking-[0.18em] text-muted">veya</span>
        <span className="h-px flex-1 bg-stone" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleBusy}
        className="inline-flex w-full items-center justify-center gap-2.5 rounded-md border border-stone bg-marble px-5 py-3 font-body font-medium text-charcoal transition-colors hover:bg-cream-deep disabled:opacity-50"
      >
        <GoogleMark />
        {googleBusy ? 'Yönlendiriliyor…' : 'Google ile Gir'}
      </button>
    </form>
  );
}
