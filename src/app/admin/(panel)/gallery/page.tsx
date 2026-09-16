import { AdminPageHeader } from '@/components/admin/primitives';
import { SiteImageSlots } from '@/components/admin/SiteImageSlots';
import { listGalleryItems } from '@/lib/db/admin/gallery';
import { listSiteImageSlots } from '@/lib/db/admin/site-images';
import { GalleryClient } from './GalleryClient';

/**
 * Everything editable on the public HOME page: the "Atmosfer" photo gallery
 * plus the page's fixed images.
 *
 * The panel is organised by public page rather than by kind of photo, because
 * the old split ("Galeri" / "Ekip") never said which page it fed — and the
 * gallery's own heading on the site reads "Atmosfer", not "Galeri".
 */
export default async function HomeImagesPage() {
  const [items, slots] = await Promise.all([listGalleryItems(), listSiteImageSlots('home')]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Ana Sayfa"
        title="Ana Sayfa Görselleri"
        description='Ana sayfada görünen fotoğraflar. "Atmosfer" bölümündeki galeriye fotoğraf ekleyebilir, sayfanın sabit görsellerini değiştirebilirsiniz.'
      />

      <p className="font-body text-muted mb-6 text-sm">
        Buradaki değişiklikler{' '}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-olive font-semibold underline-offset-2 hover:underline"
        >
          ana sayfada
        </a>{' '}
        görünür.
      </p>

      <div className="space-y-6">
        <SiteImageSlots slots={slots} />
        <GalleryClient initialItems={items} />
      </div>
    </>
  );
}
