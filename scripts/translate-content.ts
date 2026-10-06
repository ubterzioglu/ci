/**
 * translate-content.ts — DeepL translation pipeline for Çi Neo Cucina
 *
 * Usage:
 *   pnpm i18n:translate                 # fill MISSING / still-Turkish strings
 *   pnpm i18n:translate --force         # re-translate everything
 *   pnpm i18n:translate --locale=de     # one target locale only
 *   pnpm i18n:translate --dry-run       # show what would be sent, no API calls
 *
 * Requires: DEEPL_API_KEY in .env.local (free keys end with ':fx').
 *
 * Turkish is the source of truth. This script reads the TR content
 * (menu-data.ts, pages-data.ts, dictionaries.ts), translates every translatable
 * string TR→EN-GB/DE/RU/FR via DeepL, and writes overlay files consumed by the app:
 *   src/lib/i18n/generated/menu.{en,de,ru,fr}.json
 *   src/lib/i18n/generated/pages.{en,de,ru,fr}.json
 *   src/lib/i18n/generated/ui.{en,de,ru,fr}.json
 *
 * The UI dictionary is flattened GENERICALLY from `dictionaries.tr`, so a key
 * added to the Turkish dictionary is picked up without touching this script.
 *
 * REUSE: menu and ui strings already present in the generated files are kept
 * (so human-reviewed corrections survive), unless they look untranslated — i.e.
 * identical to the Turkish source or still containing Turkish-only letters
 * (ğ ş ı İ). Page copy is small and always re-translated.
 *
 * Brand and person names (Çi, Kaş, Mihaliç, Simge Manacıoğlu, …) and `{placeholders}`
 * are shielded from DeepL with <x> ignore-tags.
 *
 * IMPORTANT: machine translations MUST be reviewed by a native speaker before
 * publishing — dish names and regional terms often need human correction.
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { menuCategories, MENU_SERVICE_NOTE, WINE_MENU_NOTICE } from '../src/content/menu-data.ts';
import { aboutContent, homeContent, seedPages } from '../src/content/pages-data.ts';
import { dictionaries } from '../src/lib/i18n/dictionaries.ts';

config({ path: '.env.local' });

const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_LOCALE = process.argv.find((a) => a.startsWith('--locale='))?.split('=')[1];
const GEN_DIR = join(process.cwd(), 'src', 'lib', 'i18n', 'generated');

type DeepLTarget = 'EN-GB' | 'DE' | 'RU' | 'FR';
const TARGETS: { lang: DeepLTarget; locale: string }[] = [
  { lang: 'EN-GB', locale: 'en' },
  { lang: 'DE', locale: 'de' },
  { lang: 'RU', locale: 'ru' },
  { lang: 'FR', locale: 'fr' },
];

/** Terms DeepL must leave untouched (longest first so overlaps resolve right). */
const PROTECTED_TERMS = [
  'Çi Neo Cucina',
  'Çi Ailesi',
  'Chef’s Table',
  "Chef's Table",
  'Simge Manacıoğlu',
  'Tolga Manacıoğlu',
  'Çağıl İda',
  'Lisa Rose',
  'Sumanu Şarap Evi',
  'Mezeteryan',
  'Mihaliç',
  'Memecik',
  'kokoreç',
  'Kargı',
  'Çorum',
  'hibeş',
  'Çi',
  'UNDP',
  'WWF',
].sort((a, b) => b.length - a.length);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PROTECT_RE = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${PROTECTED_TERMS.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}])|\\{[a-zA-Z]+\\}`,
  'gu',
);

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xmlUnescape = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

function shield(text: string): string {
  return xmlEscape(text).replace(PROTECT_RE, (m) => `<x>${m}</x>`);
}
function unshield(text: string): string {
  return xmlUnescape(text.replace(/<\/?x>/g, ''));
}

/**
 * DeepL sometimes drops the space in front of an ignore-tag ("« nouvelle »Kaş").
 * If the Turkish source had `<space><term>`, make sure the translation does too.
 */
function restoreSpaces(source: string, translated: string): string {
  let result = translated;
  for (const term of PROTECTED_TERMS) {
    if (!source.includes(` ${term}`)) continue;
    const glued = new RegExp(
      `([»”"\\)\\p{L}\\p{N}])(${escapeRegExp(term)})(?![\\p{L}\\p{N}])`,
      'gu',
    );
    result = result.replace(glued, '$1 $2');
  }
  return result;
}

const TURKISH_ONLY = /[ğışİĞŞ]/;

/** True when a stored translation still looks like untranslated Turkish. */
function looksUntranslated(source: string, value: string): boolean {
  const protectedStripped = value.replace(PROTECT_RE, '');
  if (TURKISH_ONLY.test(protectedStripped)) return true;
  return value === source && (TURKISH_ONLY.test(source) || source.length > 20);
}

interface DeepLResponse {
  translations: Array<{ text: string; detected_source_language: string }>;
}

/**
 * Turkish has no grammatical gender, so DeepL guesses pronouns. The chef bio is
 * about a woman (Simge Manacıoğlu: "eşi", "kızı") — tell DeepL so it uses
 * she/elle/sie/она instead of he/il/er/он. Context text is not translated or billed.
 */
const CHEF_CONTEXT =
  'Simge Manacıoğlu is a woman, a female chef. Refer to her with feminine forms and pronouns (she/her, elle, sie, она).';

function contextFor(key: string): string | undefined {
  return key.startsWith('about.chef.') ||
    key.startsWith('about.team.') ||
    key.startsWith('ui.faq.about.')
    ? CHEF_CONTEXT
    : undefined;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// DeepL batch translation (one request per ~40 strings; preserves order)
// ---------------------------------------------------------------------------
async function translateBatch(
  texts: string[],
  targetLang: DeepLTarget,
  apiKey: string,
  context?: string,
): Promise<string[]> {
  if (texts.length === 0) return [];
  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const out: string[] = [];
  const CHUNK = 40; // DeepL allows up to 50 text params per request
  for (let i = 0; i < texts.length; i += CHUNK) {
    const chunk = texts.slice(i, i + CHUNK).map(shield);
    const data = await postWithRetry(baseUrl, apiKey, {
      text: chunk,
      source_lang: 'TR',
      target_lang: targetLang,
      tag_handling: 'xml',
      ignore_tags: ['x'],
      preserve_formatting: true,
      ...(context && { context }),
    });
    out.push(...data.translations.map((t, j) => restoreSpaces(texts[i + j]!, unshield(t.text))));
  }
  return out;
}

async function postWithRetry(
  url: string,
  apiKey: string,
  payload: Record<string, unknown>,
): Promise<DeepLResponse> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) return (await response.json()) as DeepLResponse;

    if (response.status === 456) {
      throw new Error('DeepL quota exhausted (HTTP 456). Re-run after the monthly reset.');
    }
    const retryable = response.status === 429 || response.status >= 500;
    if (retryable && attempt < MAX_ATTEMPTS) {
      const wait = 1000 * 2 ** attempt;
      console.log(
        `  DeepL ${response.status} — retrying in ${wait / 1000}s (${attempt}/${MAX_ATTEMPTS})`,
      );
      await sleep(wait);
      continue;
    }
    const body = await response.text().catch(() => '(no body)');
    throw new Error(`DeepL ${response.status} ${response.statusText}: ${body}`);
  }
}

// ---------------------------------------------------------------------------
// Generic flatten / unflatten for the UI dictionary
// ---------------------------------------------------------------------------
function flatten(obj: unknown, prefix: string, into: Map<string, string>): void {
  if (typeof obj === 'string') {
    into.set(prefix, obj);
  } else if (obj !== null && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, into);
  }
}

function unflatten(entries: Iterable<[string, string]>): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [path, value] of entries) {
    const parts = path.split('.');
    let node = root;
    parts.slice(0, -1).forEach((part) => {
      node = (node[part] ??= {}) as Record<string, unknown>;
    });
    node[parts[parts.length - 1]!] = value;
  }
  return root;
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
  m.set('about.team.note', aboutContent.team.note);
  // Team member names are proper nouns; only the generic "Mutfak Ekibi" is text.
  aboutContent.team.members.forEach((member, i) => {
    if (member === 'Mutfak Ekibi') m.set(`about.team.member.${i}`, member);
  });

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

  // UI dictionary: EVERY string, flattened generically as `ui.<dotted.path>`.
  flatten(dictionaries.tr, 'ui', m);

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
    if (name || description)
      categories[cat.id] = { ...(name && { name }), ...(description && { description }) };
    for (const item of cat.items) {
      const iname = dot(t, `menu.item.${item.id}.name`);
      const idesc = dot(t, `menu.item.${item.id}.description`);
      if (iname || idesc)
        items[item.id] = { ...(iname && { name: iname }), ...(idesc && { description: idesc }) };
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
      members: aboutContent.team.members.map(
        (member, i) => dot(t, `about.team.member.${i}`) ?? member,
      ),
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
  const ui = [...t.entries()]
    .filter(([k]) => k.startsWith('ui.'))
    .map(([k, v]): [string, string] => [k.slice(3), v]);
  return unflatten(ui);
}

// ---------------------------------------------------------------------------
// Existing-translation reuse (menu + ui only; see header comment).
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
  flatten(read(`ui.${locale}.json`), 'ui', m);
  return m;
}

async function writeJson(name: string, data: unknown): Promise<void> {
  await writeFile(join(GEN_DIR, name), JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  written → src/lib/i18n/generated/${name}`);
}

async function main(): Promise<void> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey && !DRY_RUN) {
    console.log('DEEPL_API_KEY not set in .env.local — skipping. Add it and re-run.');
    process.exit(0);
  }

  mkdirSync(GEN_DIR, { recursive: true });
  const sources = collectSources();
  console.log(`Collected ${sources.size} source string(s).`);

  const targets = TARGETS.filter((t) => !ONLY_LOCALE || t.locale === ONLY_LOCALE);
  if (targets.length === 0) throw new Error(`Unknown --locale=${ONLY_LOCALE}`);

  for (const { lang, locale } of targets) {
    console.log(`\n→ ${lang}`);
    const existing = FORCE ? new Map<string, string>() : loadExisting(locale);

    const keys = [...sources.keys()];
    const toTranslate = keys.filter((k) => {
      // Pages are always re-translated; menu + ui are reused when they look good.
      if (!k.startsWith('menu.') && !k.startsWith('ui.')) return true;
      if (contextFor(k)) return true; // gender-sensitive: always redo
      const have = existing.get(k);
      return have === undefined || looksUntranslated(sources.get(k)!, have);
    });
    const chars = toTranslate.reduce((n, k) => n + sources.get(k)!.length, 0);
    console.log(
      `  ${toTranslate.length} to translate (${chars} chars), ${keys.length - toTranslate.length} reused.`,
    );
    if (DRY_RUN) continue;

    const t: T = new Map(existing);
    // Group by DeepL context so gender-sensitive passages are translated together.
    const groups = new Map<string | undefined, string[]>();
    for (const k of toTranslate) {
      const ctx = contextFor(k);
      groups.set(ctx, [...(groups.get(ctx) ?? []), k]);
    }
    for (const [ctx, groupKeys] of groups) {
      const translated = await translateBatch(
        groupKeys.map((k) => sources.get(k)!),
        lang,
        apiKey!,
        ctx,
      );
      groupKeys.forEach((k, i) => t.set(k, translated[i] ?? sources.get(k)!));
    }

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
