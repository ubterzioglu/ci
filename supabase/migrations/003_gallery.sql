-- ============================================================================
-- Çi Neo Cucina — gallery management
-- ----------------------------------------------------------------------------
-- Backs the /admin/gallery panel, which lets an admin upload "Atmosfer"
-- (#CiNeoCucina) photos and give each an optional short caption shown in the
-- bottom-left corner on the public site.
--
-- Builds on the existing public.media_assets manifest (001_initial_schema.sql):
--   * caption    — optional short overlay text (≤40 chars; enforced in the app
--                  via Zod and here with a length CHECK as a backstop).
--   * sort_order — display order within a context (gallery grid order).
--
-- Storage: a public `gallery` bucket holds the uploaded image files. Public
-- READ so the site can render them; writes are restricted to allow-listed
-- admins (is_admin(), from 002_admin.sql). The admin panel itself uploads with
-- the service-role key, which bypasses RLS — the policies below are
-- defense-in-depth for any anon/authenticated path.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. media_assets — add caption + sort_order
-- ----------------------------------------------------------------------------
alter table public.media_assets
  add column if not exists caption text,
  add column if not exists sort_order integer not null default 0;

-- Backstop the 40-char caption limit at the database layer (the app validates
-- first with a friendlier message). NULL is allowed (no caption).
alter table public.media_assets
  drop constraint if exists media_assets_caption_len_check;
alter table public.media_assets
  add constraint media_assets_caption_len_check
  check (caption is null or char_length(caption) <= 40);

create index if not exists media_assets_context_sort_idx
  on public.media_assets (context, sort_order);

-- ----------------------------------------------------------------------------
-- 2. media_assets RLS — public read (gallery is public content) + admin writes.
--    001 created the table; this adds the policies the gallery panel relies on.
-- ----------------------------------------------------------------------------
alter table public.media_assets enable row level security;

drop policy if exists "Public can read media assets" on public.media_assets;
create policy "Public can read media assets"
  on public.media_assets for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage media assets" on public.media_assets;
create policy "Admins manage media assets"
  on public.media_assets for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.media_assets to anon, authenticated;
grant insert, update, delete on public.media_assets to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Storage — public `gallery` bucket for uploaded photos.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read gallery objects" on storage.objects;
create policy "Public can read gallery objects"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

drop policy if exists "Admins can upload gallery objects" on storage.objects;
create policy "Admins can upload gallery objects"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins can update gallery objects" on storage.objects;
create policy "Admins can update gallery objects"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "Admins can delete gallery objects" on storage.objects;
create policy "Admins can delete gallery objects"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
