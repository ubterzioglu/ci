-- Wine entries can have separate glass and bottle prices. The existing `price`
-- column remains the standard/bottle price so food-menu rows are unaffected.
alter table public.menu_items
  add column if not exists glass_price numeric(10, 2),
  add column if not exists is_coravin boolean not null default false;

alter table public.menu_items
  drop constraint if exists menu_items_glass_price_nonnegative;
alter table public.menu_items
  add constraint menu_items_glass_price_nonnegative
  check (glass_price is null or glass_price >= 0);

comment on column public.menu_items.glass_price is
  'Optional by-the-glass or serving price; used by wine-menu entries.';
comment on column public.menu_items.is_coravin is
  'Whether a wine glass serving uses the Coravin preservation system.';
