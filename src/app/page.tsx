import { Hero } from '@/components/sections/Hero';
import { StorySection } from '@/components/sections/StorySection';
import { MenuPreview } from '@/components/sections/MenuPreview';
import { ReservationCTA } from '@/components/sections/ReservationCTA';
import { Gallery } from '@/components/sections/Gallery';
import { ContactSection } from '@/components/sections/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { getMenu } from '@/lib/db/menu';
import { menuSchema } from '@/lib/seo/schema';

export default async function HomePage() {
  // Fetched for JSON-LD; the visual preview uses the static teasers.
  const menu = await getMenu();

  return (
    <>
      <JsonLd data={menuSchema(menu)} />
      <Hero />
      <StorySection />
      <MenuPreview />
      <ReservationCTA />
      <Gallery />
      <ContactSection />
    </>
  );
}
