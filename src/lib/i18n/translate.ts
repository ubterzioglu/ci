import 'server-only';

import type { TranslatableLocale } from './config';

/**
 * DeepL access for the admin panel's "translate from Turkish" buttons.
 *
 * The offline pipeline (scripts/translate-content.ts) translates the static
 * content files at build time. This is its runtime counterpart: content the
 * restaurant types into /admin/menu never passes through that script, so the
 * panel calls DeepL directly and stores the result on the row.
 *
 * Server-only — DEEPL_API_KEY must never reach the browser.
 */

/** DeepL target codes for the site's translatable locales. */
const DEEPL_TARGET: Record<TranslatableLocale, string> = {
  en: 'EN-GB',
  de: 'DE',
  ru: 'RU',
};

/** DeepL allows 50 text params per request; stay under it. */
const MAX_TEXTS_PER_REQUEST = 40;

interface DeepLResponse {
  translations: Array<{ text: string }>;
}

export class TranslationError extends Error {}

/**
 * Translate Turkish strings into one locale, preserving input order.
 *
 * Returns [] for an empty input without calling DeepL. Throws
 * TranslationError with a message meant for the panel — the caller surfaces it
 * to the restaurant, who cannot act on an HTTP status.
 */
export async function translateFromTurkish(
  texts: string[],
  locale: TranslatableLocale,
): Promise<string[]> {
  if (texts.length === 0) return [];

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new TranslationError('Çeviri servisi yapılandırılmamış (DEEPL_API_KEY eksik).');
  }

  // Free keys are served from a different host than paid ones.
  const endpoint = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const out: string[] = [];
  for (let i = 0; i < texts.length; i += MAX_TEXTS_PER_REQUEST) {
    const chunk = texts.slice(i, i + MAX_TEXTS_PER_REQUEST);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: chunk,
          source_lang: 'TR',
          target_lang: DEEPL_TARGET[locale],
        }),
      });
    } catch {
      throw new TranslationError(
        'Çeviri servisine ulaşılamadı. İnternet bağlantısını kontrol edin.',
      );
    }

    if (!response.ok) {
      throw new TranslationError(describeDeepLFailure(response.status));
    }

    const data = (await response.json()) as DeepLResponse;
    const translated = data.translations?.map((t) => t.text) ?? [];
    if (translated.length !== chunk.length) {
      throw new TranslationError('Çeviri servisi beklenmedik bir yanıt döndürdü. Tekrar deneyin.');
    }
    out.push(...translated);
  }

  return out;
}

/** Turn a DeepL status into something the restaurant can act on. */
function describeDeepLFailure(status: number): string {
  if (status === 403) return 'Çeviri servisi anahtarı geçersiz. Lütfen bize bildirin.';
  if (status === 429) return 'Çeviri servisi şu an yoğun. Biraz sonra tekrar deneyin.';
  if (status === 456) return 'Çeviri servisinin aylık kotası dolmuş. Lütfen bize bildirin.';
  if (status >= 500)
    return 'Çeviri servisi geçici olarak yanıt vermiyor. Biraz sonra tekrar deneyin.';
  return `Çeviri başarısız oldu (hata ${status}). Tekrar deneyin.`;
}
