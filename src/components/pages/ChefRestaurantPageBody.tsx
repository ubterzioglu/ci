import { PageHeader } from '@/components/layout/PageHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { SectionHeading } from '@/components/ui/SectionHeading';
import {
  CHEF_RESTAURANT_DATES,
  CHEF_RESTAURANT_PATH,
  chefRestaurantFaq,
  chefRestaurantIntro,
  chefRestaurantMeta,
  chefRestaurantSections,
  type ContentBlock,
} from '@/content/kas-sef-restorani';
import { articleSchema, faqSchema, webPageSchema } from '@/lib/seo/schema';
import { siteConfig } from '@/lib/site-config';

/**
 * Long-form editorial body for /kas-sef-restorani.
 *
 * Turkish-only and deliberately unlinked from the site navigation, so it is
 * rendered by exactly one route. Structure matters more than decoration here:
 * a single H1, one H2 per section, and the FAQ marked up as a <dl> that mirrors
 * the FAQPage JSON-LD one-for-one — assistants that ignore the structured data
 * still read the same question/answer pairs out of the DOM.
 */

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-charcoal/90 text-lg leading-relaxed">{block.text}</p>;

    case 'quote':
      return (
        <p className="border-olive/40 font-display text-olive border-l-2 pl-5 text-2xl leading-snug">
          {block.text}
        </p>
      );

    case 'list':
      return (
        <ul className="text-charcoal/90 grid gap-2 text-lg leading-relaxed sm:grid-cols-2">
          {block.items.map((item) => (
            <li key={item} className="before:text-terracotta before:mr-2 before:content-['—']">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'questions':
      return (
        <dl className="space-y-5">
          {block.items.map((item) => (
            <div key={item.question}>
              <dt className="font-display text-charcoal text-xl">{item.question}</dt>
              <dd className="text-charcoal/80 mt-1 leading-relaxed">{item.detail}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

export function ChefRestaurantPageBody() {
  const { contact } = siteConfig;
  const pageUrl = new URL(CHEF_RESTAURANT_PATH, siteConfig.url).toString();

  return (
    <>
      <JsonLd
        data={articleSchema({
          headline: chefRestaurantMeta.title,
          description: chefRestaurantMeta.description,
          path: CHEF_RESTAURANT_PATH,
          datePublished: CHEF_RESTAURANT_DATES.published,
          dateModified: CHEF_RESTAURANT_DATES.modified,
        })}
      />
      <JsonLd data={faqSchema(chefRestaurantFaq, pageUrl)} />
      <JsonLd
        data={webPageSchema({
          name: chefRestaurantMeta.seoTitle,
          description: chefRestaurantMeta.description,
          path: CHEF_RESTAURANT_PATH,
          datePublished: CHEF_RESTAURANT_DATES.published,
          dateModified: CHEF_RESTAURANT_DATES.modified,
        })}
      />

      <PageHeader eyebrow={chefRestaurantMeta.eyebrow} title={chefRestaurantMeta.heading} />

      <article>
        <section className="bg-marble pb-section">
          <div className="container-editorial">
            <div className="mx-auto max-w-2xl space-y-5">
              {chefRestaurantIntro.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="text-charcoal/90 text-lg leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mx-auto mt-16 max-w-2xl space-y-16">
              {chefRestaurantSections.map((section) => (
                <section key={section.id} id={section.id} className="space-y-6">
                  <SectionHeading title={section.heading} as="h2" align="left" />
                  {section.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </section>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ — mirrors the FAQPage JSON-LD above. Keep the two in sync. */}
        <section className="bg-cream-deep py-section">
          <div className="container-editorial">
            <SectionHeading eyebrow="Sık Sorulan Sorular" title="Merak edilenler" align="center" />
            <dl className="mx-auto mt-12 max-w-2xl space-y-8">
              {chefRestaurantFaq.map((item) => (
                <div key={item.question}>
                  <dt className="font-display text-charcoal text-2xl">{item.question}</dt>
                  <dd className="text-charcoal/85 mt-2 leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Contact block — values come from siteConfig so NAP stays consistent. */}
        <section className="bg-charcoal py-section text-ivory">
          <div className="container-editorial mx-auto max-w-2xl text-center">
            <p className="eyebrow text-terracotta">Ziyaret edin</p>
            <h2 className="font-display text-ivory mt-3 text-3xl">
              {siteConfig.name} by Mezetaryen
            </h2>
            {contact.address && (
              <p className="text-ivory/85 mt-4 leading-relaxed">{contact.address}</p>
            )}
            <p className="mt-2">
              <a
                href={`tel:${contact.phoneE164}`}
                className="text-ivory/85 hover:text-ivory transition-colors"
              >
                {contact.phoneDisplay}
              </a>
            </p>
          </div>
        </section>
      </article>
    </>
  );
}

export default ChefRestaurantPageBody;
