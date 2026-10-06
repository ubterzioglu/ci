import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ReservationsPageBody } from '@/components/pages/ReservationsPageBody';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) && lang !== defaultLocale ? lang : defaultLocale;

  return buildPageMetadata('/reservations', locale);
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
