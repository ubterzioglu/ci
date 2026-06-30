'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { LanguageSwitcher } from './LanguageSwitcher';
import { mainNav, PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
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
 * Full-screen mobile navigation drawer. Traps nothing heavyweight but does
 * lock body scroll, close on Escape, and expose proper ARIA. Keyboard users
 * can tab through links and the close button.
 *
 * Locale-aware: labels come from the dictionary and links are built through
 * `localePath`.
 */
export function MobileNav({ open, onClose, locale = defaultLocale }: MobileNavProps) {
  const dictionary = getDictionary(locale);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-nav"
      className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Menüyü kapat"
        onClick={onClose}
        className={`bg-charcoal/40 absolute inset-0 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        tabIndex={open ? 0 : -1}
      />

      {/* Panel */}
      <nav
        aria-label="Mobil menü"
        className={`bg-marble absolute top-0 right-0 flex h-full w-[82%] max-w-sm flex-col shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="border-stone-soft flex items-center justify-between border-b px-6 py-5">
          <span className="font-display text-charcoal text-xl">{siteConfig.name}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="text-charcoal hover:bg-cream-deep rounded-md p-2 transition-colors"
            tabIndex={open ? 0 : -1}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul className="flex flex-col gap-1 px-4 py-6">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={localePath(item.href, locale)}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="font-display text-charcoal hover:text-olive block rounded-md px-3 py-3 text-2xl transition-colors"
              >
                {navLabel(dictionary, item.href)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="border-stone-soft mt-auto border-t p-6">
          <LanguageSwitcher current={locale} tone="dark" className="mb-5 justify-center text-sm" />

          <Link
            href={localePath(PRIMARY_CTA.href, locale)}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="bg-olive text-ivory hover:bg-olive-deep block rounded-md px-5 py-3 text-center transition-colors"
          >
            {dictionary.cta.reserve}
          </Link>
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="text-muted mt-4 block text-center text-sm"
            tabIndex={open ? 0 : -1}
          >
            {siteConfig.contact.phoneDisplay}
          </a>
        </div>
      </nav>
    </div>
  );
}

export default MobileNav;
