'use client';

import { useRef, useState, useTransition } from 'react';

import { AdminSurface, AdminEmptyState } from '@/components/admin/primitives';
import { useToast } from '@/components/admin/Toast';
import { useConfirm } from '@/components/admin/useConfirm';
import { CAPTION_MAX_LENGTH, type AdminGalleryItem } from '@/lib/db/admin/gallery-types';
import type { ActionResult } from '@/lib/types';

/**
 * Shared photo-library panel behind /admin/gallery and /admin/team.
 *
 * Both panels manage rows of public.media_assets that differ only by context
 * tag ('gallery' vs 'about'), so the data layer is already context-parametric
 * (see lib/db/admin/gallery.ts). This component is the UI counterpart: the
 * upload form, inline alt/caption editing and delete flow live here once, and
 * each panel supplies its own server actions plus its own Turkish wording.
 */

/** The three server actions a photo panel binds to its own media context. */
export interface PhotoLibraryActions {
  create: (formData: FormData) => Promise<ActionResult<AdminGalleryItem>>;
  update: (id: string, input: { alt: string; caption: string }) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
}

/**
 * Panel-specific Turkish wording. The caption field is named differently per
 * panel ("Açıklama" on the gallery, "Başlık" on the team page), so the noun and
 * its hint are supplied once and reused across every label that mentions it.
 */
export interface PhotoLibraryCopy {
  /** Heading above the photo list, e.g. "Galeri Fotoğrafları". */
  listTitle: string;
  /** Empty-state body, e.g. "Yukarıdaki formdan ilk Atmosfer fotoğrafını yükleyin." */
  emptyDescription: string;
  /** Upload-form body sentence. */
  uploadDescription: string;
  /** Example alt text shown as the input placeholder. */
  altPlaceholder: string;
  /** Caption noun, capitalised — "Açıklama" or "Başlık". */
  captionNoun: string;
  /** Where the caption shows up, e.g. "sol alt köşe yazısı". */
  captionHint: string;
  /** Example caption shown as the input placeholder. */
  captionPlaceholder: string;
  /** Confirm-dialog body shown before deleting a photo. */
  deleteDescription: string;
}

interface PhotoLibraryProps {
  initialItems: AdminGalleryItem[];
  actions: PhotoLibraryActions;
  copy: PhotoLibraryCopy;
  /** Tailwind aspect ratio for the card preview (gallery is 4/3, team square). */
  aspectClassName: string;
}

const fieldCls =
  'block w-full rounded-md border border-stone bg-marble px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-olive';

const compactFieldCls =
  'block w-full rounded-md border border-stone bg-marble px-2.5 py-1.5 font-body text-sm text-charcoal outline-none focus:border-olive';

const primaryBtnCls =
  'inline-flex items-center justify-center rounded-md bg-olive px-4 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:cursor-not-allowed disabled:opacity-60';

const compactPrimaryBtnCls =
  'inline-flex flex-1 items-center justify-center rounded-md bg-olive px-3 py-1.5 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:opacity-60';

const secondaryBtnCls =
  'inline-flex items-center justify-center rounded-md border border-stone px-3 py-1.5 font-body text-sm font-medium text-charcoal transition-colors hover:bg-cream-deep';

const destructiveBtnCls =
  'inline-flex items-center justify-center rounded-md border border-wine/40 px-3 py-1.5 font-body text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-ivory disabled:opacity-60';

export function PhotoLibrary({ initialItems, actions, copy, aspectClassName }: PhotoLibraryProps) {
  const [items, setItems] = useState<AdminGalleryItem[]>(initialItems);
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  return (
    <div className="space-y-6">
      <UploadForm
        create={actions.create}
        copy={copy}
        onCreated={(item) => {
          setItems((prev) => [...prev, item]);
          toast.success('Fotoğraf eklendi.');
        }}
        onError={(msg) => toast.error(msg)}
      />

      <AdminSurface
        title={copy.listTitle}
        description={`${items.length} fotoğraf — alt metin zorunlu, ${copy.captionNoun.toLocaleLowerCase('tr-TR')} (${copy.captionHint}) en fazla ${CAPTION_MAX_LENGTH} karakter ve isteğe bağlıdır.`}
      >
        {items.length === 0 ? (
          <AdminEmptyState title="Henüz fotoğraf yok" description={copy.emptyDescription} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <PhotoCard
                key={item.id}
                item={item}
                actions={actions}
                copy={copy}
                aspectClassName={aspectClassName}
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
  create: PhotoLibraryActions['create'];
  copy: PhotoLibraryCopy;
  onCreated: (item: AdminGalleryItem) => void;
  onError: (message: string) => void;
}

function UploadForm({ create, copy, onCreated, onError }: UploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await create(formData);
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
    <AdminSurface title="Yeni Fotoğraf" description={copy.uploadDescription}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-body text-charcoal mb-1.5 block text-sm font-semibold">
              Görsel <span className="text-wine">*</span>
            </span>
            <input
              type="file"
              name="file"
              required
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="border-stone bg-marble font-body text-charcoal file:bg-cream-deep file:font-body file:text-charcoal block w-full cursor-pointer rounded-md border text-sm file:mr-3 file:cursor-pointer file:border-0 file:px-3 file:py-2 file:text-sm file:font-semibold"
            />
            {fileName && <span className="text-muted mt-1 block truncate text-xs">{fileName}</span>}
          </label>

          <label className="block">
            <span className="font-body text-charcoal mb-1.5 block text-sm font-semibold">
              Alt metni (erişilebilirlik) <span className="text-wine">*</span>
            </span>
            <input
              type="text"
              name="alt"
              required
              maxLength={300}
              placeholder={copy.altPlaceholder}
              className={fieldCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="font-body text-charcoal mb-1.5 flex items-center justify-between text-sm font-semibold">
            <span>
              {copy.captionNoun} ({copy.captionHint}, isteğe bağlı)
            </span>
            <span className="font-body text-muted text-xs font-normal tabular-nums">
              {caption.length}/{CAPTION_MAX_LENGTH}
            </span>
          </span>
          <input
            type="text"
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
            maxLength={CAPTION_MAX_LENGTH}
            placeholder={copy.captionPlaceholder}
            className={fieldCls}
          />
        </label>

        <div className="flex justify-end">
          <button type="submit" disabled={pending} className={primaryBtnCls}>
            {pending ? 'Yükleniyor…' : 'Fotoğrafı Ekle'}
          </button>
        </div>
      </form>
    </AdminSurface>
  );
}

/* --- One photo card (preview + inline edit + delete) ----------------------- */

interface PhotoCardProps {
  item: AdminGalleryItem;
  actions: PhotoLibraryActions;
  copy: PhotoLibraryCopy;
  aspectClassName: string;
  onSaved: (item: AdminGalleryItem) => void;
  onDeleted: (id: string) => void;
  confirm: ReturnType<typeof useConfirm>['confirm'];
  toast: ReturnType<typeof useToast>;
}

function PhotoCard({
  item,
  actions,
  copy,
  aspectClassName,
  onSaved,
  onDeleted,
  confirm,
  toast,
}: PhotoCardProps) {
  const [editing, setEditing] = useState(false);
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption ?? '');
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await actions.update(item.id, { alt, caption });
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
        description: copy.deleteDescription,
        confirmLabel: 'Sil',
        destructive: true,
      });
      if (!ok) return;

      const result = await actions.remove(item.id);
      if (result.ok) {
        onDeleted(item.id);
        toast.success('Silindi.');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <li className="border-stone bg-marble overflow-hidden rounded-lg border">
      <div className={`relative ${aspectClassName} bg-cream-deep`}>
        {/* Admin preview only — plain img avoids next/image host config here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt} className="h-full w-full object-cover" />
        {item.caption && !editing && (
          <span className="bg-charcoal/70 font-body text-ivory absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded px-2 py-1 text-xs">
            {item.caption}
          </span>
        )}
      </div>

      <div className="space-y-3 p-3">
        {editing ? (
          <>
            <label className="block">
              <span className="font-body text-charcoal mb-1 block text-xs font-semibold">
                Alt metni
              </span>
              <input
                type="text"
                value={alt}
                maxLength={300}
                onChange={(e) => setAlt(e.target.value)}
                className={compactFieldCls}
              />
            </label>
            <label className="block">
              <span className="font-body text-charcoal mb-1 flex items-center justify-between text-xs font-semibold">
                <span>{copy.captionNoun}</span>
                <span className="text-muted font-normal tabular-nums">
                  {caption.length}/{CAPTION_MAX_LENGTH}
                </span>
              </span>
              <input
                type="text"
                value={caption}
                maxLength={CAPTION_MAX_LENGTH}
                onChange={(e) => setCaption(e.target.value.slice(0, CAPTION_MAX_LENGTH))}
                className={compactFieldCls}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className={compactPrimaryBtnCls}
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
                className={secondaryBtnCls}
              >
                Vazgeç
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="font-body text-charcoal line-clamp-2 text-sm">{item.alt}</p>
            <p className="font-body text-muted text-xs">
              {item.caption ? `${copy.captionNoun}: ${item.caption}` : `${copy.captionNoun} yok`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={`flex-1 ${secondaryBtnCls}`}
              >
                Düzenle
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className={destructiveBtnCls}
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
