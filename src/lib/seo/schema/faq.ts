/**
 * FAQPage schema. This is the highest-leverage markup on an editorial page:
 * Google AI Overviews, ChatGPT and Perplexity lift question/answer pairs
 * straight out of it, so every `answer` must stand on its own without the
 * surrounding prose.
 *
 * Google only honours one FAQPage per URL — never emit this twice on a page.
 */
export function faqSchema(
  items: readonly { question: string; answer: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
