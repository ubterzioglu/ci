import { AdminPageHeader } from '@/components/admin/primitives';
import { listReservations } from '@/lib/db/admin/reservations';
import { ReservationsClient } from './ReservationsClient';

export default async function ReservationsPage() {
  const reservations = await listReservations();

  return (
    <>
      <AdminPageHeader
        eyebrow="Çalışma Alanı"
        title="Rezervasyonlar"
        description="Gelen talepleri takip edin, müşteriyle iletişim durumunu yönetin."
      />
      <ReservationsClient initialReservations={reservations} />
    </>
  );
}
