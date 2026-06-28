import { SectionHeading } from '@/components/ui/SectionHeading';

/**
 * Standard interior-page header. Provides the top padding needed to clear the
 * fixed site header and renders a consistent title + optional intro.
 */
export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="bg-marble pt-28 pb-10 md:pt-36">
      <div className="container-editorial text-center">
        <SectionHeading eyebrow={eyebrow} title={title} as="h1" align="center" />
        {intro && (
          <p className="text-muted mx-auto mt-5 max-w-2xl text-lg leading-relaxed">{intro}</p>
        )}
      </div>
    </header>
  );
}

export default PageHeader;
