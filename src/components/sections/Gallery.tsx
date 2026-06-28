import Image from 'next/image';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { getMediaByContext } from '@/content/media-data';
import { resolveImage } from '@/lib/images';
import { siteConfig } from '@/lib/site-config';

/**
 * Editorial photo gallery (#CiNeoCucina). A simple masonry-ish grid of the
 * imported atmosphere photos. Decorative-but-meaningful: each image keeps its
 * descriptive alt text from the source manifest.
 */
export function Gallery() {
  const items = getMediaByContext('gallery');
  if (items.length === 0) return null;

  return (
    <section className="bg-marble py-section">
      <div className="container-editorial">
        <SectionHeading eyebrow={siteConfig.hashtag} title="Atmosfer" align="center" />

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item, index) => {
            const image = resolveImage(item.id);
            if (!image) return null;
            return (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-md ${
                  index % 5 === 0 ? 'row-span-2 aspect-[3/4]' : 'aspect-[4/3]'
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
