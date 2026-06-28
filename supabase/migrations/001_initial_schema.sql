-- ============================================================================
-- Çi Neo Cucina — initial schema
-- ----------------------------------------------------------------------------
-- Tables: site_settings, pages, menu_categories, menu_items, media_assets,
--         reservation_requests, contact_messages, redirects
--
-- Security model (see supabase/README + MIGRATION_NOTES.md):
--   * RLS is enabled on every table.
--   * Public (anon) READ is allowed only for published / active content.
--   * Public (anon) INSERT is allowed only for reservation_requests and
--     contact_messages (the two public-facing forms).
--   * No public UPDATE / DELETE policies exist anywhere. Content is managed
--     server-side with the service_role key (which bypasses RLS) or via the
--     Supabase dashboard.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. site_settings — key/value JSON config (nav, contact, hours, social, …)
-- ============================================================================
create table if not exists public.site_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  value      jsonb not null,
  is_public  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_key_idx on public.site_settings (key);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 2. pages — CMS-style page content (markdown + structured JSON)
-- ============================================================================
create table if not exists public.pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  content_md      text,
  content_json    jsonb,
  seo_title       text,
  seo_description text,
  og_image_url    text,
  status          text not null default 'published',
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint pages_status_check check (status in ('published', 'draft', 'archived'))
);

create index if not exists pages_slug_idx       on public.pages (slug);
create index if not exists pages_status_idx      on public.pages (status);
create index if not exists pages_sort_order_idx  on public.pages (sort_order);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. menu_categories
-- ============================================================================
create table if not exists public.menu_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists menu_categories_slug_idx       on public.menu_categories (slug);
create index if not exists menu_categories_is_active_idx  on public.menu_categories (is_active);
create index if not exists menu_categories_sort_order_idx on public.menu_categories (sort_order);

create trigger menu_categories_set_updated_at
  before update on public.menu_categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 4. menu_items
-- ============================================================================
create table if not exists public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.menu_categories(id) on delete set null,
  name          text not null,
  description   text,
  price         numeric(10, 2),
  currency      text not null default 'TRY',
  image_url     text,
  tags          text[] not null default '{}',
  allergens     text[] not null default '{}',
  dietary_flags text[] not null default '{}',
  sort_order    integer not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists menu_items_category_id_idx on public.menu_items (category_id);
create index if not exists menu_items_is_active_idx   on public.menu_items (is_active);
create index if not exists menu_items_sort_order_idx  on public.menu_items (sort_order);

create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 5. media_assets — image manifest (source URL → local storage path)
-- ============================================================================
create table if not exists public.media_assets (
  id           uuid primary key default gen_random_uuid(),
  source_url   text,
  storage_path text,
  alt          text,
  title        text,
  width        integer,
  height       integer,
  mime_type    text,
  context      text,
  created_at   timestamptz not null default now()
);

create index if not exists media_assets_context_idx on public.media_assets (context);

-- ============================================================================
-- 6. reservation_requests — public form submissions
-- ============================================================================
create table if not exists public.reservation_requests (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  email          text,
  phone          text,
  party_size     integer not null,
  requested_date date not null,
  requested_time time not null,
  message        text,
  status         text not null default 'new',
  source         text not null default 'website',
  created_at     timestamptz not null default now(),
  constraint reservation_party_size_check check (party_size between 1 and 50),
  constraint reservation_status_check
    check (status in ('new', 'confirmed', 'declined', 'cancelled'))
);

create index if not exists reservation_requests_status_idx     on public.reservation_requests (status);
create index if not exists reservation_requests_created_at_idx on public.reservation_requests (created_at desc);

-- ============================================================================
-- 7. contact_messages — public form submissions
-- ============================================================================
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  status     text not null default 'new',
  source     text not null default 'website',
  created_at timestamptz not null default now(),
  constraint contact_status_check check (status in ('new', 'read', 'replied', 'archived'))
);

create index if not exists contact_messages_status_idx     on public.contact_messages (status);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- ============================================================================
-- 8. redirects — legacy Wix slug → new slug (served via middleware)
-- ============================================================================
create table if not exists public.redirects (
  id          uuid primary key default gen_random_uuid(),
  source_path text unique not null,
  target_path text not null,
  status_code integer not null default 301,
  created_at  timestamptz not null default now(),
  constraint redirects_status_code_check check (status_code in (301, 302, 307, 308))
);

create index if not exists redirects_source_path_idx on public.redirects (source_path);

-- ============================================================================
-- Row Level Security
-- ----------------------------------------------------------------------------
-- Enable RLS on every table. Without policies, RLS denies all access to the
-- anon/authenticated roles by default (service_role bypasses RLS).
-- ============================================================================
alter table public.site_settings        enable row level security;
alter table public.pages                 enable row level security;
alter table public.menu_categories       enable row level security;
alter table public.menu_items            enable row level security;
alter table public.media_assets          enable row level security;
alter table public.reservation_requests  enable row level security;
alter table public.contact_messages      enable row level security;
alter table public.redirects             enable row level security;

-- --- Public READ policies ---------------------------------------------------

-- Public site settings (e.g. contact info, hours, social) — only is_public rows
create policy "Public can read public site settings"
  on public.site_settings for select
  to anon, authenticated
  using (is_public = true);

-- Published pages
create policy "Public can read published pages"
  on public.pages for select
  to anon, authenticated
  using (status = 'published');

-- Active menu categories
create policy "Public can read active menu categories"
  on public.menu_categories for select
  to anon, authenticated
  using (is_active = true);

-- Active menu items
create policy "Public can read active menu items"
  on public.menu_items for select
  to anon, authenticated
  using (is_active = true);

-- Media assets (image manifest is non-sensitive)
create policy "Public can read media assets"
  on public.media_assets for select
  to anon, authenticated
  using (true);

-- Redirects (needed by middleware via the anon client)
create policy "Public can read redirects"
  on public.redirects for select
  to anon, authenticated
  using (true);

-- --- Public INSERT policies -------------------------------------------------

-- Anyone may submit a reservation request (WITH CHECK constrains the payload)
create policy "Public can submit reservation requests"
  on public.reservation_requests for insert
  to anon, authenticated
  with check (
    status = 'new'
    and source = 'website'
    and char_length(name) between 1 and 200
    and party_size between 1 and 50
  );

-- Anyone may submit a contact message
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    status = 'new'
    and source = 'website'
    and char_length(name) between 1 and 200
    and char_length(message) between 1 and 5000
  );

-- NOTE: No SELECT policies on reservation_requests / contact_messages, so the
-- public can insert but never read submissions. No UPDATE/DELETE policies on
-- any table — staff management happens via service_role / dashboard.

-- ============================================================================
-- Grants — expose tables to the Data (REST) API for the anon role.
-- RLS still governs which rows are visible; these grants govern table access.
-- ============================================================================
grant usage on schema public to anon, authenticated;

grant select on public.site_settings  to anon, authenticated;
grant select on public.pages           to anon, authenticated;
grant select on public.menu_categories to anon, authenticated;
grant select on public.menu_items      to anon, authenticated;
grant select on public.media_assets    to anon, authenticated;
grant select on public.redirects       to anon, authenticated;

grant insert on public.reservation_requests to anon, authenticated;
grant insert on public.contact_messages     to anon, authenticated;
