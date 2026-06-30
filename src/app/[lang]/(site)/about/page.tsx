import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutPageBody } from '@/components/pages/AboutPageBody';
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
    title: 'Hakkımızda',
    description:
      'Çi Neo Cucina’nın dinginlik, sürdürülebilirlik, yerel malzeme ve Akdeniz sofrası odaklı hikâyesi.',
    path: '/about',
    locale,
  });
}

export default async function LangAboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <AboutPageBody locale={lang} />;
}
