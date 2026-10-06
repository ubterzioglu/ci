/**
 * check-i18n.ts — fails when a non-Turkish locale still has untranslated text.
 *
 * Usage: pnpm i18n:check
 *
 * Checks, per locale (en/de/ru/fr):
 *   1. every UI dictionary key is present in the generated overlay
 *   2. no value contains Turkish-only letters (ğ ş ı İ), ignoring protected names
 *   3. no UI value is identical to the Turkish source (except the allowlist)
 */

import { translatableLocales } from '../src/lib/i18n/config.ts';
import { dictionaries } from '../src/lib/i18n/dictionaries.ts';
import { getAboutContent, getHomeContent } from '../src/content/pages-i18n.ts';
import { getLocalMenu } from '../src/content/menu-data.ts';

const TURKISH_ONLY = /[ğışİĞŞ]/;
const PROTECTED =
  /Simge Manacıoğlu|Tolga Manacıoğlu|Çağıl İda|Sumanu Şarap Evi|Mezeteryan|Mihaliç|Memecik|kokoreç|Kaş|Çi Ailesi|Kargı|Çorum|hibeş/g;

/** A brand/place name glued to the previous word, e.g. "« nouvelle »Kaş". */
const GLUED = /[»”"\)\p{L}\p{N}](?:Çi Neo Cucina|Kaş|Mihaliç|Memecik)(?![\p{L}\p{N}])/u;

/** UI strings that are legitimately identical across languages. */
const IDENTICAL_OK = new Set([
  'ui.nav.menu',
  'ui.notFound.menu',
  'ui.common.phone',
  'ui.pages.experiences.title',
]);

function flatten(obj: unknown, prefix: string, out: Map<string, string>): void {
  if (typeof obj === 'string') out.set(prefix, obj);
  else if (obj && typeof obj === 'object')
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
}

const problems: string[] = [];
const report = (locale: string, msg: string) => problems.push(`[${locale}] ${msg}`);

const trUi = new Map<string, string>();
flatten(dictionaries.tr, 'ui', trUi);

for (const locale of translatableLocales) {
  // UI dictionary
  const ui = new Map<string, string>();
  flatten(dictionaries[locale], 'ui', ui);
  for (const [key, source] of trUi) {
    const value = ui.get(key);
    if (value === undefined || value === '') report(locale, `missing ${key}`);
    else if (value === source && !IDENTICAL_OK.has(key) && source.length > 3)
      report(locale, `identical to Turkish: ${key} = "${value}"`);
  }

  // Page content (about + home)
  const pages = new Map<string, string>();
  flatten(getAboutContent(locale), 'about', pages);
  flatten(getHomeContent(locale), 'home', pages);
  for (const [key, value] of pages) {
    if (/\.(href|icon|key)$/.test(key)) continue;
    if (TURKISH_ONLY.test(value.replace(PROTECTED, '')))
      report(locale, `Turkish letters in ${key}: "${value.slice(0, 60)}"`);
  }

  // Menu
  const menu = getLocalMenu(locale);
  const menuLoc = new Map<string, string>();
  for (const cat of menu) flatten(cat, `menu.${cat.id}`, menuLoc);
  for (const [key, value] of menuLoc) {
    if (/\.(id|slug|price|currency)$/.test(key)) continue;
    if (TURKISH_ONLY.test(value.replace(PROTECTED, '')))
      report(locale, `Turkish letters in ${key}: "${value.slice(0, 60)}"`);
  }

  // A protected name glued to the previous word (lost space after translation)
  for (const group of [ui, pages, menuLoc]) {
    for (const [key, value] of group) {
      if (GLUED.test(value)) report(locale, `name glued to previous word in ${key}: "${value}"`);
    }
  }
}

if (problems.length > 0) {
  console.error(`i18n check failed — ${problems.length} problem(s):\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`i18n check passed for: ${translatableLocales.join(', ')}`);
