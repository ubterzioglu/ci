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

function formatDateTime(date: string, time: string): string {
  // requested_date is an ISO date (YYYY-MM-DD); requested_time is HH:MM[:SS].
  try {
    const d = new Date(`${date}T${time}`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  } catch {
    // fall through
  }
  return `${date} ${time}`;
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
  return (
    <div className="rounded-lg border border-stone bg-cream-deep/30 p-5 shadow-[0_12px_30px_rgba(35,33,28,0.05)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-body font-semibold text-charcoal">{r.name}</div>
          <div className="mt-1 font-body text-sm text-muted">{r.email || '—'}</div>
        </div>
        <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
      </div>

      <div className="mb-5 grid gap-2 font-body text-sm leading-6 text-charcoal/80">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold text-charcoal">Telefon:</span>
          {r.phone ? (
            <>
              <a
                href={`tel:${r.phone.replace(/\s+/g, '')}`}
                className="font-medium text-olive underline-offset-2 hover:text-terracotta hover:underline"
              >
                {r.phone}
              </a>
              <a
                href={`https://wa.me/${waDigits(r.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-olive/10 px-2.5 py-0.5 text-xs font-semibold text-olive-deep transition-colors hover:bg-olive/20"
              >
                WhatsApp
              </a>
            </>
          ) : (
            <span>—</span>
          )}
        </div>
        <div>
          <span className="font-semibold text-charcoal">Tarih/Saat:</span>{' '}
          {formatDateTime(r.requestedDate, r.requestedTime)}
        </div>
        <div>
          <span className="font-semibold text-charcoal">Kişi sayısı:</span> {r.partySize}
        </div>
        {r.message && (
          <div>
            <span className="font-semibold text-charcoal">Mesaj:</span> {r.message}
          </div>
        )}
        <div className="pt-1 text-xs uppercase tracking-[0.14em] text-muted">
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
            className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-colors disabled:opacity-40 ${
              r.status === s
                ? 'bg-olive text-ivory'
                : 'border border-stone text-olive hover:bg-cream-deep'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
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

  const visible =
    filter === 'all' ? reservations : reservations.filter((r) => r.status === filter);

  const handleStatusChange = (id: string, status: ReservationStatus) => {
    const previous = reservations;
    setBusyId(id);
    // Optimistic update.
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    startTransition(async () => {
      const result = await updateReservationStatusAction(id, status);
      setBusyId(null);
      if (result.ok) {
        toast.success(`Durum güncellendi: ${STATUS_LABELS[status]}`);
      } else {
        setReservations(previous);
        toast.error(result.error);
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
            filter === 'all' ? 'ring-2 ring-olive' : 'hover:-translate-y-0.5'
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
              filter === s ? 'ring-2 ring-olive' : 'hover:-translate-y-0.5'
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
