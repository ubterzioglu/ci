'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/admin/Toast';
import type { ActionResult } from '@/lib/types';
import { signInAction } from '@/app/admin/actions';

/**
 * Password-only admin login. On success the server action set the session
 * cookie, so we refresh + push to /admin.
 */
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();

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
      <Input
        id="password"
        name="password"
        type="password"
        label="Admin Şifresi"
        autoComplete="current-password"
        required
        autoFocus
        error={passwordError}
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
    </form>
  );
}
