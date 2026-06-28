import Link from 'next/link';

import { mainNav, footerLegalNav, siteConfig } from '@/lib/site-config';
import { currentYear } from '@/lib/utils';

/**
 * Site footer. Shows brand, contact, navigation, legal links and a current-year
 * copyright. Address / opening hours / social links render only when present
 * in the source data (they are not in the Wix export — see TODO_PANEL_EXPORTS).
 * No legacy Wix footer text.
 */
export function Footer() {
  const { contact, social, hours } = siteConfig;

  return (
    <footer className="mt-auto bg-charcoal text-ivory">
      <div className="container-editorial py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="font-display text-2xl">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/70">
              {siteConfig.tagline} {siteConfig.contact.region}.
            </p>
            <p className="mt-4 text-sm tracking-wide text-terracotta">{siteConfig.hashtag}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Alt menü">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ivory/50">
              Keşfet
            </h2>
            <ul className="mt-4 space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ivory/80 transition-colors hover:text-ivory"
                  >
                    {item.labelTr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ivory/50">
              İletişim
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-ivory/80">
              <li>
                <a
                  href={`tel:${contact.phoneE164}`}
                  className="transition-colors hover:text-ivory"
                >
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors hover:text-ivory"
                >
                  {contact.email}
                </a>
              </li>
              {contact.address && <li className="text-ivory/70">{contact.address}</li>}
              {social.instagram && (
                <li>
                  <a
                    href={social.instagram}
                    className="transition-colors hover:text-ivory"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>

            {hours && (
              <div className="mt-4">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ivory/50">
                  Çalışma Saatleri
                </h2>
                <ul className="mt-3 space-y-1 text-sm text-ivory/80">
                  {hours.map((row) => (
                    <li key={row.label} className="flex justify-between gap-4">
                      <span>{row.label}</span>
                      <span className="text-ivory/60">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-ivory/10 pt-6 text-sm text-ivory/60 md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear()} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <ul className="flex gap-6">
            {footerLegalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-ivory">
                  {item.labelTr}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
