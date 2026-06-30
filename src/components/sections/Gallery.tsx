import Image from 'next/image';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { getGalleryPhotos } from '@/lib/db/gallery';
import { siteConfig } from '@/lib/site-config';

/**
 * Editorial photo gallery (#CiNeoCucina). A uniform grid of the atmosphere
 * photos — equal 4:3 cells so the layout stays tidy regardless of how many
 * images are present. Photos are managed in /admin/gallery (Supabase Storage),
 * with a local hardcoded fallback. Each photo may carry a short caption shown
 * in the bottom-left corner.
 */
export async function Gallery() {
  const photos = await getGalleryPhotos();
  if (photos.length === 0) return null;

  return (
    <section className="bg-marble py-section">
      <div className="container-editorial">
        <SectionHeading eyebrow={siteConfig.hashtag} title="Atmosfer" align="center" />

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-md"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {photo.caption && (
                <>
                  {/* Subtle gradient so the caption stays legible on any photo. */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/65 to-transparent"
                    aria-hidden="true"
                  />
                  <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate font-body text-xs font-medium text-ivory drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:bottom-3 sm:left-3 sm:text-sm">
                    {photo.caption}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
