import Link from 'next/link';

import { FooterContactLinks } from '@/components/layout/FooterContactLinks';
import { RestaurantGuruBadge } from '@/components/layout/RestaurantGuruBadge';
import { mainNav, footerLegalNav, siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';
import { currentYear } from '@/lib/utils';

interface FooterProps {
  locale?: Locale;
}

/** Map a nav href to its localized dictionary label. */
function navLabel(dictionary: ReturnType<typeof getDictionary>, href: string): string {
  switch (href) {
    case '/':
      return dictionary.nav.home;
    case '/menu':
      return dictionary.nav.menu;
    case '/about':
      return dictionary.nav.about;
    case '/experiences':
      return dictionary.nav.experiences;
    case '/reservations':
      return dictionary.nav.reservations;
    case '/contact':
      return dictionary.nav.contact;
    default:
      return href;
  }
}

/**
 * Site footer. Shows brand, contact, navigation, legal links and a current-year
 * copyright. Address / opening hours / social links render only when present
 * in the source data (they are not in the Wix export — see TODO_PANEL_EXPORTS).
 * No legacy Wix footer text.
 *
 * Locale-aware: main-nav labels come from the dictionary and main-nav links are
 * built through `localePath`. The legal links (impressum/datenschutz) are
 * TR-only shared pages with no [lang] mirror, so they stay unprefixed.
 */
export function Footer({ locale = defaultLocale }: FooterProps) {
  const { contact, hours } = siteConfig;
  const dictionary = getDictionary(locale);

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

            {/* Contact + listing profiles, side by side as labelled icons */}
            <FooterContactLinks className="mt-6" />

            {/* Restaurant Guru 2026 award */}
            <RestaurantGuruBadge className="mt-6" />
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
                    href={localePath(item.href, locale)}
                    className="text-ivory/80 hover:text-ivory text-sm transition-colors"
                  >
                    {navLabel(dictionary, item.href)}
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
