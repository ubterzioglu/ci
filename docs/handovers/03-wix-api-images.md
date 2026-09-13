# Handover — hd3

**Project:** Çi Neo Cucina — Wix → Next.js 16 + Supabase restaurant site migration
**Repo:** `c:\temp_private\ci` (branch `main`, clean before this session)
**Date of handover:** 2026-06-28

---

## TL;DR for the next session

The Wix content migration is ~90% done from a _public_ export that already lived in `ref/`. This session (a) downloaded the 13 Wix CDN images locally, and (b) the user added a **Wix API key** to `.env.local` so we can pull the few panel-only datasets (esp. the wine menu) that the public site never exposed.

**Immediate next step:** wire up Wix API access — but we are BLOCKED on two facts the user still needs to confirm (see "Blocked / waiting on user" below). Do NOT write Wix API code blindly.

---

## What was done this session

1. **Downloaded all 13 Wix images** (login-free, public CDN URLs) via the existing `pnpm assets:download` script.
   - Output: `public/images/imported/*.jpg` — 13 real files, ~960 KB total, 0 failures.
   - These are **untracked (`??`) in git — NOT yet committed.** `.gitignore` line 44 intentionally leaves `public/images/imported/` un-ignored (images are meant to be committed).
   - A PostToolUse hook flagged "command failed" on the download — that was a **false positive**; the script printed `13 downloaded, 0 skipped, 0 failed` and all files verified on disk.

2. **Confirmed `.env.local` is safe:** it is gitignored (matches `.env.*` and explicit `.env.local` in `.gitignore`) and NOT tracked by git. User's secrets are safe there.

3. **User added a Wix API key** to `.env.local` (around line 36). Its value was deliberately never printed/read into context.

---

## Blocked / waiting on user (resolve these FIRST next session)

1. **Exact env var name.** The user wrote _something_ on `.env.local:36` that matched a `WIX` grep, but we never confirmed the key on the left of `=`. Ask: "What is the variable NAME (not value) you put on line 36?" Wix Headless usually needs more than one value:
   - `WIX_API_KEY`
   - `WIX_SITE_ID` (commonly required alongside the key)
   - `WIX_ACCOUNT_ID` (some APIs)
   - **Note:** `.env.example` currently has NO Wix entries (only Supabase, DeepL, Resend). If we adopt Wix, add the new var names to `.env.example` as empty placeholders so the template stays accurate.

2. **How does the wine menu live in Wix?** This determines whether the API can even return it:
   - If it's a **Wix Restaurants/Menus app** → reachable via Restaurants/Menus API ✅
   - If it's a **Wix Data (CMS) collection** → reachable via Wix Data API ✅
   - If it's **free-text typed in the editor or an uploaded PDF** → API will NOT return it ❌ (user must export CSV/PDF manually)
   - User didn't know; acceptable plan is: connect, then **list available collections/menus first** (discovery script) before pulling anything.

---

## Recommended plan for next session

1. Confirm the env var name(s) from the user (or read `.env.example` after they update it).
2. Write a **discovery script** (e.g. `scripts/wix-discover.ts`, run via `tsx`) that authenticates with the Wix API key and lists what's actually available (data collections, menus). Print structure only — don't assume schema.
3. Show the user what exists; decide together what to pull (priority: **wine menu**, then anything else panel-only).
4. Write the actual fetch + map-into-`src/content/*` (or seed into Supabase) once we know the real shape.
5. Keep the **author vs. verify** separation: a fresh pass should verify any imported data before claiming done.

**Do NOT** hardcode Wix API assumptions or invent collection names. Discover first, then fetch.

---

## Key files & current state

- `ref/` — original public Wix export (source of truth for what was scraped): pages md, `ref/content/data/menu.json` (22 items, 3 categories), nav/contact/seo JSON, `ref/content/assets/image-assets.json` (22-image manifest), `ref/audit/fix-list.md`.
- `src/content/menu-data.ts` — 22 menu items already migrated.
- `src/content/pages-data.ts` — home/about/menu/reservations/experiences text.
- `src/content/media-data.ts` — 13 image assets w/ `sourceUrl` + `storagePath` (drives the download script).
- `scripts/download-assets.ts` — image downloader (done, login-free).
- `scripts/seed-supabase.ts` — DB seed (not run this session).
- `supabase/migrations/001_initial_schema.sql` — 8 tables w/ RLS.
- `MIGRATION_NOTES.md` / `TODO_PANEL_EXPORTS.md` — full context on decisions + what's missing.
- `.env.local` — has Supabase(?) + the new Wix key; gitignored. `.env.example` — template, no Wix vars yet.

## Still missing (panel-only — API may or may not cover these; see TODO_PANEL_EXPORTS.md)

- 🍷 **Wine menu** — public site showed only the "ŞARAP MENÜSÜ 18:00–23:00" heading, empty item list. ← main reason for the Wix API.
- 📍 Exact street address + Google Maps link (only "Kaş, Antalya" known).
- 🕐 Confirmed opening hours.
- ⚠️ Allergen tags (currently inferred, NOT restaurant-confirmed).

## Loose ends / decisions pending

- 13 downloaded images are **uncommitted** — decide whether to commit (suggested message: `feat: localize Wix CDN images to public/images/imported`).
- Site is on temporary domain `notyetbro.club`; revert to `cineocucina.com` when live (see `NEXT_PUBLIC_SITE_URL` in `.env.example` / `.env.local`).
- Once images are localized everywhere, remove the Wix CDN domain from `next.config.ts`.

## Environment notes

- Windows 11, PowerShell primary + Bash tool available. Package manager: **pnpm** (`pnpm@10.28.1`). Node >=20.
- Scripts run via `tsx` (devDependency). Relevant: `pnpm assets:download`, `pnpm db:seed`, `pnpm i18n:translate`.
- **Security reminder for next session:** never echo the contents of `.env.local`; reference vars by name only.
