import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { HomePageBody } from '@/components/pages/HomePageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;

  return buildMetadata({
    // Homepage uses the brand name as-is (no "| Çi Neo Cucina" suffix). Pass the
    // UNPREFIXED path + locale; buildMetadata derives the locale-aware canonical
    // and hreflang alternates.
    path: '/',
    locale,
  });
}

export default async function LangHomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <HomePageBody locale={lang} />;
}
