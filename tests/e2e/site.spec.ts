import { expect, test, type Page } from '@playwright/test';

const LOCALES = ['tr', 'en', 'de', 'ru', 'fr'] as const;
type Locale = (typeof LOCALES)[number];
const PAGES = ['/', '/menu', '/about', '/experiences', '/reservations', '/contact'] as const;
const TR_ONLY_PAGES = ['/impressum', '/datenschutz', '/kas-sef-restorani', '/qr'] as const;

/** Turkish-only letters; ö/ü/ç also occur in German/French so they are not used. */
const TURKISH_ONLY = /[ğışİĞŞ]/;
/** Proper nouns that legitimately keep Turkish spelling in every language. */
const PROTECTED =
  /Simge Manacıoğlu|Tolga Manacıoğlu|Çağıl İda|Sumanu Şarap Evi|Mezeteryan|Mihaliç|Memecik|kokoreç|Kaş|Çi Ailesi|Kargı|Çorum|hibeş|Miskioğlu|Andifli Mah.|Uğur Mumcu Cad./g;

const url = (path: string, locale: Locale) =>
  locale === 'tr' ? path : `/${locale}${path === '/' ? '' : path}`;

/** Collect console errors and failed same-origin requests while a test runs. */
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    const sameOrigin = res.url().startsWith(page.url().split('/').slice(0, 3).join('/'));
    if (sameOrigin && res.status() >= 400) errors.push(`${res.status()} ${res.url()}`);
  });
  return errors;
}

for (const locale of LOCALES) {
  test.describe(`locale ${locale}`, () => {
    for (const path of PAGES) {
      test(`${url(path, locale)} renders correctly`, async ({ page }) => {
        const errors = watchErrors(page);
        const response = await page.goto(url(path, locale));
        expect(response?.status()).toBe(200);

        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('h1').first()).toBeVisible();

        // hreflang alternates cover every locale.
        const hreflangs = await page
          .locator('link[rel="alternate"][hreflang]')
          .evaluateAll((els) => els.map((el) => el.getAttribute('hreflang')));
        for (const l of LOCALES) expect(hreflangs).toContain(l);

        if (locale !== 'tr') {
          const text = (await page.locator('body').innerText()).replace(PROTECTED, '');
          const offending = text.split('\n').filter((line) => TURKISH_ONLY.test(line));
          expect(offending, `Turkish text left on ${url(path, locale)}`).toEqual([]);

          const title = (await page.title()).replace(PROTECTED, '');
          expect(title, 'page <title> still Turkish').not.toMatch(TURKISH_ONLY);
          const description = await page
            .locator('meta[name="description"]')
            .getAttribute('content');
          expect((description ?? '').replace(PROTECTED, '')).not.toMatch(TURKISH_ONLY);
        }

        expect(errors).toEqual([]);
      });
    }

    test('unknown URL shows a localized 404', async ({ page }) => {
      const response = await page.goto(`${url('/', locale).replace(/\/$/, '')}/does-not-exist`);
      expect(response?.status()).toBe(404);
      await expect(page.locator('h1')).toBeVisible();
      if (locale !== 'tr') {
        const text = (await page.locator('main').innerText()).replace(PROTECTED, '');
        expect(text).not.toMatch(TURKISH_ONLY);
        expect(text).not.toContain('Aradığınız');
      }
    });

    test('contact form validation messages are localized', async ({ page }) => {
      await page.goto(url('/contact', locale));
      await page.locator('form button[type="submit"]').click();
      const error = page
        .locator('form [role="alert"], form [id$="-error"], form .text-red-700')
        .first();
      await expect(error).toBeVisible();
      if (locale !== 'tr') {
        expect((await error.innerText()).replace(PROTECTED, '')).not.toMatch(TURKISH_ONLY);
      }
    });
  });
}

test.describe('language switcher', () => {
  for (const target of LOCALES) {
    test(`tr → ${target} keeps the same page`, async ({ page }) => {
      await page.goto('/about');
      if (target === 'tr') return;
      await page
        .locator(`header a[hreflang="${target}"], header a[href^="/${target}/about"]`)
        .first()
        .click();
      await expect(page).toHaveURL(new RegExp(`/${target}/about$`));
      await expect(page.locator('html')).toHaveAttribute('lang', target);
    });
  }
});

test.describe('menu', () => {
  for (const locale of LOCALES) {
    test(`menu tabs switch (${locale})`, async ({ page }) => {
      await page.goto(url('/menu', locale));
      const tabs = page.getByRole('tab');
      await expect(tabs.first()).toBeVisible();
      const count = await tabs.count();
      expect(count).toBeGreaterThanOrEqual(2);
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    });
  }
});

test.describe('turkish-only pages', () => {
  for (const path of TR_ONLY_PAGES) {
    test(`${path} responds`, async ({ page }) => {
      const errors = watchErrors(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'tr');
      expect(errors).toEqual([]);
    });
  }

  test('legacy redirects resolve', async ({ page }) => {
    await page.goto('/about-1');
    await expect(page).toHaveURL(/\/about$/);
  });
});

test.describe('seo endpoints', () => {
  for (const path of ['/sitemap.xml', '/robots.txt']) {
    test(`${path} responds`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
    });
  }

  test('sitemap lists every locale of every public page', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const locale of LOCALES) {
      for (const path of PAGES) {
        const loc = url(path, locale);
        expect(xml, `missing ${loc}`).toMatch(new RegExp(`<loc>[^<]*${loc}</loc>`));
      }
    }
  });
});
