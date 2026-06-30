'use client';

import { useId, useState } from 'react';

import { MenuItemCard } from './MenuItemCard';
import type { MenuCategory as MenuCategoryType } from '@/lib/types';

/**
 * A single collapsible menu category, matching the reference design: a large
 * terracotta Cormorant heading with a chevron on the right and a hairline rule
 * beneath, expanding to reveal the item list.
 *
 * Collapsed by default (the page opens with every category closed); each
 * category manages its own open state so they expand independently. The header
 * is a real <button> with aria-expanded/aria-controls for keyboard + screen
 * reader support.
 */
export function MenuAccordionCategory({ category }: { category: MenuCategoryType }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section aria-labelledby={`cat-${category.slug}`} className="scroll-mt-28">
      <h2 id={`cat-${category.slug}`} className="border-stone border-b">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="font-display text-terracotta text-3xl tracking-wide uppercase md:text-4xl">
            {category.name}
          </span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`text-terracotta/80 h-6 w-6 shrink-0 transition-transform duration-300 ${
              open ? '-rotate-180' : ''
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="fade-up">
          {category.description && (
            <p className="text-muted mt-4 max-w-prose text-sm">{category.description}</p>
          )}
          <div className="divide-stone-soft divide-y">
            {category.items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default MenuAccordionCategory;
