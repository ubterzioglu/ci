import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Layout for the public marketing site. Provides the global chrome — skip link,
 * Header, the semantic <main> landmark, and Footer — that wraps every page in
 * the (site) route group.
 *
 * The chrome lives here (not in the root layout) so chrome-free routes such as
 * the at-table QR menu in the (qr) group can opt out cleanly. The root layout
 * keeps only <html>/<body>, fonts, and global JSON-LD.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="bg-charcoal text-ivory sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        İçeriğe geç
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
