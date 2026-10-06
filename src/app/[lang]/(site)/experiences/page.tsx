import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ExperiencesPageBody } from '@/components/pages/ExperiencesPageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;

  return buildPageMetadata('/experiences', locale);
}

export default async function LangExperiencesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <ExperiencesPageBody locale={lang} />;
}
