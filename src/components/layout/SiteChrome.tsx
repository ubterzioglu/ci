import type { ReactNode } from 'react';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import type { Locale } from '@/lib/i18n/config';

interface SiteChromeProps {
  locale: Locale;
  children: ReactNode;
}

/**
 * Shared public-site chrome — skip link, Header, the semantic <main> landmark,
 * and Footer — used by both the unprefixed TR layout (`(site)/layout.tsx`,
 * locale='tr') and the locale-prefixed EN/DE layout (`[lang]/(site)/layout.tsx`).
 *
 * The locale threads down to Header/Footer so nav labels and internal links are
 * built for the active language.
 */
export function SiteChrome({ locale, children }: SiteChromeProps) {
  return (
    <>
      <a
        href="#main"
        className="bg-charcoal text-ivory sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        İçeriğe geç
      </a>
      <Header locale={locale} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
      <ScrollToTop />
    </>
  );
}

export default SiteChrome;
