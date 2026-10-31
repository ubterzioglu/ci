import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addDaysToIsoDate,
  isDateInSeasonClosure,
  isValidIsoDate,
  parseSeasonClosure,
  seasonClosedCopy,
} from '../src/lib/reservation-closure';
import { locales } from '../src/lib/i18n/config';

const winter = { start: '2026-11-01', end: '2027-04-19' };

test('both ends of the closure are inclusive', () => {
  assert.equal(isDateInSeasonClosure('2026-11-01', winter), true);
  assert.equal(isDateInSeasonClosure('2027-04-19', winter), true);
  assert.equal(isDateInSeasonClosure('2027-01-15', winter), true);
});

test('dates just outside the closure stay bookable', () => {
  assert.equal(isDateInSeasonClosure('2026-10-31', winter), false);
  assert.equal(isDateInSeasonClosure('2027-04-20', winter), false);
});

test('addDaysToIsoDate steps across month and year boundaries', () => {
  assert.equal(addDaysToIsoDate('2026-11-01', -1), '2026-10-31');
  assert.equal(addDaysToIsoDate('2027-04-19', 1), '2027-04-20');
  assert.equal(addDaysToIsoDate('2026-12-31', 1), '2027-01-01');
});

test('no closure means nothing is closed', () => {
  assert.equal(isDateInSeasonClosure('2026-12-25', null), false);
});

test('parseSeasonClosure accepts a well-formed value', () => {
  assert.deepEqual(parseSeasonClosure({ start: '2026-11-01', end: '2027-04-19' }), winter);
});

test('parseSeasonClosure treats malformed values as no closure', () => {
  assert.equal(parseSeasonClosure(null), null);
  assert.equal(parseSeasonClosure('2026-11-01'), null);
  assert.equal(parseSeasonClosure({ start: '2026-11-01' }), null);
  assert.equal(parseSeasonClosure({ start: '2026-02-31', end: '2026-03-10' }), null);
  assert.equal(parseSeasonClosure({ start: '2027-04-20', end: '2026-11-01' }), null);
});

test('isValidIsoDate rejects rolled-over dates', () => {
  assert.equal(isValidIsoDate('2026-02-31'), false);
  assert.equal(isValidIsoDate('2026-2-3'), false);
  assert.equal(isValidIsoDate('2028-02-29'), true);
});

for (const locale of locales) {
  test(`season closed copy is written for ${locale} and names both dates`, () => {
    const copy = seasonClosedCopy(winter, locale);

    assert.ok(copy.title.length > 0);
    assert.ok(copy.message.startsWith(copy.title));
    assert.ok(copy.body.includes('2026'), copy.body);
    assert.ok(copy.body.includes('2027'), copy.body);
  });
}

test('the Turkish copy reads as the restaurant worded it', () => {
  const copy = seasonClosedCopy(winter, 'tr');

  assert.equal(copy.title, 'Sezon Kapanmıştır');
  assert.equal(
    copy.body,
    '31 Ekim 2026 bu sezon için son servis günümüz. 20 Nisan 2027 itibariyle görüşmek üzere.',
  );
});
