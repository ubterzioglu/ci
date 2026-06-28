import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center bg-marble pt-20">
      <div className="container-editorial text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-4xl text-charcoal md:text-5xl">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Sayfa taşınmış ya da kaldırılmış olabilir. Sizi sofraya geri götürelim.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-olive px-6 py-3 text-ivory transition-colors hover:bg-olive-deep"
          >
            Ana Sayfa
          </Link>
          <Link
            href="/menu"
            className="rounded-md border border-olive px-6 py-3 text-olive transition-colors hover:bg-olive hover:text-ivory"
          >
            Menü
          </Link>
        </div>
      </div>
    </section>
  );
}
