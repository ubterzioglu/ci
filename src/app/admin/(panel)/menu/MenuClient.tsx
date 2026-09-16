'use client';

import { useState } from 'react';

import { AdminSurface, AdminEmptyState, StatusPill } from '@/components/admin/primitives';
import { AdminCollapsible } from '@/components/admin/Collapsible';
import { useToast } from '@/components/admin/Toast';
import { useConfirm } from '@/components/admin/useConfirm';
import { moveByOne } from '@/lib/admin/reorder';
import { cn, formatPrice } from '@/lib/utils';
import {
  type AdminMenuCategory,
  type AdminMenuItem,
  type CategoryInput,
  type MenuTranslations,
  type MenuKind,
} from '@/lib/db/admin/menu-types';
import { LocalizedField, TranslateAllFields } from './LocalizedFields';
import {
  ItemForm,
  emptyItemForm,
  formToInput,
  inputCls,
  itemToForm,
  labelCls,
  type ItemFormValue,
} from './ItemForm';
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
        'group border-stone bg-marble flex items-start gap-3 rounded-md border px-3 py-2.5',
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
          className="text-muted hover:text-olive transition-colors disabled:opacity-25"
        >
          ▲
        </button>
        <button
          type="button"
          disabled={isLast || busy}
          onClick={() => onMoved('down')}
          aria-label="Aşağı taşı"
          className="text-muted hover:text-olive transition-colors disabled:opacity-25"
        >
          ▼
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-charcoal text-base">{item.name}</span>
          {price && (
            <span className="font-body text-olive-deep text-sm font-semibold">{price}</span>
          )}
          {!item.isActive && <StatusPill tone="neutral">Gizli</StatusPill>}
        </div>
        {item.description && (
          <p className="font-body text-muted mt-0.5 text-xs leading-5">{item.description}</p>
        )}
        {(item.tags.length > 0 || item.allergens.length > 0) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {item.tags.map((t) => (
              <StatusPill key={t} tone="olive">
                {t}
              </StatusPill>
            ))}
            {item.allergens.length > 0 && (
              <span className="font-body text-muted/80 text-[11px]">
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
          className="border-stone font-body text-olive hover:bg-cream-deep rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40"
        >
          {item.isActive ? 'Gizle' : 'Göster'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing(true)}
          className="border-stone font-body text-charcoal hover:bg-cream-deep rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40"
        >
          Düzenle
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="border-wine/40 font-body text-wine hover:bg-wine/5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors disabled:opacity-40"
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
    translations: category.translations,
    kind: category.kind,
  });
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

  const handleItemMove = (index: number, dir: 'up' | 'down') =>
    moveByOne({
      list: items,
      index,
      direction: dir,
      apply: setItems,
      persist: reorderItemsAction,
      onError: toast.error,
    });

  /* category handlers ----- */
  const handleSaveCategory = async () => {
    const description = catForm.description?.trim() || null;
    setBusy(true);
    const result = await updateCategoryAction(category.id, { ...catForm, description });
    setBusy(false);
    if (result.ok) {
      onCategoryChange({
        ...category,
        name: catForm.name,
        slug: catForm.slug,
        translations: catForm.translations,
        description,
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
            className="border-stone font-body text-olive hover:bg-cream-deep rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-25"
          >
            ▲
          </button>
          <button
            type="button"
            disabled={isLast || busy}
            onClick={() => onCategoryMove('down')}
            aria-label="Kategoriyi aşağı taşı"
            className="border-stone font-body text-olive hover:bg-cream-deep rounded-md border px-2 py-1 text-xs transition-colors disabled:opacity-25"
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => setEditingCat((v) => !v)}
            className="border-stone font-body text-charcoal hover:bg-cream-deep rounded-md border px-3 py-1 text-xs font-semibold transition-colors"
          >
            {editingCat ? 'Kapat' : 'Kategoriyi düzenle'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleDeleteCategory}
            className="border-wine/40 font-body text-wine hover:bg-wine/5 rounded-md border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            Sil
          </button>
        </div>
      }
      contentClassName="space-y-3"
    >
      {editingCat && (
        <div className="border-stone bg-cream-deep/30 space-y-3 rounded-md border p-4">
          <TranslateAllFields
            name={catForm.name}
            description={catForm.description ?? ''}
            translations={catForm.translations}
            onTranslationsChange={(t) => setCatForm({ ...catForm, translations: t })}
            busy={busy}
          />

          <LocalizedField
            label="Kategori adı"
            field="name"
            base={catForm.name}
            onBaseChange={(v) => setCatForm({ ...catForm, name: v })}
            translations={catForm.translations}
            onTranslationsChange={(t) => setCatForm({ ...catForm, translations: t })}
            busy={busy}
          />

          <LocalizedField
            label="Açıklama"
            field="description"
            base={catForm.description ?? ''}
            onBaseChange={(v) => setCatForm({ ...catForm, description: v })}
            translations={catForm.translations}
            onTranslationsChange={(t) => setCatForm({ ...catForm, translations: t })}
            multiline
            busy={busy}
          />

          <div className="max-w-sm">
            <label className={labelCls}>Slug (URL)</label>
            <input
              value={catForm.slug}
              onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
              className={inputCls}
            />
          </div>
          <label className="font-body text-charcoal flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={catForm.isActive}
              onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
              className="accent-olive h-4 w-4"
            />
            Menüde göster
          </label>
          <button
            type="button"
            disabled={busy || !catForm.name.trim() || !catForm.slug.trim()}
            onClick={handleSaveCategory}
            className="bg-olive font-body text-ivory hover:bg-olive-deep rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
          >
            {busy ? 'Kaydediliyor…' : 'Kategoriyi kaydet'}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="font-body text-muted text-sm">Bu kategoride henüz ürün yok.</p>
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
          className="border-stone font-body text-olive hover:border-olive hover:bg-cream-deep rounded-md border border-dashed px-4 py-2 text-sm font-semibold transition-colors"
        >
          + Ürün ekle
        </button>
      )}
      {dialog}
    </AdminSurface>
  );
}

/* --- New category form ----------------------------------------------------- */

function NewCategoryForm({
  kind,
  onCreated,
}: {
  kind: MenuKind;
  onCreated: (c: AdminMenuCategory) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [translations, setTranslations] = useState<MenuTranslations>({});
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
      translations,
      kind,
    });
    setBusy(false);
    if (result.ok && result.data) {
      onCreated(result.data);
      setName('');
      setSlug('');
      setDescription('');
      setTranslations({});
      setSlugTouched(false);
      toast.success('Kategori eklendi.');
    } else if (!result.ok) {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <TranslateAllFields
        name={name}
        description={description}
        translations={translations}
        onTranslationsChange={setTranslations}
        busy={busy}
      />

      <LocalizedField
        label="Kategori adı"
        field="name"
        base={name}
        onBaseChange={setName}
        translations={translations}
        onTranslationsChange={setTranslations}
        placeholder="örn: Tatlılar"
        busy={busy}
      />

      <LocalizedField
        label="Açıklama (opsiyonel)"
        field="description"
        base={description}
        onBaseChange={setDescription}
        translations={translations}
        onTranslationsChange={setTranslations}
        multiline
        busy={busy}
      />

      <div className="max-w-sm">
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
      <button
        type="submit"
        disabled={busy || !name.trim()}
        className="bg-terracotta font-body text-ivory hover:bg-terracotta/90 rounded-md px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
      >
        {busy ? 'Ekleniyor…' : 'Kategori ekle'}
      </button>
    </form>
  );
}

/* --- Main client ----------------------------------------------------------- */

export function MenuClient({
  initialCategories,
  kind,
}: {
  initialCategories: AdminMenuCategory[];
  /** Which menu this panel edits — new categories are created into it. */
  kind: MenuKind;
}) {
  const toast = useToast();
  const [categories, setCategories] = useState(initialCategories);

  const updateCategory = (next: AdminMenuCategory) =>
    setCategories((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  const handleCategoryMove = (index: number, dir: 'up' | 'down') =>
    moveByOne({
      list: categories,
      index,
      direction: dir,
      apply: setCategories,
      persist: reorderCategoriesAction,
      onError: toast.error,
    });

  return (
    <div className="space-y-6">
      <AdminCollapsible
        title="Yeni kategori ekle"
        description="Menü kategorileri (örn. Topraktan, Denizden). Ürünler bir kategoriye bağlıdır."
      >
        <NewCategoryForm kind={kind} onCreated={(c) => setCategories((prev) => [...prev, c])} />
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
            onCategoryDelete={() =>
              setCategories((prev) => prev.filter((c) => c.id !== category.id))
            }
            onCategoryMove={(dir) => handleCategoryMove(i, dir)}
          />
        ))
      )}
    </div>
  );
}
