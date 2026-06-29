import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';
import { JsonLd } from '@/components/seo/JsonLd';
import { restaurantSchema, websiteSchema } from '@/lib/seo/schema';
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
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
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
  // Stop iOS Safari from auto-linking incidental numbers/addresses in the UI.
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: siteConfig.url,
  },
};

export const viewport: Viewport = {
  themeColor: '#23211c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-marble text-charcoal flex min-h-screen flex-col antialiased">
        <JsonLd data={restaurantSchema()} />
        <JsonLd data={websiteSchema()} />
        {/*
          Site chrome (Header/Footer/<main>) lives in app/(site)/layout.tsx so
          chrome-free routes — the at-table QR menu in app/(qr) — can opt out.
          Only `not-found.tsx` renders directly under this root layout, so it
          provides its own chrome.
        */}
        {children}
      </body>
    </html>
  );
}
