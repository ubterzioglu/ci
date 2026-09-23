import assert from 'node:assert/strict';
import test from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { WineMenuItemCard } from '../src/components/menu/WineMenuItemCard';
import { getLocalWineMenu, wineMenuCategories } from '../src/content/wine-menu-data';

test('the photographed wine list is complete and every row has a price', () => {
  assert.deepEqual(
    wineMenuCategories.map((category) => [category.name, category.items.length]),
    [
      ['Beyaz Şaraplar', 16],
      ['Pembe Şaraplar', 4],
      ['Köpüklü Şaraplar', 4],
      ['Kırmızı Şaraplar', 25],
      ['Likör Şarapları', 2],
    ],
  );

  const items = wineMenuCategories.flatMap((category) => category.items);
  assert.equal(items.length, 51);
  assert.equal(new Set(items.map((item) => item.id)).size, items.length);
  assert.ok(items.every((item) => item.price !== null || item.glassPrice !== null));
  assert.ok(items.every((item) => item.currency === 'TRY'));
});

test('glass, bottle, Coravin and corrected handwritten prices are preserved', () => {
  const items = new Map(
    wineMenuCategories
      .flatMap((category) => category.items)
      .map((item) => [item.id, item] as const),
  );

  assert.deepEqual(
    {
      glassPrice: items.get('red-yaban-kolektif-ercis-karasi')?.glassPrice,
      bottlePrice: items.get('red-yaban-kolektif-ercis-karasi')?.price,
      isCoravin: items.get('red-yaban-kolektif-ercis-karasi')?.isCoravin,
    },
    { glassPrice: 1000, bottlePrice: 4200, isCoravin: true },
  );
  assert.equal(items.get('red-yedi-bilgeler-pythagoras')?.price, 4800);
  assert.equal(items.get('white-sofra-sarabi')?.glassPrice, 480);
  assert.equal(items.get('white-sofra-sarabi')?.price, null);
  assert.equal(items.get('liqueur-kayra-madre')?.glassPrice, 350);
});

test('wine category headings are localised outside Turkish', () => {
  assert.equal(getLocalWineMenu('en')[0]?.name, 'White Wines');
  assert.equal(getLocalWineMenu('de')[3]?.name, 'Rotweine');
  assert.equal(getLocalWineMenu('ru')[4]?.name, 'Ликёрные вина');
});

test('wine item markup labels glass and bottle prices and explains Coravin', () => {
  const item = wineMenuCategories[3]?.items.find((candidate) => candidate.id === 'red-hus-juan');
  assert.ok(item);

  const html = renderToStaticMarkup(<WineMenuItemCard item={item} />);
  assert.match(html, /Kadeh/);
  assert.match(html, /Şişe/);
  assert.match(html, /₺1\.000/);
  assert.match(html, /₺3\.800/);
  assert.match(html, /Coravin ile kadeh servisi/);
});
