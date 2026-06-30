import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ContactPageBody } from '@/components/pages/ContactPageBody';
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
    title: 'İletişim',
    description:
      'Çi Neo Cucina ile iletişime geçin: rezervasyon, özel etkinlik ve sorularınız için bize ulaşın.',
    path: '/contact',
    locale,
  });
}

export default async function LangContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang) || lang === defaultLocale) notFound();

  return <ContactPageBody locale={lang} />;
}
