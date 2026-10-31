'use client';

import { useState, useTransition } from 'react';

import { AdminSurface, StatusPill } from '@/components/admin/primitives';
import { useToast } from '@/components/admin/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { earliestBookableDate } from '@/lib/reservation-rules';
import { formatIsoDate, type SeasonClosure } from '@/lib/reservation-closure';
import { clearSeasonClosureAction, saveSeasonClosureAction } from './actions';

type ClosureState = 'active' | 'upcoming' | 'past';

function closureState(closure: SeasonClosure, today: string): ClosureState {
  if (today > closure.end) return 'past';
  if (today < closure.start) return 'upcoming';
  return 'active';
}

const STATE_LABEL: Record<ClosureState, string> = {
  active: 'Şu an kapalı',
  upcoming: 'Yaklaşan kapanış',
  past: 'Süresi doldu',
};

const STATE_TONE: Record<ClosureState, 'wine' | 'terracotta' | 'neutral'> = {
  active: 'wine',
  upcoming: 'terracotta',
  past: 'neutral',
};

export function SeasonClosurePanel({ initialClosure }: { initialClosure: SeasonClosure | null }) {
  const toast = useToast();
  const [closure, setClosure] = useState(initialClosure);
  const [start, setStart] = useState(initialClosure?.start ?? '');
  const [end, setEnd] = useState(initialClosure?.end ?? '');
  const [isPending, startTransition] = useTransition();

  const state = closure ? closureState(closure, earliestBookableDate()) : null;
  const canSave = start !== '' && end !== '' && end >= start;

  const handleSave = () => {
    startTransition(async () => {
      const result = await saveSeasonClosureAction(start, end);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setClosure(result.data ?? { start, end });
      toast.success('Sezon kapanışı kaydedildi.');
    });
  };

  const handleClear = () => {
    startTransition(async () => {
      const result = await clearSeasonClosureAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setClosure(null);
      setStart('');
      setEnd('');
      toast.success('Sezon kapanışı kaldırıldı. Tüm tarihler için rezervasyon alınıyor.');
    });
  };

  return (
    <AdminSurface
      title="Sezon kapanışı"
      description="Bu tarihler arasındaki (başlangıç ve bitiş dahil) rezervasyon istekleri otomatik reddedilir. Misafir “Sezon Kapanmıştır” mesajını görür; istek yine de aşağıdaki listede “Reddedildi” olarak görünür."
      actions={
        closure && state ? <StatusPill tone={STATE_TONE[state]}>{STATE_LABEL[state]}</StatusPill> : null
      }
      contentClassName="space-y-4"
    >
      {closure ? (
        <p className="font-body text-charcoal text-sm">
          Kayıtlı aralık:{' '}
          <span className="font-semibold">
            {formatIsoDate(closure.start, 'tr')} – {formatIsoDate(closure.end, 'tr')}
          </span>
        </p>
      ) : (
        <p className="font-body text-muted text-sm">
          Kayıtlı sezon kapanışı yok; tüm tarihler için rezervasyon alınıyor.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="season-start"
          type="date"
          label="Kapanış başlangıcı"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <Input
          id="season-end"
          type="date"
          label="Kapanış bitişi"
          value={end}
          min={start || undefined}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={isPending || !canSave} onClick={handleSave}>
          {isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        {closure && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleClear}
          >
            Kapanışı kaldır
          </Button>
        )}
      </div>
    </AdminSurface>
  );
}
