'use client';

import { useRef, useState, useTransition } from 'react';

import { AdminSurface, AdminEmptyState } from '@/components/admin/primitives';
import { useToast } from '@/components/admin/Toast';
import { useConfirm } from '@/components/admin/useConfirm';
import { CAPTION_MAX_LENGTH, type AdminGalleryItem } from '@/lib/db/admin/gallery-types';
import { createTeamPhotoAction, updateTeamPhotoAction, deleteTeamPhotoAction } from './actions';

interface TeamClientProps {
  initialItems: AdminGalleryItem[];
}

/**
 * Team-photo manager — the about-page counterpart of the gallery manager. Upload
 * a photo, give it required alt text and an optional ≤40-char caption (the name
 * shown beneath the photo on the about page). Photos can be edited inline or
 * removed.
 */
export function TeamClient({ initialItems }: TeamClientProps) {
  const [items, setItems] = useState<AdminGalleryItem[]>(initialItems);
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  return (
    <div className="space-y-6">
      <UploadForm
        onCreated={(item) => {
          setItems((prev) => [...prev, item]);
          toast.success('Fotoğraf eklendi.');
        }}
        onError={(msg) => toast.error(msg)}
      />

      <AdminSurface
        title="Ekip Fotoğrafları"
        description={`${items.length} fotoğraf — alt metin zorunlu, başlık (fotoğraf altındaki yazı) en fazla ${CAPTION_MAX_LENGTH} karakter ve isteğe bağlıdır.`}
      >
        {items.length === 0 ? (
          <AdminEmptyState
            title="Henüz fotoğraf yok"
            description="Yukarıdaki formdan ilk ekip fotoğrafını yükleyin."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <TeamCard
                key={item.id}
                item={item}
                onSaved={(updated) =>
                  setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
                }
                onDeleted={(id) => setItems((prev) => prev.filter((it) => it.id !== id))}
                confirm={confirm}
                toast={toast}
              />
            ))}
          </ul>
        )}
      </AdminSurface>

      {dialog}
    </div>
  );
}

/* --- Upload form ----------------------------------------------------------- */

interface UploadFormProps {
  onCreated: (item: AdminGalleryItem) => void;
  onError: (message: string) => void;
}

function UploadForm({ onCreated, onError }: UploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createTeamPhotoAction(formData);
      if (result.ok && result.data) {
        onCreated(result.data);
        formRef.current?.reset();
        setFileName('');
        setCaption('');
      } else if (!result.ok) {
        onError(result.error);
      }
    });
  }

  return (
    <AdminSurface
      title="Yeni Fotoğraf"
      description="Bir görsel seçin, görme engelliler için alt metni girin ve isterseniz kısa bir başlık (örn. isim) ekleyin."
    >
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-body text-sm font-semibold text-charcoal">
              Görsel <span className="text-wine">*</span>
            </span>
            <input
              type="file"
              name="file"
              required
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="block w-full cursor-pointer rounded-md border border-stone bg-marble font-body text-sm text-charcoal file:mr-3 file:cursor-pointer file:border-0 file:bg-cream-deep file:px-3 file:py-2 file:font-body file:text-sm file:font-semibold file:text-charcoal"
            />
            {fileName && <span className="mt-1 block truncate text-xs text-muted">{fileName}</span>}
          </label>

          <label className="block">
            <span className="mb-1.5 block font-body text-sm font-semibold text-charcoal">
              Alt metni (erişilebilirlik) <span className="text-wine">*</span>
            </span>
            <input
              type="text"
              name="alt"
              required
              maxLength={300}
              placeholder="Örn. Şef Simge Manacıoğlu ve ekip"
              className="block w-full rounded-md border border-stone bg-marble px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-olive"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between font-body text-sm font-semibold text-charcoal">
            <span>Başlık (fotoğraf altındaki yazı, isteğe bağlı)</span>
            <span className="font-body text-xs font-normal tabular-nums text-muted">
              {caption.length}/{CAPTION_MAX_LENGTH}
            </span>
          </span>
          <input
            type="text"
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
            maxLength={CAPTION_MAX_LENGTH}
            placeholder="Örn. Simge Manacıoğlu"
            className="block w-full rounded-md border border-stone bg-marble px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-olive"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-md bg-olive px-4 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Yükleniyor…' : 'Fotoğrafı Ekle'}
          </button>
        </div>
      </form>
    </AdminSurface>
  );
}

/* --- One photo card (preview + inline edit + delete) ----------------------- */

interface TeamCardProps {
  item: AdminGalleryItem;
  onSaved: (item: AdminGalleryItem) => void;
  onDeleted: (id: string) => void;
  confirm: ReturnType<typeof useConfirm>['confirm'];
  toast: ReturnType<typeof useToast>;
}

function TeamCard({ item, onSaved, onDeleted, confirm, toast }: TeamCardProps) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption ?? '');
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateTeamPhotoAction(item.id, { alt, caption });
      if (result.ok) {
        onSaved({ ...item, alt, caption: caption.trim() === '' ? null : caption.trim() });
        setEditing(false);
        toast.success('Güncellendi.');
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const ok = await confirm({
        title: 'Fotoğrafı sil',
        description: 'Bu fotoğraf ekip galerisinden ve depolamadan kalıcı olarak silinecek.',
        confirmLabel: 'Sil',
        destructive: true,
      });
      if (!ok) return;

      const result = await deleteTeamPhotoAction(item.id);
      if (result.ok) {
        onDeleted(item.id);
        toast.success('Silindi.');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <li className="overflow-hidden rounded-lg border border-stone bg-marble">
      <div className="relative aspect-square bg-cream-deep">
        {/* Admin preview only — plain img avoids next/image host config here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
        {item.caption && !editing && (
          <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-charcoal/70 px-2 py-1 font-body text-xs text-ivory">
            {item.caption}
          </span>
        )}
      </div>

      <div className="space-y-3 p-3">
        {editing ? (
          <>
            <label className="block">
              <span className="mb-1 block font-body text-xs font-semibold text-charcoal">
                Alt metni
              </span>
              <input
                type="text"
                value={alt}
                maxLength={300}
                onChange={(e) => setAlt(e.target.value)}
                className="block w-full rounded-md border border-stone bg-marble px-2.5 py-1.5 font-body text-sm text-charcoal outline-none focus:border-olive"
              />
            </label>
            <label className="block">
              <span className="mb-1 flex items-center justify-between font-body text-xs font-semibold text-charcoal">
                <span>Başlık</span>
                <span className="font-normal tabular-nums text-muted">
                  {caption.length}/{CAPTION_MAX_LENGTH}
                </span>
              </span>
              <input
                type="text"
                value={caption}
                maxLength={CAPTION_MAX_LENGTH}
                onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
                className="block w-full rounded-md border border-stone bg-marble px-2.5 py-1.5 font-body text-sm text-charcoal outline-none focus:border-olive"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-olive px-3 py-1.5 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60"
              >
                {pending ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlt(item.alt);
                  setCaption(item.caption ?? '');
                  setEditing(false);
                }}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md border border-stone px-3 py-1.5 font-body text-sm font-medium text-charcoal transition-colors hover:bg-cream-deep"
              >
                Vazgeç
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="line-clamp-2 font-body text-sm text-charcoal">{item.alt}</p>
            <p className="font-body text-xs text-muted">
              {item.caption ? `Başlık: ${item.caption}` : 'Başlık yok'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex flex-1 items-center justify-center rounded-md border border-stone px-3 py-1.5 font-body text-sm font-medium text-charcoal transition-colors hover:bg-cream-deep"
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-md border border-wine/40 px-3 py-1.5 font-body text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory disabled:opacity-60"
              >
                Sil
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
