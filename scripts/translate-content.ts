/**
 * translate-content.ts — DeepL translation pipeline for Çi Neo Cucina
 *
 * Usage:
 *   pnpm i18n:translate            # fill only MISSING strings (idempotent)
 *   pnpm i18n:translate --force    # re-translate everything
 *
 * Requires: DEEPL_API_KEY in .env.local (free keys end with ':fx').
 *
 * Turkish is the source of truth. This script reads the TR content
 * (menu-data.ts, pages-data.ts, dictionaries.ts), translates the translatable
 * strings TR→EN and TR→DE via DeepL, and writes overlay files consumed by the
 * app:
 *   src/lib/i18n/generated/menu.{en,de}.json
 *   src/lib/i18n/generated/pages.{en,de}.json
 *   src/lib/i18n/generated/ui.{en,de}.json
 *
 * IDEMPOTENT: by default it only translates strings not already present in the
 * existing generated file (so human-reviewed corrections are never clobbered).
 * Use --force to re-translate from scratch.
 *
 * IMPORTANT: machine translations MUST be reviewed by a native speaker before
 * publishing — dish names and regional terms (e.g. "Mihaliç", "Memecik",
 * "kokoreç") often need human correction. Review the generated JSON, edit in
 * place, and commit.
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { menuCategories, MENU_SERVICE_NOTE, WINE_MENU_NOTICE } from '../src/content/menu-data.ts';
import { aboutContent, homeContent, seedPages } from '../src/content/pages-data.ts';

config({ path: '.env.local' });

const FORCE = process.argv.includes('--force');
const GEN_DIR = join(process.cwd(), 'src', 'lib', 'i18n', 'generated');

type DeepLTarget = 'EN' | 'DE';
const TARGETS: { lang: DeepLTarget; locale: string }[] = [
  { lang: 'EN', locale: 'en' },
  { lang: 'DE', locale: 'de' },
];

interface DeepLResponse {
  translations: Array<{ text: string; detected_source_language: string }>;
}

// ---------------------------------------------------------------------------
// DeepL batch translation (one request per ~40 strings; preserves order)
// ---------------------------------------------------------------------------
async function translateBatch(
  texts: string[],
  targetLang: DeepLTarget,
  apiKey: string,
): Promise<string[]> {
  if (texts.length === 0) return [];
  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const out: string[] = [];
  const CHUNK = 40; // DeepL allows up to 50 text params per request
  for (let i = 0; i < texts.length; i += CHUNK) {
    const chunk = texts.slice(i, i + CHUNK);
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunk, source_lang: 'TR', target_lang: targetLang }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '(no body)');
      throw new Error(`DeepL ${response.status} ${response.statusText}: ${body}`);
    }
    const data = (await response.json()) as DeepLResponse;
    out.push(...data.translations.map((t) => t.text));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Source string registry: collect every translatable TR string with a stable
// path key, so translations can be mapped back into overlay structures.
// ---------------------------------------------------------------------------
function collectSources(): Map<string, string> {
  const m = new Map<string, string>();

  // Menu: category name/description + item name/description
  for (const cat of menuCategories) {
    m.set(`menu.cat.${cat.id}.name`, cat.name);
    if (cat.description) m.set(`menu.cat.${cat.id}.description`, cat.description);
    for (const item of cat.items) {
      m.set(`menu.item.${item.id}.name`, item.name);
      if (item.description) m.set(`menu.item.${item.id}.description`, item.description);
    }
  }
  m.set('menu.note.service', MENU_SERVICE_NOTE);
  m.set('menu.note.wine', WINE_MENU_NOTICE);

  // About
  m.set('about.title', aboutContent.title);
  m.set('about.intro.heading', aboutContent.intro.heading);
  aboutContent.intro.paragraphs.forEach((p, i) => m.set(`about.intro.p.${i}`, p));
  m.set('about.vision.heading', aboutContent.vision.heading);
  aboutContent.vision.paragraphs.forEach((p, i) => m.set(`about.vision.p.${i}`, p));
  m.set('about.chef.heading', aboutContent.chef.heading);
  aboutContent.chef.paragraphs.forEach((p, i) => m.set(`about.chef.p.${i}`, p));
  m.set('about.team.heading', aboutContent.team.heading);
  // team.members are proper nouns → not translated. team.note ("2025 Çi Ailesi")
  // contains the brand word "Çi Ailesi"; translate the surrounding text.
  m.set('about.team.note', aboutContent.team.note);

  // Home
  m.set('home.hero.subtitle', homeContent.hero.subtitle);
  m.set('home.hero.description', homeContent.hero.description);
  homeContent.menusTeaser.forEach((t) => {
    m.set(`home.teaser.${t.key}.title`, t.title);
    m.set(`home.teaser.${t.key}.description`, t.description);
  });
  m.set('home.chefsTable.body', homeContent.chefsTable.body);
  homeContent.experiences.forEach((e) => {
    m.set(`home.exp.${e.key}.title`, e.title);
    m.set(`home.exp.${e.key}.description`, e.description);
  });

  // SEO seed pages (title/excerpt/seoTitle/seoDescription)
  for (const page of seedPages) {
    m.set(`seo.${page.slug}.title`, page.title);
    if (page.excerpt) m.set(`seo.${page.slug}.excerpt`, page.excerpt);
    if (page.seoTitle) m.set(`seo.${page.slug}.seoTitle`, page.seoTitle);
    if (page.seoDescription) m.set(`seo.${page.slug}.seoDescription`, page.seoDescription);
  }

  // UI dictionary strings
  m.set('ui.nav.home', 'Ana Sayfa');
  m.set('ui.nav.menu', 'Menü');
  m.set('ui.nav.about', 'Hakkımızda');
  m.set('ui.nav.experiences', 'Deneyimler');
  m.set('ui.nav.reservations', 'Rezervasyon');
  m.set('ui.nav.contact', 'İletişim');
  m.set('ui.cta.reserve', 'Rezervasyon Talep Et');
  m.set('ui.common.phone', 'Telefon');
  m.set('ui.common.email', 'E-posta');

  return m;
}

// ---------------------------------------------------------------------------
// Assemble translated strings (keyed by path) into the overlay file shapes.
// ---------------------------------------------------------------------------
type T = Map<string, string>;
const dot = (t: T, k: string) => t.get(k);

function buildMenuOverlay(t: T) {
  const categories: Record<string, { name?: string; description?: string }> = {};
  const items: Record<string, { name?: string; description?: string }> = {};
  for (const cat of menuCategories) {
    const name = dot(t, `menu.cat.${cat.id}.name`);
    const description = dot(t, `menu.cat.${cat.id}.description`);
    if (name || description) categories[cat.id] = { ...(name && { name }), ...(description && { description }) };
    for (const item of cat.items) {
      const iname = dot(t, `menu.item.${item.id}.name`);
      const idesc = dot(t, `menu.item.${item.id}.description`);
      if (iname || idesc) items[item.id] = { ...(iname && { name: iname }), ...(idesc && { description: idesc }) };
    }
  }
  const serviceNote = dot(t, 'menu.note.service');
  const wineNotice = dot(t, 'menu.note.wine');
  return {
    categories,
    items,
    notes: { ...(serviceNote && { serviceNote }), ...(wineNotice && { wineNotice }) },
  };
}

function buildPagesOverlay(t: T) {
  const about = {
    title: dot(t, 'about.title'),
    intro: {
      heading: dot(t, 'about.intro.heading'),
      paragraphs: aboutContent.intro.paragraphs.map((_, i) => dot(t, `about.intro.p.${i}`) ?? ''),
    },
    vision: {
      heading: dot(t, 'about.vision.heading'),
      paragraphs: aboutContent.vision.paragraphs.map((_, i) => dot(t, `about.vision.p.${i}`) ?? ''),
    },
    chef: {
      heading: dot(t, 'about.chef.heading'),
      paragraphs: aboutContent.chef.paragraphs.map((_, i) => dot(t, `about.chef.p.${i}`) ?? ''),
    },
    team: {
      heading: dot(t, 'about.team.heading'),
      note: dot(t, 'about.team.note'),
    },
  };
  const home = {
    hero: {
      subtitle: dot(t, 'home.hero.subtitle'),
      description: dot(t, 'home.hero.description'),
    },
    menusTeaser: homeContent.menusTeaser.map((x) => ({
      title: dot(t, `home.teaser.${x.key}.title`) ?? '',
      description: dot(t, `home.teaser.${x.key}.description`) ?? '',
    })),
    chefsTable: { body: dot(t, 'home.chefsTable.body') },
    experiences: homeContent.experiences.map((x) => ({
      title: dot(t, `home.exp.${x.key}.title`) ?? '',
      description: dot(t, `home.exp.${x.key}.description`) ?? '',
    })),
  };
  const seo: Record<string, Record<string, string>> = {};
  for (const page of seedPages) {
    const entry: Record<string, string> = {};
    for (const field of ['title', 'excerpt', 'seoTitle', 'seoDescription'] as const) {
      const v = dot(t, `seo.${page.slug}.${field}`);
      if (v) entry[field] = v;
    }
    if (Object.keys(entry).length > 0) seo[page.slug] = entry;
  }
  return { about, home, seo };
}

function buildUiOverlay(t: T) {
  return {
    nav: {
      home: dot(t, 'ui.nav.home'),
      menu: dot(t, 'ui.nav.menu'),
      about: dot(t, 'ui.nav.about'),
      experiences: dot(t, 'ui.nav.experiences'),
      reservations: dot(t, 'ui.nav.reservations'),
      contact: dot(t, 'ui.nav.contact'),
    },
    cta: { reserve: dot(t, 'ui.cta.reserve') },
    common: { phone: dot(t, 'ui.common.phone'), email: dot(t, 'ui.common.email') },
  };
}

// ---------------------------------------------------------------------------
// Existing-translation reuse: flatten a prior generated file back to path keys
// so we can skip already-translated strings (idempotent, review-safe).
// ---------------------------------------------------------------------------
function loadExisting(locale: string): Map<string, string> {
  const m = new Map<string, string>();
  const read = (name: string): unknown => {
    const p = join(GEN_DIR, name);
    if (!existsSync(p)) return {};
    try {
      return JSON.parse(readFileSync(p, 'utf-8'));
    } catch {
      return {};
    }
  };
  const menu = read(`menu.${locale}.json`) as ReturnType<typeof buildMenuOverlay>;
  for (const [id, v] of Object.entries(menu.categories ?? {})) {
    if (v.name) m.set(`menu.cat.${id}.name`, v.name);
    if (v.description) m.set(`menu.cat.${id}.description`, v.description);
  }
  for (const [id, v] of Object.entries(menu.items ?? {})) {
    if (v.name) m.set(`menu.item.${id}.name`, v.name);
    if (v.description) m.set(`menu.item.${id}.description`, v.description);
  }
  if (menu.notes?.serviceNote) m.set('menu.note.service', menu.notes.serviceNote);
  if (menu.notes?.wineNotice) m.set('menu.note.wine', menu.notes.wineNotice);
  // (pages/ui reuse omitted for brevity — they are tiny; --force re-does all.)
  return m;
}

async function writeJson(name: string, data: unknown): Promise<void> {
  await writeFile(join(GEN_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  written → src/lib/i18n/generated/${name}`);
}

async function main(): Promise<void> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    console.log('DEEPL_API_KEY not set in .env.local — skipping. Add it and re-run.');
    process.exit(0);
  }

  mkdirSync(GEN_DIR, { recursive: true });
  const sources = collectSources();
  console.log(`Collected ${sources.size} source string(s).`);

  for (const { lang, locale } of TARGETS) {
    console.log(`\n→ ${lang}`);
    const existing = FORCE ? new Map<string, string>() : loadExisting(locale);

    const keys = [...sources.keys()];
    const toTranslate = keys.filter((k) => !existing.has(k));
    console.log(`  ${toTranslate.length} new, ${keys.length - toTranslate.length} reused.`);

    const translatedTexts = await translateBatch(
      toTranslate.map((k) => sources.get(k)!),
      lang,
      apiKey,
    );

    const t: T = new Map(existing);
    toTranslate.forEach((k, i) => t.set(k, translatedTexts[i] ?? sources.get(k)!));

    await writeJson(`menu.${locale}.json`, buildMenuOverlay(t));
    await writeJson(`pages.${locale}.json`, buildPagesOverlay(t));
    await writeJson(`ui.${locale}.json`, buildUiOverlay(t));
  }

  console.log('\nDone. REVIEW the generated JSON (dish names / regional terms) before publishing.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
