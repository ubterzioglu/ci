import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildReservationConfirmation,
  buildReservationDeclined,
  resolveEmailLocale,
} from '../src/lib/email-content';
import { locales } from '../src/lib/i18n/config';

const reservation = {
  name: 'Anna <b>Schmidt</b>',
  requestedDate: '2026-11-14',
  requestedTime: '20:00',
  partySize: 4,
};

const subjectStart: Record<(typeof locales)[number], string> = {
  tr: 'Rezervasyonunuz onaylandı',
  en: 'Your reservation is confirmed',
  de: 'Ihre Reservierung ist bestätigt',
  ru: 'Ваше бронирование подтверждено',
  fr: 'Votre réservation est confirmée',
};

for (const locale of locales) {
  test(`confirmation mail is written in ${locale} only`, () => {
    const body = buildReservationConfirmation(reservation, locale);

    assert.ok(body.subject.startsWith(subjectStart[locale]), body.subject);
    assert.ok(body.text.includes('4'));

    // No other language may leak into the mail.
    for (const other of locales) {
      if (other === locale) continue;
      assert.ok(!body.text.includes(subjectStart[other]), `${other} leaked into ${locale}`);
      assert.ok(!body.html.includes(subjectStart[other]), `${other} leaked into ${locale} html`);
    }
  });
}

test('the html lang attribute matches the locale and there are no tabs', () => {
  const body = buildReservationConfirmation(reservation, 'de');
  assert.match(body.html, /lang="de"/);
  assert.doesNotMatch(body.html, /<nav|href="#reservation-/);
});

test('guest-supplied name is HTML-escaped', () => {
  const body = buildReservationConfirmation(reservation, 'en');
  assert.ok(!body.html.includes('<b>Schmidt</b>'));
  assert.ok(body.html.includes('&lt;b&gt;Schmidt&lt;/b&gt;'));
});

test('dates are formatted for the guest locale', () => {
  assert.ok(buildReservationConfirmation(reservation, 'de').text.includes('14. November 2026'));
  assert.ok(buildReservationConfirmation(reservation, 'tr').text.includes('14 Kasım 2026'));
});

test('resolveEmailLocale accepts known locales and falls back to English', () => {
  assert.equal(resolveEmailLocale('fr'), 'fr');
  assert.equal(resolveEmailLocale('tr'), 'tr');
  assert.equal(resolveEmailLocale(null), 'en');
  assert.equal(resolveEmailLocale(undefined), 'en');
  assert.equal(resolveEmailLocale('xx'), 'en');
});

const declinedSubjectStart: Record<(typeof locales)[number], string> = {
  tr: 'Rezervasyon talebiniz hakkında',
  en: 'About your reservation request',
  de: 'Zu Ihrer Reservierungsanfrage',
  ru: 'По вашему запросу на бронирование',
  fr: 'Concernant votre demande de réservation',
};

for (const locale of locales) {
  test(`declined mail is written in ${locale} only and invites a call`, () => {
    const body = buildReservationDeclined(reservation, locale);

    assert.ok(body.subject.startsWith(declinedSubjectStart[locale]), body.subject);
    assert.ok(body.text.includes('+90 544 687 05 28'), 'phone number missing');

    for (const other of locales) {
      if (other === locale) continue;
      assert.ok(
        !body.subject.includes(declinedSubjectStart[other]),
        `${other} leaked into ${locale}`,
      );
    }
  });
}

test('declined mail escapes the guest name', () => {
  const body = buildReservationDeclined(reservation, 'en');
  assert.ok(!body.html.includes('<b>Schmidt</b>'));
});
