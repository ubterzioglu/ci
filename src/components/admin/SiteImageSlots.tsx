'use client';

import { useRef, useState, useTransition } from 'react';

import { AdminSurface } from '@/components/admin/primitives';
import { useToast } from '@/components/admin/Toast';
import { replaceSiteImageAction } from '@/app/admin/(panel)/site-image-actions';
import type { SiteImageSlotView } from '@/lib/media/site-image-slots';

/**
 * The page's fixed images — the ones that are not a gallery.
 *
 * Each slot is a single position on the public site, so there is no adding or
 * reordering here: you replace what is there. Every card says where its image
 * shows up, because several of them appear in more than one place and that is
 * not obvious from the picture alone.
 */
export function SiteImageSlots({ slots }: { slots: SiteImageSlotView[] }) {
  const [items, setItems] = useState(slots);

  if (items.length === 0) return null;

  return (
    <AdminSurface
      title="Sayfa Görselleri"
      description="Bu sayfadaki sabit görseller. Yenisini yüklediğinizde eskisinin yerini alır; hiç dokunmazsanız sitede kurulumla gelen görsel kalır."
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((slot) => (
          <SlotCard
            key={slot.id}
            slot={slot}
            onReplaced={(updated) =>
              setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
            }
          />
        ))}
      </ul>
    </AdminSurface>
  );
}

function SlotCard({
  slot,
  onReplaced,
}: {
  slot: SiteImageSlotView;
  onReplaced: (slot: SiteImageSlotView) => void;
}) {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState('');
  const [alt, setAlt] = useState(slot.alt);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('slotId', slot.id);

    startTransition(async () => {
      const result = await replaceSiteImageAction(formData);
      if (result.ok && result.data) {
        onReplaced(result.data);
        formRef.current?.reset();
        setFileName('');
        toast.success(`${slot.label} güncellendi.`);
      } else if (!result.ok) {
        toast.error(result.error);
      }
    });
  }

  return (
    <li className="border-stone bg-marble overflow-hidden rounded-lg border">
      <div className={`bg-cream-deep relative ${slot.aspectClassName}`}>
        {slot.url ? (
          <>
            {/* Admin preview only — a plain img avoids next/image host config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.url} alt={slot.alt} className="h-full w-full object-cover" />
            {!slot.isCustom && (
              <span className="bg-charcoal/70 text-ivory font-body absolute top-2 left-2 rounded px-2 py-1 text-[11px]">
                Kurulum görseli
              </span>
            )}
          </>
        ) : (
          <div className="text-muted font-body flex h-full items-center justify-center text-xs">
            Görsel yok
          </div>
        )}
      </div>

      <div className="space-y-3 p-3">
        <div>
          <p className="font-display text-charcoal text-base">{slot.label}</p>
          <p className="font-body text-muted mt-0.5 text-xs leading-5">{slot.appearsOn}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-2.5">
          <label className="block">
            <span className="text-muted font-body mb-1 block text-[11px] font-semibold">
              Yeni görsel
            </span>
            <input
              type="file"
              name="file"
              required
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="border-stone bg-marble font-body text-charcoal file:bg-cream-deep file:font-body file:text-charcoal block w-full cursor-pointer rounded-md border text-xs file:mr-2 file:cursor-pointer file:border-0 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold"
            />
            {fileName && (
              <span className="text-muted mt-1 block truncate text-[11px]">{fileName}</span>
            )}
          </label>

          <label className="block">
            <span className="text-muted font-body mb-1 block text-[11px] font-semibold">
              Alt metni (erişilebilirlik)
            </span>
            <input
              type="text"
              name="alt"
              required
              maxLength={300}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Görseli kısaca tarif edin"
              className="border-stone bg-marble font-body text-charcoal focus:border-olive block w-full rounded-md border px-2.5 py-1.5 text-sm outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="bg-olive hover:bg-olive-deep text-ivory font-body inline-flex w-full items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Yükleniyor…' : 'Görseli Değiştir'}
          </button>
        </form>
      </div>
    </li>
  );
}
