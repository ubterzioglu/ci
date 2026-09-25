'use client';

import { useMemo, useState, useTransition } from 'react';

import {
  AdminStatCard,
  AdminSurface,
  AdminEmptyState,
  StatusPill,
} from '@/components/admin/primitives';
import { useToast } from '@/components/admin/Toast';
import {
  RESERVATION_STATUSES,
  type AdminReservation,
  type ReservationStatus,
} from '@/lib/db/admin/reservation-types';
import { formatReservationDateTime } from '@/lib/utils';
import { buildReservationConfirmation } from '@/lib/email-content';
import { updateReservationStatusAction } from './actions';

const STATUS_LABELS: Record<ReservationStatus, string> = {
  new: 'Yeni',
  confirmed: 'Onaylandı',
  declined: 'Reddedildi',
  cancelled: 'İptal',
};

const STATUS_TONE: Record<ReservationStatus, 'olive' | 'terracotta' | 'wine' | 'neutral'> = {
  new: 'terracotta',
  confirmed: 'olive',
  declined: 'wine',
  cancelled: 'neutral',
};

/** Strips a phone string to wa.me-compatible international digits (TR-aware). */
function waDigits(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) return `90${digits.slice(1)}`;
  return digits;
}

function ReservationCard({
  reservation,
  onStatusChange,
  busy,
}: {
  reservation: AdminReservation;
  onStatusChange: (id: string, status: ReservationStatus) => void;
  busy: boolean;
}) {
  const r = reservation;
  const emailPreview = buildReservationConfirmation(r);
  return (
    <div className="border-stone bg-cream-deep/30 rounded-lg border p-5 shadow-[0_12px_30px_rgba(35,33,28,0.05)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-body text-charcoal font-semibold">{r.name}</div>
          <div className="font-body text-muted mt-1 text-sm">{r.email || '—'}</div>
        </div>
        <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
      </div>

      <div className="font-body text-charcoal/80 mb-5 grid gap-2 text-sm leading-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-charcoal font-semibold">Telefon:</span>
          {r.phone ? (
            <>
              <a
                href={`tel:${r.phone.replace(/\s+/g, '')}`}
                className="text-olive hover:text-terracotta font-medium underline-offset-2 hover:underline"
              >
                {r.phone}
              </a>
              <a
                href={`https://wa.me/${waDigits(r.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-olive/10 text-olive-deep hover:bg-olive/20 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors"
              >
                WhatsApp
              </a>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
        <div>
          <span className="text-charcoal font-semibold">Tarih/Saat:</span>{' '}
          {formatReservationDateTime(r.requestedDate, r.requestedTime)}
        </div>
        <div>
          <span className="text-charcoal font-semibold">Kişi sayısı:</span> {r.partySize}
        </div>
        {r.message && (
          <div>
            <span className="text-charcoal font-semibold">Mesaj:</span> {r.message}
          </div>
        )}
        <div className="text-muted pt-1 text-xs tracking-[0.14em] uppercase">
          {new Date(r.createdAt).toLocaleString('tr-TR')}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RESERVATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || r.status === s}
            onClick={() => onStatusChange(r.id, s)}
            className={`font-body rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
              r.status === s
                ? 'bg-olive text-ivory'
                : 'border-stone text-olive hover:bg-cream-deep border'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="border-stone mt-5 border-t pt-4">
        <p className="font-body text-charcoal mb-2 text-xs font-semibold">
          Misafir onay e-postası · tek e-postada dört dil
        </p>
        <div className="bg-cream-deep/40 mt-3 rounded-md p-3">
          <p className="font-body text-charcoal text-xs font-semibold">{emailPreview.subject}</p>
          <pre className="font-body text-muted mt-2 whitespace-pre-wrap text-xs leading-relaxed">{emailPreview.text}</pre>
        </div>
      </div>
    </div>
  );
}

export function ReservationsClient({
  initialReservations,
}: {
  initialReservations: AdminReservation[];
}) {
  const toast = useToast();
  const [reservations, setReservations] = useState(initialReservations);
  const [filter, setFilter] = useState<ReservationStatus | 'all'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const base: Record<ReservationStatus, number> = {
      new: 0,
      confirmed: 0,
      declined: 0,
      cancelled: 0,
    };
    for (const r of reservations) base[r.status] += 1;
    return base;
  }, [reservations]);

  const visible = filter === 'all' ? reservations : reservations.filter((r) => r.status === filter);

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    const previous = reservations;
    setBusyId(id);
    // Optimistic update.
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    startTransition(async () => {
      const result = await updateReservationStatusAction(id, status);
      setBusyId(null);
      if (!result.ok) {
        setReservations(previous);
        toast.error(result.error);
        return;
      }

      toast.success(`Durum güncellendi: ${STATUS_LABELS[status]}`);

      // The status change already succeeded; this only reports what became of
      // the guest's confirmation mail, so a mail problem shows as a warning
      // rather than making the update look failed.
      const notice = result.data;
      if (notice?.kind === 'sent') {
        toast.success(`Misafire bilgilendirme e-postası gönderildi (${notice.to}).`);
      } else if (notice?.kind === 'no-email') {
        toast.error('Bu rezervasyonda e-posta adresi yok — misafire mail gönderilemedi.');
      } else if (notice?.kind === 'not-configured') {
        toast.error('E-posta ayarları yapılmamış — misafire mail gönderilemedi.');
      } else if (notice?.kind === 'failed') {
        toast.error('Misafire mail gönderilemedi. Lütfen telefonla bilgilendirin.');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => setFilter('all')}
          aria-pressed={filter === 'all'}
          className={`rounded-lg text-left transition focus:outline-none ${
            filter === 'all' ? 'ring-olive ring-2' : 'hover:-translate-y-0.5'
          }`}
        >
          <AdminStatCard
            label="Toplam Talep"
            value={reservations.length}
            detail={filter === 'all' ? 'Tümü gösteriliyor.' : 'Tümünü göstermek için tıklayın.'}
            tone="olive"
          />
        </button>
        {RESERVATION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(filter === s ? 'all' : s)}
            aria-pressed={filter === s}
            className={`rounded-lg text-left transition focus:outline-none ${
              filter === s ? 'ring-olive ring-2' : 'hover:-translate-y-0.5'
            }`}
          >
            <AdminStatCard
              label={STATUS_LABELS[s]}
              value={counts[s]}
              detail={filter === s ? 'Filtre aktif.' : 'Sadece bunları görmek için tıklayın.'}
              tone={STATUS_TONE[s]}
            />
          </button>
        ))}
      </div>

      <AdminSurface
        title="Rezervasyon akışı"
        description="Yeni talepleri gözden geçirin, iletişim durumunu güncelleyin ve ilerlemeyi ekibiniz için görünür tutun."
        contentClassName="space-y-5"
      >
        {reservations.length === 0 && (
          <AdminEmptyState
            title="Henüz rezervasyon talebi yok"
            description="Yeni form gönderimleri burada kart görünümüyle listelenecek."
          />
        )}

        {reservations.length > 0 && visible.length === 0 && (
          <AdminEmptyState
            title={`"${STATUS_LABELS[filter as ReservationStatus]}" durumunda talep yok`}
            description="Başka bir durum seçin veya 'Toplam Talep' ile tüm talepleri görün."
          />
        )}

        {visible.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {visible.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onStatusChange={handleStatusChange}
                busy={busyId === r.id}
              />
            ))}
          </div>
        )}
      </AdminSurface>
    </div>
  );
}
