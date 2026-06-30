'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MobileNav } from './MobileNav';
import { LanguageSwitcher } from './LanguageSwitcher';
import { mainNav, PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import { defaultLocale, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';
import { cn } from '@/lib/utils';

interface HeaderProps {
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
 * Sticky site header. Transparent over the hero at the top of the home page,
 * then condenses to a solid marble bar on scroll. On other pages it starts
 * solid. Includes desktop nav, primary CTA, and the mobile menu trigger.
 *
 * Locale-aware: nav labels come from the dictionary and every internal link is
 * built through `localePath` so EN/DE stay under their locale prefix while TR
 * keeps bare URLs.
 */
export function Header({ locale = defaultLocale }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dictionary = getDictionary(locale);
  const homeHref = localePath('/', locale);

  const isHome = pathname === homeHref;
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        solid
          ? 'border-stone-soft/70 bg-marble/95 supports-[backdrop-filter]:bg-marble/80 border-b backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between md:h-20">
        <Link
          href={homeHref}
          className={cn(
            'font-display text-xl leading-none tracking-tight transition-colors md:text-2xl',
            solid ? 'text-charcoal' : 'text-ivory',
          )}
        >
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Ana menü" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {mainNav.map((item) => {
              const href = localePath(item.href, locale);
              const active = pathname === href;
              return (
                <li key={item.href}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'text-sm tracking-wide transition-colors',
                      solid ? 'text-charcoal hover:text-olive' : 'text-ivory/90 hover:text-ivory',
                      active && (solid ? 'text-olive' : 'text-ivory'),
                    )}
                  >
                    {navLabel(dictionary, item.href)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher
            current={locale}
            tone={solid ? 'dark' : 'light'}
            className="hidden md:flex"
          />

          <Link
            href={localePath(PRIMARY_CTA.href, locale)}
            className={cn(
              'hidden rounded-md px-4 py-2 text-sm transition-colors md:inline-block',
              solid
                ? 'bg-olive text-ivory hover:bg-olive-deep'
                : 'border-ivory/70 text-ivory hover:bg-ivory hover:text-charcoal border',
            )}
          >
            {dictionary.cta.reserve}
          </Link>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            className={cn(
              'rounded-md p-2 transition-colors md:hidden',
              solid ? 'text-charcoal hover:bg-cream-deep' : 'text-ivory hover:bg-ivory/10',
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} locale={locale} />
    </header>
  );
}

export default Header;
