-- ============================================================================
-- 005_menu_kind.sql — separate the wine list from the food menu
--
-- WHY: /menu has always had two tabs, but only the food one had data. The wine
-- tab showed a hardcoded "ask our team" notice because the Wix export never
-- included the wine list. The restaurant now needs to manage it themselves.
--
-- Rather than a second set of tables, categories carry a `kind`. The wine list
-- is the same shape as the food menu — categories holding priced items — so it
-- reuses the whole existing stack: the admin panel, the per-locale
-- `translations` jsonb from 004, ordering, and show/hide.
--
-- Items need no column of their own: an item belongs to a category, and the
-- category decides which menu it is on.
-- ============================================================================

alter table public.menu_categories
  add column if not exists kind text not null default 'food';

alter table public.menu_categories
  drop constraint if exists menu_categories_kind_check;
alter table public.menu_categories
  add constraint menu_categories_kind_check check (kind in ('food', 'wine'));

-- The public menu and the admin panel both filter by kind on every read.
create index if not exists menu_categories_kind_idx on public.menu_categories (kind);

comment on column public.menu_categories.kind is
  'Which menu this category belongs to: food (default) or wine. Items inherit it through category_id.';

-- Existing rows keep the default 'food', so the food menu is untouched.
-- RLS is unchanged: the existing policies are row-level over the same table.
