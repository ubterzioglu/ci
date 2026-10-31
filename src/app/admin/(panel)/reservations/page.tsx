import { AdminPageHeader } from '@/components/admin/primitives';
import { listReservations } from '@/lib/db/admin/reservations';
import { getSeasonClosure } from '@/lib/db/season-closure';
import { ReservationsClient } from './ReservationsClient';
import { SeasonClosurePanel } from './SeasonClosurePanel';

export default async function ReservationsPage() {
  const [reservations, seasonClosure] = await Promise.all([
    listReservations(),
    getSeasonClosure(),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Çalışma Alanı"
        title="Rezervasyonlar"
        description="Gelen talepleri takip edin, müşteriyle iletişim durumunu yönetin."
      />
      <div className="space-y-6">
        <SeasonClosurePanel initialClosure={seasonClosure} />
        <ReservationsClient initialReservations={reservations} />
      </div>
    </>
  );
}
