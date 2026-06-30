import { AdminPageHeader } from '@/components/admin/primitives';
import { listGalleryItems } from '@/lib/db/admin/gallery';
import { GalleryClient } from './GalleryClient';

export default async function GalleryPage() {
  const items = await listGalleryItems();

  return (
    <>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Galeri (Atmosfer)"
        description="Ana sayfadaki #CiNeoCucina galerisine fotoğraf ekleyin; her fotoğrafa sol alt köşede görünecek kısa bir yazı ekleyebilirsiniz."
      />
      <GalleryClient initialItems={items} />
    </>
  );
}
