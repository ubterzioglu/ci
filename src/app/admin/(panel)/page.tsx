import Link from 'next/link';

import { AdminPageHeader, AdminStatCard, AdminSurface } from '@/components/admin/primitives';
import { listReservations } from '@/lib/db/admin/reservations';
import { listRevisions } from '@/lib/db/admin/revisions';

/** Dashboard home — live counts + quick links into each section. */
export default async function AdminDashboardPage() {
  const [reservations, revisions] = await Promise.all([listReservations(), listRevisions()]);

  const newReservations = reservations.filter((r) => r.status === 'new').length;
  const openRevisions = revisions.filter((r) => r.status !== 'done').length;

  const quickLinks: { href: string; title: string; description: string }[] = [
    {
      href: '/admin/reservations',
      title: 'Rezervasyonlar',
      description: 'Gelen talepleri görüntüleyin ve durumlarını yönetin.',
    },
    {
      href: '/admin/revisions',
      title: 'Revizyonlar',
      description: 'Ekip içi değişiklik isteklerini oluşturun ve takip edin.',
    },
    {
      href: '/admin/updates',
      title: 'Güncellemeler',
      description: 'Tamamlanan işler ve sırada bekleyenler.',
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Genel Bakış"
        title="Panel"
        description="Çi Neo Cucina yönetim paneline hoş geldiniz."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label="Yeni Rezervasyon"
          value={newReservations}
          detail="Henüz işleme alınmamış talepler."
          tone="terracotta"
        />
        <AdminStatCard
          label="Açık Revizyon"
          value={openRevisions}
          detail="Açık veya devam eden istekler."
          tone="olive"
        />
        <AdminStatCard
          label="Toplam Rezervasyon"
          value={reservations.length}
          detail="Tüm zamanlar."
          tone="neutral"
        />
      </div>

      <AdminSurface
        title="Hızlı erişim"
        description="Bölümler arasında hızlıca geçiş yapın."
        contentClassName="grid gap-3 sm:grid-cols-3"
      >
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group border-stone bg-cream-deep/30 rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(35,33,28,0.08)]"
          >
            <div className="font-display text-charcoal text-lg">{link.title}</div>
            <p className="font-body text-muted mt-1 text-sm leading-5">{link.description}</p>
            <div className="font-body text-terracotta mt-3 inline-flex items-center gap-1 text-xs font-semibold">
              Aç
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>
        ))}
      </AdminSurface>
    </>
  );
}
