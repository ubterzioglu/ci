# Handover — Çi Neo Cucina rebuild (session 1 → next session)

> Read this first. It captures everything done, the current state, open
> decisions, and exactly where to pick up. The repo is already a working,
> deployed-ready Next.js 16 + Supabase site.

Repo: `https://github.com/ubterzioglu/ci` · Branch: `main` · Working dir: `c:\temp_private\ci`
Last pushed commit at handover: `3d1b92a` (docs: add Coolify deployment guide)

---

## 1. What this project is

Rebuild of the restaurant **Çi Neo Cucina** (chef **Simge Manacıoğlu**, Kaş /
Antalya) — migrating a Wix site into a modern, database-backed web app. The
Wix export lives in **`/ref`** (Turkish content, menu JSON/CSV, SEO, nav,
contact, image manifest) and is the **source of truth** — do not fabricate
facts not present there.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind
CSS v4 · Supabase (Postgres + RLS) · pnpm. Forms = Server Actions + Zod.
**Turkish-first**, localization-ready (EN/DE via DeepL). Deploy target =
**Coolify** (Dockerfile, standalone output) + Vercel-compatible.

---

## 2. Current state — DONE and VERIFIED

- ✅ `pnpm install` / `typecheck` / `lint` / `build` all pass.
- ✅ Supabase schema **applied + seeded on the live cloud project**
  (ref `wwzdqqtyeuphzdyneydr`): 8 tables, RLS, triggers, indexes.
  Seeded: 21 menu items, 3 categories, 5 pages, 13 media, 1 redirect.
- ✅ RLS verified by direct test: anon can read active menu + insert
  reservations/contact; anon CANNOT read submissions or insert invalid rows.
- ✅ Runtime smoke test (prod server): all 8 pages → 200, `/about-1` → 308 →
  `/about`, robots/sitemap → 200, 404 works, menu renders from Supabase, **no
  Wix branding** ("Powered by Wix" / "Michael Bolano" removed), JSON-LD present.
- ✅ Code-reviewed; fixed 3 real bugs (timezone date `min`, "12+" party-size
  data loss, anon `.select()`-after-insert RLS failure).
- ✅ Pushed to GitHub with a descriptive commit + decision trailers.
- ✅ Secrets safe: `.env.local` git-ignored and never committed.

### Pages built

Home `/`, Menu `/menu` (DB-backed + local fallback), About `/about`,
Reservations `/reservations`, Experiences `/experiences`, Contact `/contact`,
`/impressum`, `/datenschutz`, custom 404. SEO: `sitemap.xml`, `robots.txt`,
`manifest.webmanifest`, `icon.svg`, JSON-LD (Restaurant/WebSite/Menu/Breadcrumb).

---

## 3. Key decisions (also in MIGRATION_NOTES.md)

- **Turkish-first, TRY (₺) prices** — source content wins over the original
  brief's English/EUR assumption.
- **`/about`** is the slug, with a **301 from `/about-1`** (old Wix slug) — in
  `next.config.ts` redirects AND `src/proxy.ts` (Next 16 renamed middleware →
  proxy; the function is `export function proxy`).
- Separate **`/contact`** page created (source only had a contact section).
- **Menu allergens were INFERRED** from ingredients in `src/content/menu-data.ts`
  — ⚠️ must be confirmed by the restaurant before being relied upon.
- Form writes prefer the **service-role (admin) client** so they can insert AND
  return the id; anon fallback inserts without `.select()` (no public SELECT
  policy by design).

---

## 4. Important files / where things live

| Area                                      | Path                                             |
| ----------------------------------------- | ------------------------------------------------ |
| Brand facts, nav, contact (single source) | `src/lib/site-config.ts`                         |
| Local content (fallback + seed source)    | `src/content/{menu,pages,media}-data.ts`         |
| DB access (Supabase-or-local fallback)    | `src/lib/db/{menu,pages,forms}.ts`               |
| Supabase clients                          | `src/lib/supabase/{server,client,admin,env}.ts`  |
| Migration SQL                             | `supabase/migrations/001_initial_schema.sql`     |
| Seed script                               | `scripts/seed-supabase.ts` (`pnpm db:seed`)      |
| Forms + server actions                    | `src/components/forms/*`, `src/app/actions.ts`   |
| Sections / layout / UI primitives         | `src/components/{sections,layout,ui,menu}/`      |
| SEO helpers                               | `src/lib/seo/{metadata,schema}.ts`               |
| i18n scaffold (TR filled; EN/DE TODO)     | `src/lib/i18n/*`, `scripts/translate-content.ts` |
| Deploy guide                              | `DEPLOY_COOLIFY.md`                              |
| Outstanding panel-only data               | `TODO_PANEL_EXPORTS.md`                          |

`@/` alias → `src/`. Scripts run via `tsx` and are excluded from app tsconfig/lint.

---

## 5. Environment (`.env.local`, git-ignored — DO NOT COMMIT)

Already populated locally. Keys present:
`NEXT_PUBLIC_SITE_URL` (currently the **temporary domain** `https://notyetbro.club`),
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_ACCESS_TOKEN`,
`SUPABASE_DB_URL`, `DEEPL_API_KEY`, `RESERVATION/CONTACT_NOTIFICATION_EMAIL`,
`RESEND_API_KEY` (empty), and a **`WIX_API`** bearer token (see §7).

`.env.example` documents all of these (no real values).

---

## 6. NEXT STEP — Coolify deployment (in progress, user is driving)

User chose **Coolify Git integration**. Follow `DEPLOY_COOLIFY.md`:

1. Coolify → New → Application → GitHub repo `ubterzioglu/ci`, branch `main`,
   build pack **Dockerfile**, port **3000**.
2. FQDN = `https://notyetbro.club` (temporary; final = `www.cineocucina.com`).
3. Add env vars — mark `NEXT_PUBLIC_*` as **Build Variables** (inlined at build).
4. Deploy; enable auto-deploy webhook.

**SSH note:** VPS `openclaw-vps` = `217.154.200.0` user `ubtadmin`, but the
config has no `IdentityFile` and a plain connect got `Permission denied
(publickey)`. Do NOT loop through keys (gets blocked as credential-probing).
If the user wants API-driven deploy, ask for a **Coolify API token + instance
URL**. Otherwise the dashboard path needs no SSH from us.

When the real domain is live: set FQDN + `NEXT_PUBLIC_SITE_URL` to
`https://www.cineocucina.com` and optionally revert the fallback in
`src/lib/site-config.ts`.

---

## 7. Open items / good next tasks

- **WIX_API token now in `.env.local`** → the next session could call the Wix
  REST API (account/tenant `31bec15f-...`, app `a5a9799c-...`) to pull the
  **real wine/drinks menu**, **hi-res original media**, and possibly the
  **exact address / opening hours** that were missing from the static export.
  This is the highest-value follow-up — it fills most of `TODO_PANEL_EXPORTS.md`.
- Replace remote Wix CDN images with local ones: `pnpm assets:download` then
  the components auto-prefer `/public/images/imported/*` (see `src/lib/images.ts`).
- Generate a real `/og-default.jpg` (referenced by SEO; not yet created).
- Wire EN/DE: run `pnpm i18n:translate` (DeepL), then have a human review.
- Optional: add Resend key to enable form email notifications (graceful no-op now).
- Confirm inferred allergens with the restaurant.

---

## 8. Gotchas for the next session

- **Auto-commit hook is active** — it periodically commits/pushes with a `.`
  message. Amend to a real message + `git push --force-with-lease` only with
  explicit user OK (force-push to `main` is gated by the safety classifier).
- **Lockfile must stay in sync** — the Dockerfile uses `--frozen-lockfile`.
  After any `package.json` change, run `pnpm install` and commit `pnpm-lock.yaml`.
- `next lint` is removed in Next 16 → lint script is `eslint .` with flat config
  importing `eslint-config-next/core-web-vitals` + `/typescript` directly.
- Home & Menu are dynamic (ƒ) because they read Supabase via cookies; the rest
  prerender static.
- Verify any file/flag this doc names still exists before relying on it.

---

## 9. Quick commands

```bash
pnpm install
pnpm dev                 # local dev
pnpm build && pnpm start # prod (set PORT if 3000 is busy: PORT=3100 pnpm start)
pnpm typecheck && pnpm lint
pnpm db:seed             # re-seed Supabase from local content
# apply schema to a fresh DB:
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_initial_schema.sql
```
