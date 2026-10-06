import { headers } from 'next/headers';
import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { defaultLocale, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localePath } from '@/lib/i18n/paths';

/**
 * Global 404 for unmatched URLs. This renders directly under the root layout
 * (which intentionally has no chrome — see app/layout.tsx), so it provides its
 * own Header/Footer to match the rest of the site. The locale comes from the
 * `x-locale` header set by the proxy, so `/en/nope` shows English copy.
 */
export default async function NotFound() {
  const headerLocale = (await headers()).get('x-locale');
  const locale = headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;
  const { notFound: copy } = getDictionary(locale);

  return (
    <>
      <Header locale={locale} />
      <main className="flex-1">
        <section className="bg-marble flex min-h-[70svh] items-center pt-20">
          <div className="container-editorial text-center">
            <p className="eyebrow">404</p>
            <h1 className="font-display text-charcoal mt-4 text-4xl md:text-5xl">{copy.title}</h1>
            <p className="text-muted mx-auto mt-4 max-w-md">{copy.body}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={localePath('/', locale)}
                className="bg-olive text-ivory hover:bg-olive-deep rounded-md px-6 py-3 transition-colors"
              >
                {copy.home}
              </Link>
              <Link
                href={localePath('/menu', locale)}
                className="border-olive text-olive hover:bg-olive hover:text-ivory rounded-md border px-6 py-3 transition-colors"
              >
                {copy.menu}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
