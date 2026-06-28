'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MobileNav } from './MobileNav';
import { mainNav, PRIMARY_CTA, siteConfig } from '@/lib/site-config';
import { cn } from '@/lib/utils';

/**
 * Sticky site header. Transparent over the hero at the top of the home page,
 * then condenses to a solid marble bar on scroll. On other pages it starts
 * solid. Includes desktop nav, primary CTA, and the mobile menu trigger.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = pathname === '/';
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
          ? 'border-b border-stone-soft/70 bg-marble/95 backdrop-blur supports-[backdrop-filter]:bg-marble/80'
          : 'bg-transparent',
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
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
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'text-sm tracking-wide transition-colors',
                      solid ? 'text-charcoal hover:text-olive' : 'text-ivory/90 hover:text-ivory',
                      active && (solid ? 'text-olive' : 'text-ivory'),
                    )}
                  >
                    {item.labelTr}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={PRIMARY_CTA.href}
            className={cn(
              'hidden rounded-md px-4 py-2 text-sm transition-colors md:inline-block',
              solid
                ? 'bg-olive text-ivory hover:bg-olive-deep'
                : 'border border-ivory/70 text-ivory hover:bg-ivory hover:text-charcoal',
            )}
          >
            {PRIMARY_CTA.labelTr}
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

      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

export default Header;
