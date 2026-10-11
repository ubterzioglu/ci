import { SectionHeading } from '@/components/ui/SectionHeading';
import type { FaqItem } from '@/content/home-faq';

interface FaqSectionProps {
  title: string;
  items: readonly FaqItem[];
}

/**
 * Home-page FAQ. Rendered as a <dl> that mirrors the page's FAQPage JSON-LD
 * one-for-one (see HomePageBody) — Google only honours FAQ markup whose
 * questions and answers are visible on the page, and assistants that skip
 * structured data still read the same pairs out of the DOM.
 */
export function FaqSection({ title, items }: FaqSectionProps) {
  return (
    <section className="bg-marble border-stone-soft py-section border-t">
      <div className="container-editorial max-w-3xl">
        <SectionHeading title={title} />

        <dl className="mt-10 space-y-8">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-charcoal text-xl">{item.question}</dt>
              <dd className="text-charcoal/90 mt-2 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default FaqSection;
