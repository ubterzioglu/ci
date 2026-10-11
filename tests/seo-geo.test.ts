import assert from 'node:assert/strict';
import test from 'node:test';

import { getHomeFaq } from '../src/content/home-faq';
import { HOME_DATES } from '../src/content/pages-data';
import { locales } from '../src/lib/i18n/config';
import { buildLlmsTxt } from '../src/lib/seo/llms-txt';
import { buildPageMetadata } from '../src/lib/seo/page-metadata';
import { faqSchema, webPageSchema } from '../src/lib/seo/schema';

test('llms.txt lists pages and profiles as markdown links and states a date', () => {
  const body = buildLlmsTxt();
  const links = body.match(/\]\(https:\/\/[^)]+\)/g) ?? [];

  assert.ok(links.length >= 10, `expected at least 10 markdown links, got ${links.length}`);
  assert.match(
    body,
    /- \[Menu \(TR\)\]\(https:\/\/[^)]+\/menu\) — also \[EN\]\(https:\/\/[^)]+\/en\/menu\)/,
  );
  assert.match(body, /- \[Instagram\]\(https:\/\/www\.instagram\.com\//);
  assert.ok(body.includes(`Last updated: ${HOME_DATES.modified}`));
});

test('home FAQ has five non-empty pairs in every locale', () => {
  for (const locale of locales) {
    const faq = getHomeFaq(locale);
    assert.equal(faq.length, 5, locale);
    for (const item of faq) {
      assert.ok(item.question.trim() && item.answer.trim(), `${locale}: empty FAQ entry`);
    }
    const schema = faqSchema(faq, 'https://example.com/') as { mainEntity: unknown[] };
    assert.equal(schema.mainEntity.length, 5);
  }
});

test('webPageSchema only references #article / #faq when asked to', () => {
  const plain = webPageSchema({ name: 'x', description: 'y', path: '/' });
  assert.equal(plain.mainEntity, undefined);
  assert.equal(plain.hasPart, undefined);

  const chef = webPageSchema({
    name: 'x',
    description: 'y',
    path: '/kas-sef-restorani',
    hasArticle: true,
    hasFaq: true,
    dateModified: '2026-09-28',
  });
  assert.deepEqual(chef.mainEntity, { '@id': `${chef.url}#article` });
  assert.deepEqual(chef.hasPart, { '@id': `${chef.url}#faq` });
  assert.equal(chef.dateModified, '2026-09-28');
});

test('only the home page metadata carries article:modified_time', () => {
  assert.deepEqual(buildPageMetadata('/', 'en').other, {
    'article:modified_time': HOME_DATES.modified,
  });
  assert.equal(buildPageMetadata('/menu', 'en').other, undefined);
});
