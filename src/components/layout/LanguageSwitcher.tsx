'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { cn } from '@/lib/utils';
import {
  defaultLocale,
  isLocale,
  locales,
  localeNames,
  turkishOnlyPaths,
  type Locale,
} from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

/**
 * Language switcher. Renders one link per locale and preserves the current
 * page when switching: it strips any existing locale prefix from the pathname,
 * then re-applies the target locale's prefix ("unprefixed default" — Turkish
 * has no prefix, en/de are prefixed).
 *
 * Client component (needs the live pathname). Kept tiny and dependency-light so
 * it can sit in the server-rendered Header.
 */
interface LanguageSwitcherProps {
  /** Active locale, for highlighting the current choice. */
  current?: Locale;
  /** Visual tone — matches the header's transparent/solid states. */
  tone?: 'light' | 'dark';
  className?: string;
}

/** Remove a leading locale segment (`/en/menu` → `/menu`, `/de` → `/`). */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  // segments[0] is '' (leading slash); segments[1] is the first path part.
  if (segments[1] && isLocale(segments[1]) && segments[1] !== defaultLocale) {
    const rest = '/' + segments.slice(2).join('/');
    return rest === '/' ? '/' : rest.replace(/\/$/, '');
  }
  return pathname || '/';
}

/** Apply a locale prefix to an unprefixed path. */
function withLocale(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function LanguageSwitcher({
  current = defaultLocale,
  tone = 'dark',
  className,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  // Soft navigations never re-render the root layout, so keep <html lang> in sync.
  useEffect(() => {
    document.documentElement.lang = current;
  }, [current]);
  const strippedPath = stripLocale(pathname);
  // Turkish-only pages have no translated twin: send other locales to their home.
  const basePath = turkishOnlyPaths.includes(strippedPath) ? '/' : strippedPath;
  const dictionary = getDictionary(current);

  return (
    <nav
      aria-label={dictionary.a11y.languageSelection}
      className={cn('flex items-center gap-1 text-xs', className)}
    >
      {locales.map((locale, index) => {
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center">
            {index > 0 && (
              <span
                aria-hidden="true"
                className={tone === 'light' ? 'text-ivory/40' : 'text-muted'}
              >
                ·
              </span>
            )}
            <Link
              href={withLocale(basePath, locale)}
              hrefLang={locale}
              aria-current={active ? 'true' : undefined}
              title={localeNames[locale]}
              className={cn(
                'inline-flex min-h-8 min-w-8 items-center justify-center px-2 py-2 tracking-wide uppercase transition-colors',
                tone === 'light'
                  ? 'text-ivory/80 hover:text-ivory'
                  : 'text-muted hover:text-charcoal',
                active && (tone === 'light' ? 'text-ivory underline' : 'text-charcoal underline'),
              )}
            >
              {locale}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

export default LanguageSwitcher;
