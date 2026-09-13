'use client';

import { PhotoLibrary, type PhotoLibraryCopy } from '@/components/admin/PhotoLibrary';
import type { AdminGalleryItem } from '@/lib/db/admin/gallery-types';
import {
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
} from './actions';

interface GalleryClientProps {
  initialItems: AdminGalleryItem[];
}

const COPY: PhotoLibraryCopy = {
  listTitle: 'Galeri Fotoğrafları',
  emptyDescription: 'Yukarıdaki formdan ilk Atmosfer fotoğrafını yükleyin.',
  uploadDescription:
    'Bir görsel seçin, görme engelliler için alt metni girin ve isterseniz kısa bir açıklama ekleyin.',
  altPlaceholder: 'Örn. Bahçede şarap ve mevsim tabağı',
  captionNoun: 'Açıklama',
  captionHint: 'sol alt köşe yazısı',
  captionPlaceholder: 'Örn. Bahçe katı',
  deleteDescription: 'Bu fotoğraf galeriden ve depolamadan kalıcı olarak silinecek.',
};

/**
 * Gallery manager. Upload "Atmosfer" photos, give each an alt text (required)
 * and an optional ≤40-char caption that shows in the bottom-left corner on the
 * public site. The panel itself is the shared PhotoLibrary — this file only
 * binds the gallery-context server actions and wording.
 */
export function GalleryClient({ initialItems }: GalleryClientProps) {
  return (
    <PhotoLibrary
      initialItems={initialItems}
      actions={{
        create: createGalleryItemAction,
        update: updateGalleryItemAction,
        remove: deleteGalleryItemAction,
      }}
      copy={COPY}
      aspectClassName="aspect-[4/3]"
    />
  );
}
