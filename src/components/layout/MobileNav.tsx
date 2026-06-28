'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { mainNav, PRIMARY_CTA, siteConfig } from '@/lib/site-config';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation drawer. Traps nothing heavyweight but does
 * lock body scroll, close on Escape, and expose proper ARIA. Keyboard users
 * can tab through links and the close button.
 */
export function MobileNav({ open, onClose }: MobileNavProps) {
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
        className={`absolute inset-0 bg-charcoal/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        tabIndex={open ? 0 : -1}
      />

      {/* Panel */}
      <nav
        aria-label="Mobil menü"
        className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-marble shadow-xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-soft px-6 py-5">
          <span className="font-display text-xl text-charcoal">{siteConfig.name}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="rounded-md p-2 text-charcoal transition-colors hover:bg-cream-deep"
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
                href={item.href}
                onClick={onClose}
                tabIndex={open ? 0 : -1}
                className="block rounded-md px-3 py-3 font-display text-2xl text-charcoal transition-colors hover:text-olive"
              >
                {item.labelTr}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto border-t border-stone-soft p-6">
          <Link
            href={PRIMARY_CTA.href}
            onClick={onClose}
            tabIndex={open ? 0 : -1}
            className="block rounded-md bg-olive px-5 py-3 text-center text-ivory transition-colors hover:bg-olive-deep"
          >
            {PRIMARY_CTA.labelTr}
          </Link>
          <a
            href={`tel:${siteConfig.contact.phoneE164}`}
            className="mt-4 block text-center text-sm text-muted"
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
