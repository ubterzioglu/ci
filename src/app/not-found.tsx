import Link from 'next/link';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Global 404 for unmatched URLs. This renders directly under the root layout
 * (which intentionally has no chrome — see app/layout.tsx), so it provides its
 * own Header/Footer to match the rest of the site.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-marble flex min-h-[70svh] items-center pt-20">
          <div className="container-editorial text-center">
            <p className="eyebrow">404</p>
            <h1 className="font-display text-charcoal mt-4 text-4xl md:text-5xl">
              Aradığınız sayfa bulunamadı
            </h1>
            <p className="text-muted mx-auto mt-4 max-w-md">
              Sayfa taşınmış ya da kaldırılmış olabilir. Sizi sofraya geri götürelim.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="bg-olive text-ivory hover:bg-olive-deep rounded-md px-6 py-3 transition-colors"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/menu"
                className="border-olive text-olive hover:bg-olive hover:text-ivory rounded-md border px-6 py-3 transition-colors"
              >
                Menü
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
