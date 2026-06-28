import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
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
  keywords: ['Çi Neo Cucina', 'Kaş restoran', 'Akdeniz mutfağı', 'fine dining', 'Simge Manacıoğlu'],
  authors: [{ name: siteConfig.name }],
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
      <body className="flex min-h-screen flex-col bg-marble text-charcoal antialiased">
        <JsonLd data={restaurantSchema()} />
        <JsonLd data={websiteSchema()} />
        <a
          href="#main"
          className="sr-only rounded-md bg-charcoal px-4 py-2 text-ivory focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          İçeriğe geç
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
