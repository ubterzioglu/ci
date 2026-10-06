import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;

  return buildPageMetadata('/about', locale);
}

export default async function LangAboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <AboutPageBody locale={lang} />;
}
