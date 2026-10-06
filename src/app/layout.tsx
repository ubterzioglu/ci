import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { headers } from 'next/headers';

import './globals.css';
import { Clarity } from '@/components/analytics/Clarity';
import { JsonLd } from '@/components/seo/JsonLd';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { buildGeoMetadata } from '@/lib/seo/metadata';
import { restaurantRefSchema, websiteSchema } from '@/lib/seo/schema';
import { siteConfig } from '@/lib/site-config';

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  /**
   * Fallback title for any route that ships no metadata of its own.
   *
   * Deliberately NO `template` here: buildMetadata() already appends
   * " | Çi Neo Cucina" to every public page, so a template would apply the
   * brand a second time (pages read "Hakkımızda | Çi Neo Cucina | Çi Neo
   * Cucina"). The brand suffix has exactly one owner — buildMetadata. Routes
   * that bypass it (/qr, /admin) spell the full title out themselves.
   *
   * A plain string is the only way to express "no template": Next.js's object
   * form (`{ default: … }`) requires a `template` alongside it.
   */
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'Çi Neo Cucina',
    'Kaş restoran',
    'Kaş yemek',
    'Akdeniz mutfağı',
    'Anadolu mutfağı',
    'fine dining Kaş',
    'Antalya restoran',
    'Simge Manacıoğlu',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: 'restaurant',
  // Stop iOS Safari from auto-linking incidental numbers/addresses in the UI.
  formatDetection: { telephone: false, address: false, email: false },
  /**
   * Deliberately NO `alternates.canonical` here. Root metadata is inherited by
   * every route that ships none of its own — `not-found`, `/qr`, admin — so a
   * canonical at this level made 404s and the QR menu declare the homepage as
   * their canonical URL. buildMetadata is the single owner of canonicals; the
   * homepage sets its own via `buildMetadata({ path: '/' })`.
   */
  other: buildGeoMetadata(),
  /**
   * Search-console ownership proofs. Left undefined when the env var is
   * absent, which is the normal state locally — Next omits the tag entirely
   * rather than emitting an empty one.
   */
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
    images: [{ url: siteConfig.ogDefaultImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [siteConfig.ogDefaultImage],
  },
};

export const viewport: Viewport = {
  themeColor: '#23211c',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The locale is resolved by middleware from the path and exposed on the
  // `x-locale` request header, so the root <html lang> is correct for every
  // locale without a [lang] segment at this level.
  const headerLocale = (await headers()).get('x-locale');
  const lang = headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html lang={lang} className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-marble text-charcoal flex min-h-screen flex-col antialiased">
        {/*
          The full Restaurant node is emitted only on the homepage (see
          HomePageBody). Every other page carries a compact @id reference so
          crawlers see ONE business entity, not five copies of the same node.
          The WebSite node is emitted everywhere — it is cheap and identifies
          the site as the publisher of this Restaurant.
        */}
        <JsonLd data={restaurantRefSchema()} />
        <JsonLd data={websiteSchema(lang)} />
        {/*
          Site chrome (Header/Footer/<main>) lives in app/(site)/layout.tsx so
          chrome-free routes — the at-table QR menu in app/(qr) — can opt out.
          Only `not-found.tsx` renders directly under this root layout, so it
          provides its own chrome.
        */}
        {children}
        <Clarity />
      </body>
    </html>
  );
}
