import assert from 'node:assert/strict';
import test from 'node:test';

import { getHomeFaq } from '../src/content/home-faq';
import { HOME_DATES } from '../src/content/pages-data';
import { locales } from '../src/lib/i18n/config';
import { siteConfig } from '../src/lib/site-config';
import {
  buildAiFaq,
  buildAiService,
  buildAiSummary,
  buildAiTxt,
} from '../src/lib/seo/ai-discovery';
import { buildAtomFeed } from '../src/lib/seo/feed';
import { buildLlmsFullTxt, buildLlmsTxt } from '../src/lib/seo/llms-txt';
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

test('AI discovery files are generated from site facts and stay in sync', () => {
  const summary = buildAiSummary();
  assert.equal(summary.name, siteConfig.name);
  assert.equal(summary.contact.phone, siteConfig.contact.phoneDisplay);
  assert.equal(summary.lastUpdated, HOME_DATES.modified);
  assert.ok(summary.profiles.length > 0);

  const faq = buildAiFaq();
  for (const locale of locales) {
    assert.deepEqual(faq.faq[locale], getHomeFaq(locale), locale);
  }
  JSON.parse(JSON.stringify(faq));

  const txt = buildAiTxt();
  assert.match(txt, /^User-Agent: \*$/m);
  assert.match(txt, /^Disallow: \/admin\/$/m);
  assert.ok(txt.includes('/ai/summary.json') && txt.includes('/ai/faq.json'));
});

test('audit-facing endpoints expose the shapes crawlers read', () => {
  const faq = buildAiFaq();
  assert.equal(faq.faqs.length, 5);
  assert.ok(faq.faqs.every((f) => f.question.length >= 10 && f.answer.length >= 20));

  const service = buildAiService();
  assert.ok(service.name.length >= 3 && service.capabilities.length > 0);

  const full = buildLlmsFullTxt();
  assert.ok(full.startsWith(buildLlmsTxt()));
  assert.ok(full.includes('## FAQ (EN)'));

  const feed = buildAtomFeed();
  assert.match(feed, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/);
  assert.equal((feed.match(/<entry>/g) ?? []).length, 2);
  assert.ok(feed.includes(`<updated>${HOME_DATES.modified}T00:00:00Z</updated>`));
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
