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
    <footer className="bg-charcoal text-ivory mt-auto">
      <div className="container-editorial py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="font-display text-2xl">{siteConfig.name}</p>
            <p className="text-ivory/70 mt-3 max-w-sm text-sm leading-relaxed">
              {siteConfig.tagline} {siteConfig.contact.region}.
            </p>
            <p className="text-terracotta mt-4 text-sm tracking-wide">{siteConfig.hashtag}</p>
          </div>

          {/* Navigation */}
          <nav aria-label="Alt menü">
            <h2 className="text-ivory/50 text-xs font-medium tracking-[0.18em] uppercase">
              Keşfet
            </h2>
            <ul className="mt-4 space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ivory/80 hover:text-ivory text-sm transition-colors"
                  >
                    {item.labelTr}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="text-ivory/50 text-xs font-medium tracking-[0.18em] uppercase">
              İletişim
            </h2>
            <ul className="text-ivory/80 mt-4 space-y-2 text-sm">
              <li>
                <a href={`tel:${contact.phoneE164}`} className="hover:text-ivory transition-colors">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-ivory transition-colors">
                  {contact.email}
                </a>
              </li>
              {contact.address && <li className="text-ivory/70">{contact.address}</li>}
              {social.instagram && (
                <li>
                  <a
                    href={social.instagram}
                    className="hover:text-ivory transition-colors"
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
                <h2 className="text-ivory/50 text-xs font-medium tracking-[0.18em] uppercase">
                  Çalışma Saatleri
                </h2>
                <ul className="text-ivory/80 mt-3 space-y-1 text-sm">
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

        <div className="border-ivory/10 text-ivory/60 mt-12 flex flex-col gap-4 border-t pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <p>
            © {currentYear()} {siteConfig.name}. Tüm hakları saklıdır.
          </p>
          <ul className="flex gap-6">
            {footerLegalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-ivory transition-colors">
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
