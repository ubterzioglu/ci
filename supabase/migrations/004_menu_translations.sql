-- ============================================================================
-- 004_menu_translations.sql — per-locale text for admin-managed menu content
--
-- WHY: menu_categories / menu_items stored a single language (Turkish), so
-- src/lib/db/menu.ts bailed out to the static content in src/content/ for any
-- non-default locale. Anything the restaurant added or edited in /admin/menu
-- was therefore invisible on the EN/DE/RU menus — a new dish showed up only in
-- Turkish, and an edited price never reached the other languages at all.
--
-- SHAPE: one jsonb column per table, keyed by locale, holding only the
-- translatable fields:
--
--   {"en": {"name": "...", "description": "..."},
--    "de": {"name": "...", "description": null},
--    "ru": {"name": "...", "description": "..."}}
--
-- Turkish stays in the existing `name` / `description` columns — it is the
-- source, never duplicated into the jsonb. A locale, or a field within one,
-- that is missing or blank falls back to Turkish at read time, so the menu is
-- always complete even before translations land.
--
-- Chosen over per-locale columns so adding a language later (French, say) is a
-- config change rather than another migration.
-- ============================================================================

alter table public.menu_categories
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.menu_items
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- Guard the shape at the boundary: the column must be a JSON *object* keyed by
-- locale, not an array or scalar. Field-level validation lives in the Zod
-- schemas in src/app/admin/(panel)/menu/actions.ts.
alter table public.menu_categories
  drop constraint if exists menu_categories_translations_is_object;
alter table public.menu_categories
  add constraint menu_categories_translations_is_object
  check (jsonb_typeof(translations) = 'object');

alter table public.menu_items
  drop constraint if exists menu_items_translations_is_object;
alter table public.menu_items
  add constraint menu_items_translations_is_object
  check (jsonb_typeof(translations) = 'object');

comment on column public.menu_categories.translations is
  'Per-locale overrides for name/description, keyed by locale code (en/de/ru). Turkish lives in the base columns and is the fallback.';

comment on column public.menu_items.translations is
  'Per-locale overrides for name/description, keyed by locale code (en/de/ru). Turkish lives in the base columns and is the fallback.';

-- RLS: both tables already expose active rows to anon via existing policies and
-- restrict writes to admins. `translations` is just another column on those
-- rows, so no policy change is needed.
