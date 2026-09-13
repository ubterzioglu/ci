'use client';

import { cn } from '@/lib/utils';
import {
  DIETARY_FLAGS,
  DIETARY_FLAG_LABELS,
  COMMON_ALLERGENS,
  DEFAULT_CURRENCY,
  type AdminMenuItem,
  type DietaryFlag,
  type ItemInput,
} from '@/lib/db/admin/menu-types';

/**
 * The menu item editor, shared by the "add item" and "edit item" flows, plus
 * the form-value helpers that convert between an AdminMenuItem, the text-based
 * form state and the ItemInput payload the server actions expect.
 */

/* --- Small shared inputs --------------------------------------------------- */

export const inputCls =
  'w-full rounded-md border border-stone bg-marble px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-olive';

export const labelCls =
  'mb-1 block font-body text-xs font-semibold uppercase tracking-[0.1em] text-muted';

/** Comma-separated text ↔ string[] helpers for the tags/allergens fields. */
const toList = (s: string): string[] =>
  s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
const fromList = (xs: string[]): string => xs.join(', ');

/* --- Item edit form (used for both create and edit) ------------------------ */

export interface ItemFormValue {
  name: string;
  description: string;
  price: string; // text in the form; parsed on submit
  tags: string;
  allergens: string;
  dietaryFlags: DietaryFlag[];
  isActive: boolean;
}

export function emptyItemForm(): ItemFormValue {
  return {
    name: '',
    description: '',
    price: '',
    tags: '',
    allergens: '',
    dietaryFlags: [],
    isActive: true,
  };
}

export function itemToForm(item: AdminMenuItem): ItemFormValue {
  return {
    name: item.name,
    description: item.description ?? '',
    price: item.price === null ? '' : String(item.price),
    tags: fromList(item.tags),
    allergens: fromList(item.allergens),
    dietaryFlags: item.dietaryFlags.filter((f): f is DietaryFlag =>
      (DIETARY_FLAGS as readonly string[]).includes(f),
    ),
    isActive: item.isActive,
  };
}

/** Build the ItemInput payload from a form value + category. Null price when blank. */
export function formToInput(form: ItemFormValue, categoryId: string): ItemInput {
  const priceTrimmed = form.price.trim();
  return {
    categoryId,
    name: form.name.trim(),
    description: form.description.trim() || null,
    price: priceTrimmed === '' ? null : Number(priceTrimmed),
    currency: DEFAULT_CURRENCY,
    tags: toList(form.tags),
    allergens: toList(form.allergens),
    dietaryFlags: form.dietaryFlags,
    isActive: form.isActive,
  };
}

export function ItemForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
}: {
  value: ItemFormValue;
  onChange: (v: ItemFormValue) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  const set = <K extends keyof ItemFormValue>(key: K, v: ItemFormValue[K]) =>
    onChange({ ...value, [key]: v });

  const toggleFlag = (flag: DietaryFlag) => {
    const has = value.dietaryFlags.includes(flag);
    set(
      'dietaryFlags',
      has ? value.dietaryFlags.filter((f) => f !== flag) : [...value.dietaryFlags, flag],
    );
  };

  const addAllergen = (a: string) => {
    const current = toList(value.allergens);
    if (current.includes(a)) return;
    set('allergens', fromList([...current, a]));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.name.trim() || submitting) return;
        onSubmit();
      }}
      className="border-stone bg-marble space-y-3 rounded-md border p-4"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div>
          <label className={labelCls}>Ürün adı</label>
          <input
            value={value.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="örn: Urla Enginar Confit"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Fiyat (₺)</label>
          <input
            value={value.price}
            onChange={(e) => set('price', e.target.value)}
            inputMode="decimal"
            placeholder="boş = sor"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Açıklama</label>
        <textarea
          value={value.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Kısa açıklama"
          className={cn(inputCls, 'resize-y')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Etiketler (virgülle)</label>
          <input
            value={value.tags}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="Vegan, Vejetaryen"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Alerjenler (virgülle)</label>
          <input
            value={value.allergens}
            onChange={(e) => set('allergens', e.target.value)}
            placeholder="gluten, süt"
            className={inputCls}
          />
          <div className="mt-1.5 flex flex-wrap gap-1">
            {COMMON_ALLERGENS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => addAllergen(a)}
                className="border-stone font-body text-muted hover:border-olive hover:text-olive-deep rounded-full border px-2 py-0.5 text-[11px] transition-colors"
              >
                + {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {DIETARY_FLAGS.map((flag) => {
            const active = value.dietaryFlags.includes(flag);
            return (
              <button
                key={flag}
                type="button"
                onClick={() => toggleFlag(flag)}
                className={cn(
                  'font-body rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-olive text-ivory'
                    : 'border-stone text-olive hover:bg-cream-deep border',
                )}
              >
                {DIETARY_FLAG_LABELS[flag]}
              </button>
            );
          })}
        </div>
        <label className="font-body text-charcoal ml-auto flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={value.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="accent-olive h-4 w-4"
          />
          Menüde göster
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting || !value.name.trim()}
          className="bg-olive font-body text-ivory hover:bg-olive-deep rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
        >
          {submitting ? 'Kaydediliyor…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border-stone font-body text-muted hover:bg-cream-deep rounded-md border px-4 py-2 text-sm font-semibold transition-colors"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
