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
        <h3 className="font-display text-xl text-charcoal">{item.name}</h3>
        <span
          aria-hidden="true"
          className="mb-1 h-px flex-1 self-end bg-stone-soft"
        />
        {price && (
          <span className="shrink-0 font-display text-lg text-olive-deep">{price}</span>
        )}
      </div>

      {item.description && (
        <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      )}

      {(item.tags.length > 0 || item.allergens.length > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.tags.map((tag) => (
            <Badge key={tag} tone="olive">
              {tag}
            </Badge>
          ))}
          {item.allergens.length > 0 && (
            <span className="text-xs text-muted/80">
              Alerjenler: {item.allergens.join(', ')}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

export default MenuItemCard;
