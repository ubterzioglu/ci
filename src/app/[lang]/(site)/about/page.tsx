import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildMetadata } from '@/lib/seo/metadata';
import { getLocalPage } from '@/content/pages-i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;
  const page = getLocalPage('about', locale);

  return buildMetadata({
    title: page?.title ?? 'Çi Neo Cucina',
    description: page?.seoDescription ?? page?.excerpt ?? '',
    path: '/about',
    locale,
  });
}

export default async function LangAboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <AboutPageBody locale={lang} />;
}
