import type { Metadata, Viewport } from 'next';

/**
 * Chrome-free layout for the at-table QR menu. Deliberately omits the global
 * Header/Footer (those live in app/(site)/layout.tsx) so a seated guest sees
 * only the menu. Inherits <html>/<body>, fonts, and global JSON-LD from the
 * root layout.
 */
export const metadata: Metadata = {
  // The QR menu mirrors /menu; keep it out of the index to avoid duplicate content.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#23211c',
  width: 'device-width',
  initialScale: 1,
  // A printed menu shouldn't pinch-zoom awkwardly, but allow it for accessibility.
  maximumScale: 5,
};

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex-1">{children}</div>;
}
