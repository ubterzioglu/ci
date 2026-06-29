-- ============================================================================
-- Çi Neo Cucina — admin panel schema
-- ----------------------------------------------------------------------------
-- Adds the `/admin` panel's data model and authorization layer on top of
-- 001_initial_schema.sql:
--
--   * admins              — email allowlist linked to auth.users; the source of
--                           truth for who may sign in to /admin.
--   * is_admin()          — SECURITY DEFINER helper used by every admin RLS
--                           policy below (defense in depth: even an anon-key
--                           authenticated write is denied unless is_admin()).
--   * revision_requests   — internal content-change requests (Kimsin / İstek /
--                           Aciliyet 1-10 / Durum). Admin-only.
--   * revision_comments   — threaded discussion under each revision request.
--   * reservation_requests admin policies — SELECT + UPDATE(status) for admins
--                           (the public anon INSERT policy from 001 is kept).
--
-- Auth model: create the admin user in Supabase Dashboard → Authentication →
-- Users, then insert a matching row into public.admins (email must match,
-- lower-cased). The service-role key still bypasses RLS for trusted server work.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. admins — who may access /admin
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade,
  email      text unique not null,
  created_at timestamptz not null default now()
);

create index if not exists admins_email_idx on public.admins (lower(email));

alter table public.admins enable row level security;

-- ----------------------------------------------------------------------------
-- 2. is_admin() — true when the current authenticated user is an allow-listed
--    admin. SECURITY DEFINER so the policy can read public.admins regardless of
--    the caller's own RLS. Matches on auth.uid() first, then JWT email (covers
--    rows seeded before the user_id backfill).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
       or lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- An admin may read the admins table (e.g. to render "who has access");
-- writes to it happen via the service-role key / dashboard only.
drop policy if exists "Admins can read admins" on public.admins;
create policy "Admins can read admins"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. revision_requests — internal change requests, managed entirely in /admin
-- ----------------------------------------------------------------------------
create table if not exists public.revision_requests (
  id         uuid primary key default gen_random_uuid(),
  requester  text not null,
  body       text not null,
  urgency    smallint not null default 5 check (urgency between 1 and 10),
  status     text not null default 'open' check (status in ('open', 'progress', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists revision_requests_created_at_idx
  on public.revision_requests (created_at desc);
create index if not exists revision_requests_status_idx
  on public.revision_requests (status);

alter table public.revision_requests enable row level security;

drop policy if exists "Admins manage revision requests" on public.revision_requests;
create policy "Admins manage revision requests"
  on public.revision_requests for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. revision_comments — threaded comments under a revision request
-- ----------------------------------------------------------------------------
create table if not exists public.revision_comments (
  id          uuid primary key default gen_random_uuid(),
  revision_id uuid not null references public.revision_requests (id) on delete cascade,
  author      text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists revision_comments_revision_idx
  on public.revision_comments (revision_id, created_at asc);

alter table public.revision_comments enable row level security;

drop policy if exists "Admins manage revision comments" on public.revision_comments;
create policy "Admins manage revision comments"
  on public.revision_comments for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. reservation_requests — add admin read + status-update policies.
--    The public anon INSERT policy from 001_initial_schema.sql stays intact;
--    these add admin-only visibility and status management.
-- ----------------------------------------------------------------------------
drop policy if exists "Admins can read reservation requests" on public.reservation_requests;
create policy "Admins can read reservation requests"
  on public.reservation_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update reservation requests" on public.reservation_requests;
create policy "Admins can update reservation requests"
  on public.reservation_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Grants — RLS still governs row visibility; these expose the tables/usage
--    to the authenticated role used by the admin panel.
-- ----------------------------------------------------------------------------
grant select on public.admins to authenticated;

grant select, insert, update, delete on public.revision_requests to authenticated;
grant select, insert, update, delete on public.revision_comments to authenticated;

grant select, update on public.reservation_requests to authenticated;
