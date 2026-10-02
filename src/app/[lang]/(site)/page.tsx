import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildMetadata } from '@/lib/seo/metadata';
import { seoTitle } from '@/lib/seo/titles';
import { getLocalPage } from '@/content/pages-i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;
  const page = getLocalPage('home', locale);

  return buildMetadata({
    // Title comes from the per-locale table (brand + "Kaş" + cuisine) and is
    // used verbatim. Pass the UNPREFIXED path + locale; buildMetadata derives
    // the locale-aware canonical and hreflang alternates.
    absoluteTitle: seoTitle('/', locale),
    path: '/',
    locale,
    description: page?.seoDescription ?? page?.excerpt ?? undefined,
  });
}

export default async function LangHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <HomePageBody locale={lang} />;
}
