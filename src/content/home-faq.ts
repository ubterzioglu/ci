import type { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Question/answer pairs shown on the home page and mirrored one-for-one in its
 * FAQPage JSON-LD. Reuses the already-translated about + experiences FAQ
 * strings so the visible text and the markup can never drift apart.
 */
export function getHomeFaq(locale: Locale): FaqItem[] {
  const { about, experiences } = getDictionary(locale).faq;

  return [
    { question: about.q1, answer: about.a1 },
    { question: about.q2, answer: about.a2 },
    { question: about.q3, answer: about.a3 },
    { question: experiences.q1, answer: experiences.a1 },
    { question: experiences.q2, answer: experiences.a2 },
  ];
}
