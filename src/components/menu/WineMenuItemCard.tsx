import type { WinePriceLabels } from '@/content/wine-menu-data';
import type { MenuItem } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

const defaultLabels: WinePriceLabels = {
  glass: 'Kadeh',
  bottle: 'Şişe',
  coravin: 'Coravin ile kadeh servisi',
};

export function WineMenuItemCard({
  item,
  labels = defaultLabels,
}: {
  item: MenuItem;
  labels?: WinePriceLabels;
}) {
  const glassPrice = formatPrice(item.glassPrice ?? null, item.currency);
  const bottlePrice = formatPrice(item.price, item.currency);

  return (
    <article className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="font-display text-charcoal text-xl">{item.name}</h3>
        {item.description && (
          <p className="text-muted mt-1.5 max-w-prose text-sm leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-5 text-right">
        <div className="min-w-20">
          <dt className="text-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
            {labels.glass}
          </dt>
          <dd className="font-display text-terracotta mt-1 text-lg font-medium">
            {glassPrice ?? '—'}
            {glassPrice && item.isCoravin && (
              <span
                className="text-wine ml-1.5 align-middle text-xs"
                title={labels.coravin}
                aria-label={labels.coravin}
              >
                ◆
              </span>
            )}
          </dd>
        </div>
        <div className="min-w-20">
          <dt className="text-muted text-[10px] font-semibold tracking-[0.12em] uppercase">
            {labels.bottle}
          </dt>
          <dd className="font-display text-terracotta mt-1 text-lg font-medium">
            {bottlePrice ?? '—'}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default WineMenuItemCard;
