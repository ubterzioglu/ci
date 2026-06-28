# Handover — hd5

**Project:** Çi Neo Cucina — Wix → Next.js 16 + Supabase restaurant site
**Repo:** `c:\temp_private\ci` (branch `main`)
**Remote:** `https://github.com/ubterzioglu/ci.git`
**Date of handover:** 2026-06-28

---

## TL;DR for the next session

This session fixed the **Coolify/Docker deployment** (it was failing the build), pointed the site at the **temporary domain `notyetbro.club`**, and added a Coolify deployment guide. **Everything is committed AND pushed** — local `HEAD`, local `origin/main`, and the real GitHub `main` all point to the same commit `ed9aa2d` (verified with `git ls-remote origin`). The working tree is clean except for the handover docs themselves (`h1.md`, `hd3.md` untracked — not app code).

**Immediate next step:** the code side is done. Remaining work is **panel configuration** (Coolify env/domain, Supabase Auth redirect URLs, Resend sender domain) that can only be done in those web UIs — see "Action required in panels" below. Nothing blocks a redeploy from the code side.

---

## What was done this session

1. **Fixed the failing Coolify Docker build** — commit `402e46e`.
   - **Symptom:** deploy failed at `Dockerfile:45` with `ERR_PNPM_OUTDATED_LOCKFILE` (build uses `pnpm install --frozen-lockfile`).
   - **Root cause:** `pnpm-lock.yaml` listed `@eslint/eslintrc@3.3.5` as a **direct** devDependency in the `importers` block, but `package.json` never declared it (it's only a _transitive_ dep of `eslint`/`eslint-config-next`). The lockfile was committed 2 min before a final `package.json` edit, so they drifted.
   - **Fix:** regenerated with `pnpm install --lockfile-only` (pnpm 10.28.1, matching `packageManager`). 3-line deletion, `package.json` untouched. **Verified** the exact build command `pnpm install --frozen-lockfile --prod=false` now prints "Lockfile is up to date".

2. **Pointed the site at the temporary domain `notyetbro.club`** — commit `568db88`.
   - `siteConfig.url` in `src/lib/site-config.ts` is the **single source of truth** for all absolute URLs (canonical, Open Graph, sitemap, JSON-LD schema via `src/lib/seo/`). It reads `NEXT_PUBLIC_SITE_URL` with a hardcoded fallback.
   - Changed the fallback default → `https://notyetbro.club` and the `.env.example` default → same. Added comments marking it TEMPORARY.
   - **Verified** `tsc --noEmit` passes (exit 0).
   - **No old domain is hardcoded anywhere else in `src/`** — every absolute URL flows through `siteConfig.url`. The `cineocucina.com` strings in `ref/`, `README.md`, `*.md` are original-Wix-source provenance docs, intentionally left as-is.

3. **Added Coolify deployment guide** — commit `3d1b92a`, file `DEPLOY_COOLIFY.md` (97 lines).

4. **Committed the 13 localized Wix images** — commit `ed9aa2d` (this resolved the "13 uncommitted images" loose end from hd3). Files: `public/images/imported/*.jpg`.

5. **Pushed everything to GitHub.** Confirmed via `git ls-remote origin` that remote `main = ed9aa2d = local HEAD`.

---

## Action required in panels (cannot be done from code)

These are the only remaining steps to make the temp domain fully live. The values for `NEXT_PUBLIC_*` are **baked in at build time**, so changing them requires a **rebuild**, not just a restart.

1. **Coolify** (Configuration → General + Environment):
   - Domain / FQDN → `http://notyetbro.club`
   - Env var → `NEXT_PUBLIC_SITE_URL=https://notyetbro.club` (no trailing slash)
2. **Supabase** (Authentication → URL Configuration):
   - Site URL → `https://notyetbro.club`
   - Redirect URLs → add `https://notyetbro.club/**` (keep `http://localhost:3000/**` for local dev)
3. **Resend** (sender domain — flagged for go-live, separate from the domain swap):
   - `src/lib/email.ts:33` still sends `from: 'Çi Neo Cucina <onboarding@resend.dev>'` (has a TODO at line 3). That test sender only delivers to your own Resend-account email. To email real guests, verify a sender domain in Resend and update that `from:` (e.g. `noreply@notyetbro.club`). **Ask the user which sender address they want before editing.**

---

## Key files & current state

- `src/lib/site-config.ts` — **single source of truth** for site URL + brand facts. Fallback now `https://notyetbro.club`.
- `src/lib/seo/metadata.ts`, `src/lib/seo/schema.ts` — derive canonical/OG/JSON-LD from `siteConfig.url`. No edits needed.
- `src/app/layout.tsx:25` — `metadataBase: new URL(siteConfig.url)`. No edits needed.
- `src/lib/email.ts` — Resend sender still on test address (`onboarding@resend.dev`); see panel step 3.
- `.env.example` — template; `NEXT_PUBLIC_SITE_URL` default now temp domain.
- `DEPLOY_COOLIFY.md` — deployment guide (new this session).
- `pnpm-lock.yaml` — now in sync with `package.json`; `--frozen-lockfile` passes.
- `next.config.ts:20-21` — still allows `static.wixstatic.com` + `static.parastorage.com` image hosts.

## Loose ends / decisions pending

- **Revert temp domain when primary goes live.** When `www.cineocucina.com` is ready, revert ALL of: fallback in `src/lib/site-config.ts`, `.env.example` default, Coolify env var, Coolify FQDN, Supabase Auth URLs, Resend sender. (Saved as a project memory: `temp-domain-notyetbro`.)
- **Wix CDN images in `next.config.ts`:** the 13 images are now localized to `public/images/imported/`. If/once **all** rendered images point to local paths (not Wix CDN), remove `static.wixstatic.com` / `static.parastorage.com` from `next.config.ts:20-21`. Verify nothing still renders a `wixstatic.com` URL before removing.
- **Carried over from hd3 (Wix API) — status unknown this session:** the wine menu and other panel-only data (exact address, Maps link, confirmed opening hours, restaurant-confirmed allergen tags) were still missing as of hd3. This session did not touch Wix API work. See `TODO_PANEL_EXPORTS.md` and hd3.md if resuming that thread.

## Environment notes

- Windows 11, PowerShell primary + Bash tool available. Package manager **pnpm** (`pnpm@10.28.1`, available locally and matches `packageManager`). Node >=20.
- Build path: Coolify → Docker → `pnpm install --frozen-lockfile --prod=false` at `Dockerfile:45`. **Do NOT** switch the Dockerfile to `--no-frozen-lockfile` to "fix" lockfile errors — that hides real drift and defeats reproducible CI builds. Fix the lockfile instead (`pnpm install --lockfile-only`, commit).
- **Security reminder:** never echo the contents of `.env.local`; reference vars by name only.

## Verification evidence (this session)

- `pnpm install --frozen-lockfile --prod=false` → "Lockfile is up to date", exit 0.
- `tsc --noEmit` → exit 0.
- `git ls-remote origin refs/heads/main` → `ed9aa2d…` == local `HEAD`. All work pushed.
