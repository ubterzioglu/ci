import { Badge } from '@/components/ui/Badge';
import type { MenuItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

/**
 * A single menu item: name + leader dots + price on one line (editorial menu
 * style), description beneath, dietary tags as small badges. Allergens are
 * shown subtly so guests can scan them without clutter.
 */
export function MenuItemCard({ item }: { item: MenuItem }) {
  const price = formatPrice(item.price, item.currency);

  return (
    <article className="py-5">
      <div className="flex items-baseline gap-3">
        <h3 className="font-display text-charcoal text-xl">{item.name}</h3>
        <span aria-hidden="true" className="bg-stone-soft mb-1 h-px flex-1 self-end" />
        {price && <span className="font-display text-olive-deep shrink-0 text-lg">{price}</span>}
      </div>

      {item.description && (
        <p className="text-muted mt-1.5 max-w-prose text-sm leading-relaxed">{item.description}</p>
      )}

      {(item.tags.length > 0 || item.allergens.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} tone="olive">
              {tag}
            </Badge>
          ))}
          {item.allergens.length > 0 && (
            <span className="text-muted/80 text-xs">Alerjenler: {item.allergens.join(', ')}</span>
          )}
        </div>
      )}
    </article>
  );
}

export default MenuItemCard;
