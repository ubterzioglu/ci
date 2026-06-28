import { MenuItemCard } from './MenuItemCard';
import type { MenuCategory as MenuCategoryType } from '@/lib/types';

/**
 * A menu category block: the category name (e.g. "Topraktan") used as the real
 * structural device — it encodes where each dish comes from (soil / sea /
 * pasture) — its short description, and the list of items.
 */
export function MenuCategory({ category }: { category: MenuCategoryType }) {
  return (
    <section aria-labelledby={`cat-${category.slug}`} className="scroll-mt-28">
      <header className="border-stone border-b pb-4">
        <h2 id={`cat-${category.slug}`} className="font-display text-charcoal text-3xl md:text-4xl">
          {category.name}
        </h2>
        {category.description && (
          <p className="text-muted mt-2 max-w-prose text-sm">{category.description}</p>
        )}
      </header>

      <div className="divide-stone-soft divide-y">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default MenuCategory;
