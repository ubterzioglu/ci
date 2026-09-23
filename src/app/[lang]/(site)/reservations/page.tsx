import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ReservationsPageBody } from '@/components/pages/ReservationsPageBody';
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
  const page = getLocalPage('reservations', locale);

  return buildMetadata({
    title: page?.title ?? 'Çi Neo Cucina',
    description: page?.seoDescription ?? page?.excerpt ?? '',
    path: '/reservations',
    locale,
  });
}

export default async function LangReservationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <ReservationsPageBody locale={lang} />;
}
