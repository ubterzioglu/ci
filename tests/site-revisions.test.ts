import assert from 'node:assert/strict';
import test from 'node:test';

import { HOME_STORY_IMAGE_ID } from '../src/content/media-data';
import { getHomeContent, getLocalPage } from '../src/content/pages-i18n';
import { getDictionary } from '../src/lib/i18n/dictionaries';
import { getReservationRuleLines, findSlotProblem } from '../src/lib/reservation-rules';

test('the requested Turkish copy revisions are canonical', () => {
  const home = getHomeContent('tr');
  const dictionary = getDictionary('tr');

  assert.equal(
    home.chefsTable.body,
    'Chef’s Table, özel menüler ve kapalı etkinlikler için ekibimizle iletişime geçin.',
  );
  assert.equal(dictionary.pages.experiences.contactText, home.chefsTable.body);
  assert.equal(dictionary.footer.tagline, 'Doğal malzemeler, zamansız bir mutfak dili.');
  assert.doesNotMatch(dictionary.footer.tagline, /Kaş|Antalya/);
});

test('the home story and chef sections no longer reuse the same portrait', () => {
  assert.equal(HOME_STORY_IMAGE_ID, 'team-simge-lisa');
  assert.notEqual(HOME_STORY_IMAGE_ID, 'chef-simge');
});

test('every non-Turkish locale has translated page, section, form and a11y copy', () => {
  const expectations = {
    en: ['Contact', 'Send Message', 'Our Story', 'Skip to content'],
    de: ['Kontakt', 'Nachricht senden', 'Unsere Geschichte', 'Zum Inhalt springen'],
    ru: ['Контакты', 'Отправить сообщение', 'Наша история', 'Перейти к содержимому'],
  } as const;

  for (const [locale, expected] of Object.entries(expectations)) {
    const dictionary = getDictionary(locale as keyof typeof expectations);
    assert.deepEqual(
      [
        dictionary.pages.contact.title,
        dictionary.forms.contact.submit,
        dictionary.home.storyEyebrow,
        dictionary.a11y.skipToContent,
      ],
      expected,
    );
  }
});

test('reservation guidance and validation are localised', () => {
  assert.match(getReservationRuleLines('en')[0] ?? '', /Reservation hours/);
  assert.match(getReservationRuleLines('de')[3] ?? '', /Sonntags/);
  assert.match(getReservationRuleLines('ru')[2] ?? '', /групп/);

  const englishProblem = findSlotProblem('2026-09-27', '19:00', new Date(), 'en');
  assert.match(englishProblem?.message ?? '', /closed on Sundays/i);
});

test('localized routes use translated metadata instead of Turkish defaults', () => {
  assert.equal(getLocalPage('about', 'en')?.title, 'About Us');
  assert.equal(getLocalPage('menu', 'de')?.title, 'Menü');
  assert.equal(getLocalPage('contact', 'ru')?.title, 'Контакты');
});
