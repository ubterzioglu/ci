'use client';

import { useState } from 'react';

import { AdminSurface, AdminEmptyState, StatusPill } from '@/components/admin/primitives';
import { AdminCollapsible } from '@/components/admin/Collapsible';
import { useToast } from '@/components/admin/Toast';
import { useConfirm } from '@/components/admin/useConfirm';
import { cn, formatPrice } from '@/lib/utils';
import {
  DIETARY_FLAGS,
  DIETARY_FLAG_LABELS,
  COMMON_ALLERGENS,
  DEFAULT_CURRENCY,
  type AdminMenuCategory,
  type AdminMenuItem,
  type DietaryFlag,
  type ItemInput,
  type CategoryInput,
} from '@/lib/db/admin/menu-types';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  createItemAction,
  updateItemAction,
  toggleItemActiveAction,
  deleteItemAction,
  reorderItemsAction,
  reorderCategoriesAction,
} from './actions';

/* --- Small shared inputs --------------------------------------------------- */

const inputCls =
  'w-full rounded-md border border-stone bg-marble px-3 py-2 font-body text-sm text-charcoal outline-none focus:border-olive';

const labelCls = 'mb-1 block font-body text-xs font-semibold uppercase tracking-[0.1em] text-muted';

/** Comma-separated text ↔ string[] helpers for the tags/allergens fields. */
const toList = (s: string): string[] =>
  s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
const fromList = (xs: string[]): string => xs.join(', ');

/* --- Item edit form (used for both create and edit) ------------------------ */

interface ItemFormValue {
  name: string;
  description: string;
  price: string; // text in the form; parsed on submit
  tags: string;
  allergens: string;
  dietaryFlags: DietaryFlag[];
  isActive: boolean;
}

function emptyItemForm(): ItemFormValue {
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

function itemToForm(item: AdminMenuItem): ItemFormValue {
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
function formToInput(form: ItemFormValue, categoryId: string): ItemInput {
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

function ItemForm({
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
    set('dietaryFlags', has ? value.dietaryFlags.filter((f) => f !== flag) : [...value.dietaryFlags, flag]);
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
      className="space-y-3 rounded-md border border-stone bg-marble p-4"
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
                className="rounded-full border border-stone px-2 py-0.5 font-body text-[11px] text-muted transition-colors hover:border-olive hover:text-olive-deep"
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
                  'rounded-full px-3 py-1 font-body text-xs font-semibold transition-colors',
                  active ? 'bg-olive text-ivory' : 'border border-stone text-olive hover:bg-cream-deep',
                )}
              >
                {DIETARY_FLAG_LABELS[flag]}
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 font-body text-sm text-charcoal">
          <input
            type="checkbox"
            checked={value.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="h-4 w-4 accent-olive"
          />
          Menüde göster
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting || !value.name.trim()}
          className="rounded-md bg-olive px-4 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:opacity-40"
        >
          {submitting ? 'Kaydediliyor…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-stone px-4 py-2 font-body text-sm font-semibold text-muted transition-colors hover:bg-cream-deep"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

/* --- A single item row (display + inline edit) ----------------------------- */

function ItemRow({
  item,
  isFirst,
  isLast,
  onEdited,
  onDeleted,
  onMoved,
}: {
  item: AdminMenuItem;
  isFirst: boolean;
  isLast: boolean;
  onEdited: (next: AdminMenuItem) => void;
  onDeleted: () => void;
  onMoved: (dir: 'up' | 'down') => void;
}) {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ItemFormValue>(() => itemToForm(item));
  const [busy, setBusy] = useState(false);

  const price = formatPrice(item.price, item.currency);

  const handleSave = async () => {
    if (!item.categoryId) return;
    setBusy(true);
    const input = formToInput(form, item.categoryId);
    const result = await updateItemAction(item.id, input);
    setBusy(false);
    if (result.ok) {
      onEdited({ ...item, ...input });
      setEditing(false);
      toast.success('Ürün güncellendi.');
    } else {
      toast.error(result.error);
    }
  };

  const handleToggle = async () => {
    setBusy(true);
    const next = !item.isActive;
    const result = await toggleItemActiveAction(item.id, next);
    setBusy(false);
    if (result.ok) {
      onEdited({ ...item, isActive: next });
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `"${item.name}" silinsin mi?`,
      description: 'Bu işlem geri alınamaz.',
      confirmLabel: 'Sil',
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    const result = await deleteItemAction(item.id);
    setBusy(false);
    if (result.ok) {
      toast.success('Ürün silindi.');
      onDeleted();
    } else {
      toast.error(result.error);
    }
  };

  if (editing) {
    return (
      <li>
        <ItemForm
          value={form}
          onChange={setForm}
          onSubmit={handleSave}
          onCancel={() => {
            setForm(itemToForm(item));
            setEditing(false);
          }}
          submitting={busy}
          submitLabel="Kaydet"
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        'group flex items-start gap-3 rounded-md border border-stone bg-marble px-3 py-2.5',
        !item.isActive && 'opacity-60',
      )}
    >
      {/* Reorder controls */}
      <div className="flex flex-col">
        <button
          type="button"
          disabled={isFirst || busy}
          onClick={() => onMoved('up')}
          aria-label="Yukarı taşı"
          className="text-muted transition-colors hover:text-olive disabled:opacity-25"
        >
          ▲
        </button>
        <button
          type="button"
          disabled={isLast || busy}
          onClick={() => onMoved('down')}
          aria-label="Aşağı taşı"
          className="text-muted transition-colors hover:text-olive disabled:opacity-25"
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-base text-charcoal">{item.name}</span>
          {price && <span className="font-body text-sm font-semibold text-olive-deep">{price}</span>}
          {!item.isActive && <StatusPill tone="neutral">Gizli</StatusPill>}
        </div>
        {item.description && (
          <p className="mt-0.5 font-body text-xs leading-5 text-muted">{item.description}</p>
        )}
        {(item.tags.length > 0 || item.allergens.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.tags.map((t) => (
              <StatusPill key={t} tone="olive">
                {t}
              </StatusPill>
            ))}
            {item.allergens.length > 0 && (
              <span className="font-body text-[11px] text-muted/80">
                Alerjen: {item.allergens.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={handleToggle}
          className="rounded-md border border-stone px-2.5 py-1 font-body text-[11px] font-semibold text-olive transition-colors hover:bg-cream-deep disabled:opacity-40"
        >
          {item.isActive ? 'Gizle' : 'Göster'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing(true)}
          className="rounded-md border border-stone px-2.5 py-1 font-body text-[11px] font-semibold text-charcoal transition-colors hover:bg-cream-deep disabled:opacity-40"
        >
          Düzenle
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded-md border border-wine/40 px-2.5 py-1 font-body text-[11px] font-semibold text-wine transition-colors hover:bg-wine/5 disabled:opacity-40"
        >
          Sil
        </button>
      </div>
      {dialog}
    </li>
  );
}

/* --- Category block --------------------------------------------------------- */

function CategoryBlock({
  category,
  isFirst,
  isLast,
  onCategoryChange,
  onCategoryDelete,
  onCategoryMove,
}: {
  category: AdminMenuCategory;
  isFirst: boolean;
  isLast: boolean;
  onCategoryChange: (next: AdminMenuCategory) => void;
  onCategoryDelete: () => void;
  onCategoryMove: (dir: 'up' | 'down') => void;
}) {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [editingCat, setEditingCat] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<ItemFormValue>(emptyItemForm);
  const [catForm, setCatForm] = useState<CategoryInput>({
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    isActive: category.isActive,
  } as CategoryInput);
  const [busy, setBusy] = useState(false);

  const items = category.items;

  const setItems = (next: AdminMenuItem[]) => onCategoryChange({ ...category, items: next });

  /* item handlers ----- */
  const handleAddItem = async () => {
    setBusy(true);
    const result = await createItemAction(formToInput(newItem, category.id));
    setBusy(false);
    if (result.ok && result.data) {
      setItems([...items, result.data]);
      setNewItem(emptyItemForm());
      setAddingItem(false);
      toast.success('Ürün eklendi.');
    } else if (!result.ok) {
      toast.error(result.error);
    }
  };

  const handleItemMove = async (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const a = items[index];
    const b = items[target];
    if (!a || !b) return;
    const next = [...items];
    next[index] = b;
    next[target] = a;
    setItems(next);
    const updates = next.map((it, i) => ({ id: it.id, sortOrder: i + 1 }));
    const result = await reorderItemsAction(updates);
    if (!result.ok) {
      setItems(items); // revert
      toast.error(result.error);
    }
  };

  /* category handlers ----- */
  const handleSaveCategory = async () => {
    setBusy(true);
    const result = await updateCategoryAction(category.id, {
      ...catForm,
      description: (catForm.description ?? '').toString().trim() || null,
    });
    setBusy(false);
    if (result.ok) {
      onCategoryChange({
        ...category,
        name: catForm.name,
        slug: catForm.slug,
        description: (catForm.description ?? '').toString().trim() || null,
        isActive: catForm.isActive,
      });
      setEditingCat(false);
      toast.success('Kategori güncellendi.');
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteCategory = async () => {
    const ok = await confirm({
      title: `"${category.name}" kategorisi silinsin mi?`,
      description:
        'Kategori boş olmalı. Ürün varsa önce taşıyın veya silin. Bu işlem geri alınamaz.',
      confirmLabel: 'Sil',
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    const result = await deleteCategoryAction(category.id);
    setBusy(false);
    if (result.ok) {
      toast.success('Kategori silindi.');
      onCategoryDelete();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <AdminSurface
      title={`${category.name}${category.isActive ? '' : ' (gizli)'}`}
      description={category.description ?? undefined}
      actions={
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={isFirst || busy}
            onClick={() => onCategoryMove('up')}
            aria-label="Kategoriyi yukarı taşı"
            className="rounded-md border border-stone px-2 py-1 font-body text-xs text-olive transition-colors hover:bg-cream-deep disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={isLast || busy}
            onClick={() => onCategoryMove('down')}
            aria-label="Kategoriyi aşağı taşı"
            className="rounded-md border border-stone px-2 py-1 font-body text-xs text-olive transition-colors hover:bg-cream-deep disabled:opacity-25"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => setEditingCat((v) => !v)}
            className="rounded-md border border-stone px-3 py-1 font-body text-xs font-semibold text-charcoal transition-colors hover:bg-cream-deep"
          >
            {editingCat ? 'Kapat' : 'Kategoriyi düzenle'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDeleteCategory}
            className="rounded-md border border-wine/40 px-3 py-1 font-body text-xs font-semibold text-wine transition-colors hover:bg-wine/5 disabled:opacity-40"
          >
            Sil
          </button>
        </div>
      }
      contentClassName="space-y-3"
    >
      {editingCat && (
        <div className="space-y-3 rounded-md border border-stone bg-cream-deep/30 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Kategori adı</label>
              <input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Slug (URL)</label>
              <input
                value={catForm.slug}
                onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Açıklama</label>
            <textarea
              value={catForm.description ?? ''}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              rows={2}
              className={cn(inputCls, 'resize-y')}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-charcoal">
            <input
              type="checkbox"
              checked={catForm.isActive}
              onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
              className="h-4 w-4 accent-olive"
            />
            Menüde göster
          </label>
          <button
            type="button"
            disabled={busy || !catForm.name.trim() || !catForm.slug.trim()}
            onClick={handleSaveCategory}
            className="rounded-md bg-olive px-4 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:opacity-40"
          >
            {busy ? 'Kaydediliyor…' : 'Kategoriyi kaydet'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="font-body text-sm text-muted">Bu kategoride henüz ürün yok.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <ItemRow
              key={item.id}
              item={item}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              onEdited={(next) => setItems(items.map((it) => (it.id === next.id ? next : it)))}
              onDeleted={() => setItems(items.filter((it) => it.id !== item.id))}
              onMoved={(dir) => handleItemMove(i, dir)}
            />
          ))}
        </ul>
      )}

      {addingItem ? (
        <ItemForm
          value={newItem}
          onChange={setNewItem}
          onSubmit={handleAddItem}
          onCancel={() => {
            setNewItem(emptyItemForm());
            setAddingItem(false);
          }}
          submitting={busy}
          submitLabel="Ürünü ekle"
        />
      ) : (
        <button
          type="button"
          onClick={() => setAddingItem(true)}
          className="rounded-md border border-dashed border-stone px-4 py-2 font-body text-sm font-semibold text-olive transition-colors hover:border-olive hover:bg-cream-deep"
        >
          + Ürün ekle
        </button>
      )}
      {dialog}
    </AdminSurface>
  );
}

/* --- New category form ----------------------------------------------------- */

function NewCategoryForm({ onCreated }: { onCreated: (c: AdminMenuCategory) => void }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  // Auto-suggest a slug from the name until the user edits the slug directly.
  const [slugTouched, setSlugTouched] = useState(false);
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    const result = await createCategoryAction({
      name: name.trim(),
      slug: (slugTouched ? slug : slugify(name)).trim(),
      description: description.trim() || null,
      isActive: true,
    });
    setBusy(false);
    if (result.ok && result.data) {
      onCreated(result.data);
      setName('');
      setSlug('');
      setDescription('');
      setSlugTouched(false);
      toast.success('Kategori eklendi.');
    } else if (!result.ok) {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Kategori adı</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="örn: Tatlılar"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Slug (URL)</label>
          <input
            value={slugTouched ? slug : slugify(name)}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="tatlilar"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Açıklama (opsiyonel)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={cn(inputCls, 'resize-y')}
        />
      </div>
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="rounded-md bg-terracotta px-5 py-2 font-body text-sm font-semibold text-ivory transition-colors hover:bg-terracotta/90 disabled:opacity-40"
      >
        {busy ? 'Ekleniyor…' : 'Kategori ekle'}
      </button>
    </form>
  );
}

/* --- Main client ----------------------------------------------------------- */

export function MenuClient({ initialCategories }: { initialCategories: AdminMenuCategory[] }) {
  const toast = useToast();
  const [categories, setCategories] = useState(initialCategories);

  const updateCategory = (next: AdminMenuCategory) =>
    setCategories((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  const handleCategoryMove = async (index: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index];
    const b = categories[target];
    if (!a || !b) return;
    const previous = categories;
    const next = [...categories];
    next[index] = b;
    next[target] = a;
    setCategories(next);
    const result = await reorderCategoriesAction(
      next.map((c, i) => ({ id: c.id, sortOrder: i + 1 })),
    );
    if (!result.ok) {
      setCategories(previous);
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <AdminCollapsible
        title="Yeni kategori ekle"
        description="Menü kategorileri (örn. Topraktan, Denizden). Ürünler bir kategoriye bağlıdır."
      >
        <NewCategoryForm onCreated={(c) => setCategories((prev) => [...prev, c])} />
      </AdminCollapsible>

      {categories.length === 0 ? (
        <AdminEmptyState
          title="Henüz kategori yok"
          description="Önce bir kategori ekleyin, ardından o kategoriye ürün ekleyebilirsiniz."
        />
      ) : (
        categories.map((category, i) => (
          <CategoryBlock
            key={category.id}
            category={category}
            isFirst={i === 0}
            isLast={i === categories.length - 1}
            onCategoryChange={updateCategory}
            onCategoryDelete={() => setCategories((prev) => prev.filter((c) => c.id !== category.id))}
            onCategoryMove={(dir) => handleCategoryMove(i, dir)}
          />
        ))
      )}
    </div>
  );
}
