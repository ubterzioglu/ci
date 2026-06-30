import Link from 'next/link';

import { FooterContactLinks } from '@/components/layout/FooterContactLinks';
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
 * Site footer. A single centred column: brand, a centred row of contact +
 * listing icons (the Restaurant Guru profile is one of these icons — there is
 * no separate oversized medallion), the main navigation laid out inline with
 * vertical dividers, then a single inline row of contact facts (phone, email,
 * address, opening hours) also separated by vertical dividers. Closes with the
 * year + legal links.
 *
 * Address / opening hours render only when present in the source data (they are
 * not in the Wix export — see TODO_PANEL_EXPORTS). No legacy Wix footer text.
 *
 * Locale-aware: main-nav labels come from the dictionary and links are built
 * through `localePath`. The legal links (impressum/datenschutz) are TR-only
 * shared pages with no [lang] mirror, so they stay unprefixed.
 */
export function Footer({ locale = defaultLocale }: FooterProps) {
  const { contact, hours } = siteConfig;
  const dictionary = getDictionary(locale);

  // Inline contact facts shown as a single divider-separated row.
  const contactFacts: React.ReactNode[] = [
    <a key="phone" href={`tel:${contact.phoneE164}`} className="hover:text-ivory transition-colors">
      {contact.phoneDisplay}
    </a>,
    <a key="email" href={`mailto:${contact.email}`} className="hover:text-ivory transition-colors">
      {contact.email}
    </a>,
  ];
  if (contact.address) {
    contactFacts.push(<span key="address">{contact.address}</span>);
  }
  if (hours) {
    hours.forEach((row) => {
      contactFacts.push(
        <span key={`hours-${row.label}`}>
          {row.label}: {row.value}
        </span>,
      );
    });
  }

  return (
    <footer className="bg-charcoal text-ivory mt-auto">
      <div className="container-editorial py-14">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <p className="font-display text-2xl">{siteConfig.name}</p>
          <p className="text-ivory/70 mt-3 max-w-sm text-sm leading-relaxed">
            {siteConfig.tagline} {siteConfig.contact.region}.
          </p>
          <p className="text-terracotta mt-4 text-sm tracking-wide">{siteConfig.hashtag}</p>

          {/* Centred row of contact + listing icons (Restaurant Guru included) */}
          <FooterContactLinks className="mt-8" />

          {/* Main navigation — inline with vertical dividers */}
          <nav aria-label="Alt menü" className="mt-10 w-full">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
              {mainNav.map((item, index) => (
                <li key={item.href} className="flex items-center">
                  <Link
                    href={localePath(item.href, locale)}
                    className="text-ivory/80 hover:text-ivory transition-colors"
                  >
                    {navLabel(dictionary, item.href)}
                  </Link>
                  {index < mainNav.length - 1 && (
                    <span aria-hidden="true" className="bg-ivory/20 ml-5 h-3.5 w-px" />
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact facts (phone · email · address · hours) — single divider-separated row */}
          <ul className="text-ivory/70 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            {contactFacts.map((fact, index) => (
              <li key={index} className="flex items-center">
                {fact}
                {index < contactFacts.length - 1 && (
                  <span aria-hidden="true" className="bg-ivory/20 ml-4 h-3.5 w-px" />
                )}
              </li>
            ))}
          </ul>
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
