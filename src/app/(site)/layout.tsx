import { SiteChrome } from '@/components/layout/SiteChrome';

/**
 * Layout for the public marketing site (Turkish, unprefixed URLs). Renders the
 * shared SiteChrome — skip link, Header, the semantic <main> landmark, and
 * Footer — with locale='tr'. The locale-prefixed EN/DE variant lives in
 * app/[lang]/(site)/layout.tsx and reuses the same SiteChrome.
 *
 * The chrome lives here (not in the root layout) so chrome-free routes such as
 * the at-table QR menu in the (qr) group can opt out cleanly. The root layout
 * keeps only <html>/<body>, fonts, and global JSON-LD.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome locale="tr">{children}</SiteChrome>;
}
