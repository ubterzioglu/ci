'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/app/admin/actions';

/**
 * Admin sidebar navigation. Active state is derived from the current pathname
 * (Next.js routing) rather than tab state. Each item is a small inline SVG icon
 * — no icon library dependency.
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const iconClass = 'h-4 w-4';

const NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Panel',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
        <rect x="2.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11.5" y="2.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="11.5" y="11.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    href: '/admin/reservations',
    label: 'Rezervasyonlar',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/menu',
    label: 'Menü',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
        <path d="M5 2.5v6M5 8.5v9M3 2.5v3a2 2 0 002 2M7 2.5v3a2 2 0 01-2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 2.5c-1.4 0-2.5 1.6-2.5 3.6s1.1 3.4 2.5 3.4V2.5zM13.5 9.5v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/revisions',
    label: 'Revizyonlar',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
        <path d="M4 14.5V16h1.5l8-8L12 6.5l-8 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M12.5 6l1.5 1.5 1.2-1.2a1 1 0 000-1.4l-.1-.1a1 1 0 00-1.4 0L12.5 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/updates',
    label: 'Güncellemeler',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className={iconClass} aria-hidden="true">
        <path d="M10 2.5l1.9 3.9 4.3.6-3.1 3 .7 4.3L10 12.9 6.3 14.3l.7-4.3-3.1-3 4.3-.6L10 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex h-full flex-col rounded-lg border border-stone bg-marble/95 p-3 shadow-[0_20px_60px_rgba(35,33,28,0.08)]',
        className,
      )}
    >
      <div className="flex flex-col items-center border-b border-stone/70 px-1.5 pb-4 pt-2 text-center">
        <div className="font-display text-2xl leading-none text-charcoal">Çi Neo Cucina</div>
        <div className="eyebrow mt-2">Yönetim Paneli</div>
      </div>

      <nav className="mt-3 flex-1 space-y-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors',
                active
                  ? 'bg-olive text-ivory shadow-[0_14px_28px_rgba(90,98,64,0.22)]'
                  : 'text-charcoal hover:bg-cream-deep',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors',
                  active
                    ? 'border-ivory/20 bg-ivory/10 text-ivory'
                    : 'border-stone bg-marble text-olive',
                )}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1 font-body text-[13px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 border-t border-stone/70 pt-3">
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-charcoal px-3 py-2 font-body text-[12px] font-semibold text-ivory transition-colors hover:bg-charcoal-soft"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5v11a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 15.5V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M3.5 10h8M9 7l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Çıkış Yap
          </button>
        </form>
      </div>
    </aside>
  );
}
