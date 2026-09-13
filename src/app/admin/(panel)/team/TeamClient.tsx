'use client';

import { PhotoLibrary, type PhotoLibraryCopy } from '@/components/admin/PhotoLibrary';
import type { AdminGalleryItem } from '@/lib/db/admin/gallery-types';
import { createTeamPhotoAction, updateTeamPhotoAction, deleteTeamPhotoAction } from './actions';

interface TeamClientProps {
  initialItems: AdminGalleryItem[];
}

const COPY: PhotoLibraryCopy = {
  listTitle: 'Ekip Fotoğrafları',
  emptyDescription: 'Yukarıdaki formdan ilk ekip fotoğrafını yükleyin.',
  uploadDescription:
    'Bir görsel seçin, görme engelliler için alt metni girin ve isterseniz kısa bir başlık (örn. isim) ekleyin.',
  altPlaceholder: 'Örn. Şef Simge Manacıoğlu ve ekip',
  captionNoun: 'Başlık',
  captionHint: 'fotoğraf altındaki yazı',
  captionPlaceholder: 'Örn. Simge Manacıoğlu',
  deleteDescription: 'Bu fotoğraf ekip galerisinden ve depolamadan kalıcı olarak silinecek.',
};

/**
 * Team-photo manager — the about-page counterpart of the gallery manager. Same
 * upload / inline-edit / delete panel (the shared PhotoLibrary), bound here to
 * the about-context server actions and its own wording.
 */
export function TeamClient({ initialItems }: TeamClientProps) {
  return (
    <PhotoLibrary
      initialItems={initialItems}
      actions={{
        create: createTeamPhotoAction,
        update: updateTeamPhotoAction,
        remove: deleteTeamPhotoAction,
      }}
      copy={COPY}
      aspectClassName="aspect-square"
    />
  );
}
