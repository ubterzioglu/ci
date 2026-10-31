import type { Locale } from '@/lib/i18n/config';

const LABEL: Record<Locale, string> = {
  tr: 'Son güncelleme',
  en: 'Last updated',
  de: 'Zuletzt aktualisiert',
  ru: 'Последнее обновление',
  fr: 'Dernière mise à jour',
};

interface LastUpdatedProps {
  /** ISO date (YYYY-MM-DD) — the same constant the page's JSON-LD uses. */
  date: string;
  locale: Locale;
}

/**
 * Visible modification date. Google only trusts a date in structured data when
 * the page shows it too, so this is fed from the same constant as the WebPage
 * `dateModified` (HOME_DATES / CHEF_RESTAURANT_DATES) and cannot disagree.
 */
export function LastUpdated({ date, locale }: LastUpdatedProps) {
  const formatted = new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));

  return (
    <p className="text-charcoal/60 container-editorial py-6 text-center text-sm">
      {LABEL[locale]}: <time dateTime={date}>{formatted}</time>
    </p>
  );
}

export default LastUpdated;
