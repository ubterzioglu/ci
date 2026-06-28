/**
 * translate-content.ts — DeepL translation scaffold for Çi Neo Cucina
 *
 * Usage:
 *   pnpm i18n:translate
 *
 * Requires: DEEPL_API_KEY in .env.local (free key ends with ':fx').
 *
 * TODO: Expand this script to translate the full content pipeline:
 *   - src/content/menu-data.ts  → menu item names & descriptions per locale
 *   - src/content/pages-data.ts → page titles, excerpts, and body content
 *   - src/lib/i18n/dictionaries.ts → UI strings (nav, cta, common)
 *
 * IMPORTANT: All machine-translated strings MUST be reviewed by a native
 * speaker before publishing. DeepL output for Turkish → German/English is
 * generally good but restaurant-specific terminology (e.g. dish names,
 * regional references) requires human validation.
 *
 * Recommended workflow:
 *   1. Run this script → review src/lib/i18n/generated/sample.<locale>.json
 *   2. Copy approved strings into dictionaries.ts / content files
 *   3. Delete or gitignore the generated/ directory before shipping
 */

import { config } from 'dotenv';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

config({ path: '.env.local' });

// ---------------------------------------------------------------------------
// Sample strings for demonstration (Turkish source)
// ---------------------------------------------------------------------------
const SAMPLE_STRINGS = [
  'Rezervasyon Talep Et',
  'Menü',
  'Hakkımızda',
  'İletişim',
  'Ana Sayfa',
  'Deneyimler',
  'Rezervasyon',
];

// ---------------------------------------------------------------------------
// DeepL target language codes
// ---------------------------------------------------------------------------
type DeepLTarget = 'EN' | 'DE';

interface DeepLResponse {
  translations: Array<{ text: string; detected_source_language: string }>;
}

// ---------------------------------------------------------------------------
// Translation helper
// ---------------------------------------------------------------------------
async function translate(
  text: string,
  targetLang: DeepLTarget,
  apiKey: string
): Promise<string> {
  // Free keys end with ':fx' → use the free-tier endpoint
  const baseUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: 'TR',
      target_lang: targetLang,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '(no body)');
    throw new Error(`DeepL ${response.status} ${response.statusText}: ${body}`);
  }

  const data = (await response.json()) as DeepLResponse;
  const translated = data.translations[0]?.text;
  if (translated === undefined) {
    throw new Error('DeepL returned an empty translations array');
  }
  return translated;
}

// ---------------------------------------------------------------------------
// Write JSON result to src/lib/i18n/generated/
// ---------------------------------------------------------------------------
async function writeLocaleJson(
  locale: string,
  data: Record<string, string>
): Promise<void> {
  const dir = join(process.cwd(), 'src', 'lib', 'i18n', 'generated');
  mkdirSync(dir, { recursive: true });
  const destPath = join(dir, `sample.${locale}.json`);
  await writeFile(destPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`  Written → ${destPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const apiKey = process.env.DEEPL_API_KEY;

  if (!apiKey) {
    console.log(
      'DEEPL_API_KEY is not set in .env.local — skipping translation.\n' +
        'Add DEEPL_API_KEY=<your-key> to .env.local and re-run pnpm i18n:translate.'
    );
    process.exit(0);
  }

  const targets: DeepLTarget[] = ['EN', 'DE'];

  for (const targetLang of targets) {
    const locale = targetLang.toLowerCase();
    console.log(`\nTranslating ${SAMPLE_STRINGS.length} strings → ${targetLang} ...`);

    const result: Record<string, string> = {};
    let failCount = 0;

    for (const text of SAMPLE_STRINGS) {
      try {
        const translated = await translate(text, targetLang, apiKey);
        result[text] = translated;
        console.log(`  ✓ "${text}" → "${translated}"`);
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.error(`  ✗ "${text}" failed: ${reason}`);
        result[text] = text; // fall back to source string
        failCount++;
      }
    }

    await writeLocaleJson(locale, result);

    if (failCount > 0) {
      console.warn(`  ${failCount} string(s) could not be translated for ${targetLang}.`);
    }
  }

  console.log('\nDone. Review the generated files before using them in production.');
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
