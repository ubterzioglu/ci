'use client';

import { useState } from 'react';

import { useToast } from '@/components/admin/Toast';
import type { MenuTranslations } from '@/lib/db/admin/menu-types';
import {
  defaultLocale,
  localeNames,
  translatableLocales,
  type TranslatableLocale,
} from '@/lib/i18n/config';
import { cn } from '@/lib/utils';
import { translateMenuFieldsAction } from './actions';
import { inputCls, labelCls } from './ItemForm';

/**
 * Multi-language editors for the menu panel.
 *
 * Turkish is the source and lives in the row's own `name` / `description`;
 * every other language is an override stored in the `translations` jsonb. A
 * language left blank falls back to Turkish on the public site, so a
 * half-translated dish is a valid state and says so in the UI.
 *
 * Translation is never automatic: DeepL fills the boxes and the restaurant
 * reviews them before saving, because machine output on dish names needs a
 * human eye.
 */

type TranslatableField = 'name' | 'description';

/** Short code shown above each input (TR / EN / DE / RU). */
function localeCode(locale: string): string {
  return locale.toUpperCase();
}

function readTranslation(
  translations: MenuTranslations,
  locale: TranslatableLocale,
  field: TranslatableField,
): string {
  return translations[locale]?.[field] ?? '';
}

/** Immutably set one locale's field, dropping entries that end up empty. */
function writeTranslation(
  translations: MenuTranslations,
  locale: TranslatableLocale,
  field: TranslatableField,
  value: string,
): MenuTranslations {
  const next: MenuTranslations = {
    ...translations,
    [locale]: { ...translations[locale], [field]: value },
  };
  const entry = next[locale];
  if (entry && !entry.name?.trim() && !entry.description?.trim()) delete next[locale];
  return next;
}

interface LocalizedFieldProps {
  label: string;
  field: TranslatableField;
  /** Turkish source text. */
  base: string;
  onBaseChange: (value: string) => void;
  translations: MenuTranslations;
  onTranslationsChange: (next: MenuTranslations) => void;
  placeholder?: string;
  multiline?: boolean;
  /** Disable the translate button while the row is saving. */
  busy?: boolean;
}

/**
 * One translatable field rendered once per language, with a button that fills
 * the other languages from the Turkish box.
 */
export function LocalizedField({
  label,
  field,
  base,
  onBaseChange,
  translations,
  onTranslationsChange,
  placeholder,
  multiline = false,
  busy = false,
}: LocalizedFieldProps) {
  const toast = useToast();
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!base.trim()) {
      toast.error('Önce Türkçe metni yazın.');
      return;
    }
    setTranslating(true);
    const result = await translateMenuFieldsAction({
      name: field === 'name' ? base : '',
      description: field === 'description' ? base : '',
    });
    setTranslating(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    let next = translations;
    for (const locale of translatableLocales) {
      const value = result.data?.[locale]?.[field] ?? '';
      if (value) next = writeTranslation(next, locale, field, value);
    }
    onTranslationsChange(next);
    toast.success(`${label} çevrildi. Kaydetmeden önce gözden geçirin.`);
  };

  const Field = multiline ? 'textarea' : 'input';
  const fieldProps = multiline
    ? { rows: 2, className: cn(inputCls, 'resize-y') }
    : { className: inputCls };

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <label className={cn(labelCls, 'mb-0')}>{label}</label>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating || busy}
          className="border-olive/40 text-olive hover:bg-olive hover:text-ivory font-body shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40"
        >
          {translating ? 'Çevriliyor…' : "TR'den çevir"}
        </button>
      </div>

      <p className="font-body text-muted text-[11px]">
        Boş bırakılan diller Türkçe metni kullanır.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-muted font-body mb-1 block text-[10px] font-semibold tracking-[0.12em]">
            {localeCode(defaultLocale)} · {localeNames[defaultLocale]}
          </span>
          <Field
            value={base}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onBaseChange(e.target.value)
            }
            placeholder={placeholder}
            {...fieldProps}
          />
        </div>

        {translatableLocales.map((locale) => (
          <div key={locale}>
            <span className="text-muted font-body mb-1 block text-[10px] font-semibold tracking-[0.12em]">
              {localeCode(locale)} · {localeNames[locale]}
            </span>
            <Field
              value={readTranslation(translations, locale, field)}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onTranslationsChange(writeTranslation(translations, locale, field, e.target.value))
              }
              placeholder={base || placeholder}
              {...fieldProps}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface TranslateAllProps {
  name: string;
  description: string;
  translations: MenuTranslations;
  onTranslationsChange: (next: MenuTranslations) => void;
  busy?: boolean;
}

/**
 * The "translate everything" banner above a row's language fields — the
 * equivalent of running the offline pipeline for this one row.
 */
export function TranslateAllFields({
  name,
  description,
  translations,
  onTranslationsChange,
  busy = false,
}: TranslateAllProps) {
  const toast = useToast();
  const [translating, setTranslating] = useState(false);

  const handleTranslateAll = async () => {
    if (!name.trim() && !description.trim()) {
      toast.error('Önce Türkçe ad veya açıklama yazın.');
      return;
    }
    setTranslating(true);
    const result = await translateMenuFieldsAction({ name, description });
    setTranslating(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    let next = translations;
    for (const locale of translatableLocales) {
      const translated = result.data?.[locale];
      if (translated?.name) next = writeTranslation(next, locale, 'name', translated.name);
      if (translated?.description) {
        next = writeTranslation(next, locale, 'description', translated.description);
      }
    }
    onTranslationsChange(next);
    toast.success('Çeviriler dolduruldu. Kaydetmeden önce gözden geçirin.');
  };

  return (
    <div className="border-terracotta/30 bg-terracotta/5 rounded-md border p-3">
      <p className="font-body text-charcoal text-sm font-semibold">Otomatik çeviri</p>
      <p className="font-body text-muted mt-0.5 text-xs leading-relaxed">
        Türkçe ad ve açıklamayı tek tuşla {translatableLocales.map(localeCode).join('/')} dillerine
        çevirir ve mevcut çevirilerin üzerine yazar. Kaydetmeden önce sonucu gözden geçirin.
      </p>
      <button
        type="button"
        onClick={handleTranslateAll}
        disabled={translating || busy}
        className="bg-terracotta hover:bg-terracotta/90 text-ivory font-body mt-2.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
      >
        {translating ? 'Çevriliyor…' : 'Türkçeden Tümünü Çevir'}
      </button>
    </div>
  );
}
