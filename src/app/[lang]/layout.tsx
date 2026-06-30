import { notFound } from 'next/navigation';

import { SiteChrome } from '@/components/layout/SiteChrome';
import { defaultLocale, isLocale } from '@/lib/i18n/config';

/**
 * Layout for the locale-prefixed public site (EN/DE). Mirrors the unprefixed TR
 * layout (`(site)/layout.tsx`) but threads the active locale into the shared
 * SiteChrome.
 *
 * Routing strategy is "unprefixed default": Turkish keeps bare URLs, so the
 * default locale must NOT be reachable under a prefix — `/tr/...` (and any
 * invalid prefix) 404s here rather than duplicating the TR pages.
 */
export function generateStaticParams(): { lang: string }[] {
  return [{ lang: 'en' }, { lang: 'de' }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // TR stays unprefixed; only non-default locales are valid under /[lang].
  if (!isLocale(lang) || lang === defaultLocale) {
    notFound();
  }

  return <SiteChrome locale={lang}>{children}</SiteChrome>;
}
