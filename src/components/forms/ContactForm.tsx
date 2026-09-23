'use client';

import { useActionState } from 'react';
import { submitContact } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { ActionResult } from '@/lib/types';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

export function ContactForm({ locale = defaultLocale }: { locale?: Locale }) {
  const dictionary = getDictionary(locale);
  const copy = dictionary.forms.contact;
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    submitContact,
    null,
  );

  if (state?.ok) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-olive/10 rounded-md px-6 py-8 text-center"
      >
        <h2 className="font-display text-olive mb-2 text-2xl">{copy.successTitle}</h2>
        <p className="font-body text-charcoal">{copy.successBody}</p>
      </div>
    );
  }

  const fieldErrors = state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      {/* Top-level error alert */}
      {state && !state.ok && (
        <div
          role="alert"
          aria-live="assertive"
          className="border-wine bg-wine/10 font-body text-wine rounded-md border px-4 py-3 text-sm"
        >
          {state.error}
        </div>
      )}

      {/* Honeypot — must stay empty */}
      <input
        type="text"
        name="company"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
      />
      <input type="hidden" name="locale" value={locale} />

      <Input
        id="contact-name"
        name="name"
        label={copy.fullName}
        required
        autoComplete="name"
        error={fieldErrors['name']?.[0]}
      />

      <Input
        id="contact-email"
        name="email"
        type="email"
        label={dictionary.common.email}
        autoComplete="email"
        error={fieldErrors['email']?.[0]}
      />

      <Input
        id="contact-phone"
        name="phone"
        type="tel"
        label={dictionary.common.phone}
        autoComplete="tel"
        error={fieldErrors['phone']?.[0]}
      />

      <Input
        id="contact-subject"
        name="subject"
        label={copy.subject}
        error={fieldErrors['subject']?.[0]}
      />

      <Textarea
        id="contact-message"
        name="message"
        label={copy.message}
        required
        error={fieldErrors['message']?.[0]}
      />

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isPending ? copy.pending : ''}
      </div>

      <Button type="submit" variant="solid" size="lg" disabled={isPending} className="w-full">
        {isPending ? copy.pending : copy.submit}
      </Button>
    </form>
  );
}

export default ContactForm;
