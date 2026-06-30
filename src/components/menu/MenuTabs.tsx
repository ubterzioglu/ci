'use client';

import { useState } from 'react';

import { MenuAccordionCategory } from './MenuAccordionCategory';
import type { MenuCategory } from '@/lib/types';

type Tab = 'food' | 'wine';

interface MenuTabsProps {
  categories: MenuCategory[];
  serviceNote: string;
  wineNotice: string;
}

/**
 * Client wrapper for the menu page: two tabs ("Ana Menü" / "Şarap Menüsü")
 * matching the reference design — the active tab is terracotta with a terracotta
 * underline, the inactive one charcoal. The food tab shows the service note plus
 * the collapsible category accordion (all categories start closed). The wine tab
 * has no exported item data (panel-only on the source site), so it shows a
 * tasteful "ask our team" notice instead.
 */
export function MenuTabs({ categories, serviceNote, wineNotice }: MenuTabsProps) {
  const [tab, setTab] = useState<Tab>('food');

  const tabClass = (active: boolean) =>
    `font-display text-lg tracking-wide uppercase pb-2 border-b-2 transition-colors md:text-xl ${
      active
        ? 'text-terracotta border-terracotta'
        : 'text-charcoal border-transparent hover:text-terracotta/80'
    }`;

  return (
    <div>
      {/* Tabs */}
      <div role="tablist" aria-label="Menü seçimi" className="border-stone/60 flex gap-8 border-b">
        <button
          type="button"
          role="tab"
          id="tab-food"
          aria-selected={tab === 'food'}
          aria-controls="panel-food"
          onClick={() => setTab('food')}
          className={tabClass(tab === 'food')}
        >
          Ana Menü
        </button>
        <button
          type="button"
          role="tab"
          id="tab-wine"
          aria-selected={tab === 'wine'}
          aria-controls="panel-wine"
          onClick={() => setTab('wine')}
          className={tabClass(tab === 'wine')}
        >
          Şarap Menüsü
        </button>
      </div>

      {/* Food panel */}
      {tab === 'food' && (
        <div id="panel-food" role="tabpanel" aria-labelledby="tab-food" className="fade-up mt-10">
          <p className="text-muted mb-10 max-w-2xl text-sm leading-relaxed">{serviceNote}</p>
          <div>
            {categories.map((category) => (
              <MenuAccordionCategory key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Wine panel — no item data; elegant ask-the-team notice */}
      {tab === 'wine' && (
        <div
          id="panel-wine"
          role="tabpanel"
          aria-labelledby="tab-wine"
          className="fade-up border-wine/25 bg-wine/5 mt-10 rounded-lg border p-8 text-center"
        >
          <h2 className="font-display text-wine text-3xl">Şarap Menüsü</h2>
          <p className="text-muted mx-auto mt-3 max-w-xl text-sm leading-relaxed">{wineNotice}</p>
        </div>
      )}
    </div>
  );
}

export default MenuTabs;
