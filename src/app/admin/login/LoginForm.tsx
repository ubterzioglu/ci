'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/admin/Toast';
import { cn } from '@/lib/utils';
import type { ActionResult } from '@/lib/types';
import { signInAction } from '@/app/admin/actions';

/**
 * Password-only admin login. On success the server action set the session
 * cookie, so we refresh + push to /admin. Includes a show/hide password toggle.
 */
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [show, setShow] = useState(false);

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

  const passwordError = state && !state.ok ? state.fieldErrors?.password?.[0] : undefined;

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-body text-sm font-medium text-charcoal">
          Admin Şifresi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            required
            autoFocus
            aria-invalid={passwordError ? true : undefined}
            aria-describedby={passwordError ? 'password-error' : undefined}
            className={cn(
              'w-full rounded-md border border-stone bg-marble px-4 py-3 pr-12 font-body text-charcoal placeholder:text-muted transition-colors focus:border-olive focus:outline-none',
              passwordError && 'border-wine',
            )}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition-colors hover:text-olive"
          >
            {show ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 3l14 14M8.5 8.6a2 2 0 002.8 2.8M6.1 6.2C4.3 7.2 2.9 8.7 2 10c1.6 2.7 4.6 5 8 5 1.3 0 2.6-.3 3.7-.9M11 5.1A6.7 6.7 0 0110 5c3.4 0 6.4 2.3 8 5-.5.9-1.2 1.7-2 2.4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M2 10c1.6-2.7 4.6-5 8-5s6.4 2.3 8 5c-1.6 2.7-4.6 5-8 5s-6.4-2.3-8-5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            )}
          </button>
        </div>
        {passwordError && (
          <p id="password-error" className="font-body text-sm text-wine">
            {passwordError}
          </p>
        )}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div className="rounded-md border border-wine/30 bg-wine/5 px-4 py-3 font-body text-sm text-wine">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-md bg-olive px-5 py-3.5 font-body font-medium text-ivory shadow-[0_14px_28px_rgba(90,98,64,0.22)] transition-colors hover:bg-olive-deep disabled:opacity-50"
      >
        {pending ? 'Giriş yapılıyor…' : 'Panele Gir'}
      </button>
    </form>
  );
}
