# Handover — HD4: QR Mobile-Only Menu Route

**Date:** 2026-06-28
**Status:** Brainstorming phase — design NOT finalized. No code written yet.
**Next step:** Resume the brainstorming dialogue (1 question already asked, awaiting answer), then write spec → plan → implement.

---

## 1. The Request (verbatim intent)

> "route /menü açacaksın burada mobile only bir içerik olacak. qr kodla buraya gidecek müşteri."

Build a **new route** that serves a **mobile-only** digital menu. Customers reach it by **scanning a QR code** (placed on tables in the restaurant). This is a distinct use case from the existing marketing `/menu` page — it's the in-hand, at-the-table digital menu for a seated guest.

---

## 2. Where We Are In The Process

Following the `superpowers:brainstorming` skill (HARD GATE: no code until a design is presented AND user-approved). Process flow:

1. ✅ Explored project context (done — see Section 3)
2. ⬜ Offer visual companion just-in-time (not yet needed)
3. 🔄 **Ask clarifying questions one at a time** ← WE ARE HERE. Question 1 asked, not yet answered.
4. ⬜ Propose 2-3 approaches with trade-offs
5. ⬜ Present design sections, get approval each
6. ⬜ Write spec to `docs/superpowers/specs/YYYY-MM-DD-qr-menu-design.md` + commit
7. ⬜ Spec self-review
8. ⬜ User reviews spec
9. ⬜ Invoke `writing-plans` skill → implement

### Question 1 (asked, AWAITING USER ANSWER):

Route & relationship to existing `/menu`:

- **A. `/qr` (or `/m`)** — brand-new standalone route, no site Header/Footer, purpose-built in-restaurant menu. Existing `/menu` untouched. **(RECOMMENDED — cleanly separates the two use cases.)**
- **B. `/menu/qr`** — nested under menu section, own standalone layout.
- **C. Replace/augment `/menu`** to be responsive, point QR at it — no new route.

Plus: what exact path string (`/qr`, `/m`, `/menu/qr`)?

### Questions still to ask (planned, after Q1):

- **Site chrome:** Should the QR page skip the global Header/Footer? (Root `layout.tsx` currently forces them on every route — see Section 3. A route group like `app/(qr)/` with its own `layout.tsx`, or `app/(bare)/`, is the clean way to opt out.)
- **Language:** Menu content is Turkish only today, but `Locale = 'tr' | 'en' | 'de'` exists in types. Does the QR menu need a language switcher (tourists in Kaş), or TR-only for v1?
- **Content source:** Reuse `getMenu()` (Supabase → local fallback)? Same 3 categories + wine notice?
- **Features:** Category jump/sticky nav? Dish photos (all `imageUrl` are currently `null`)? Allergen/dietary filtering? Search? Or keep it a clean read-only list for v1 (YAGNI)?
- **"Mobile only":** Does "mobile only" mean (a) just mobile-first responsive that also happens to render on desktop, or (b) actively block/redirect/show-a-notice on desktop viewports? Recommend (a) — a QR menu naturally only gets mobile traffic; hard-blocking desktop is hostile and harder to test/QA.
- **Branding/look:** Match the editorial marble/charcoal/olive/wine aesthetic of the main site, or a more compact "scan-and-scroll" layout optimized for one-handed phone use?

---

## 3. Project Context (already explored — don't re-explore)

**Stack:** Next.js 16.2.9 (App Router, React 19.2, `output: 'standalone'`), Supabase (`@supabase/ssr`), Tailwind v4, Zod 4. Package manager **pnpm 10.28.1**. Server components by default. `lang="tr"`.

**Key files:**

- `src/app/menu/page.tsx` — EXISTING marketing menu page (server component). Uses `PageHeader`, `MenuCategory`, `JsonLd`, `getMenu()`, `MENU_SERVICE_NOTE`, `WINE_MENU_NOTICE`. Full site chrome via root layout.
- `src/app/layout.tsx` — Root layout. **Forces `<Header/>` + `<main>` + `<Footer/>` on EVERY route.** Loads Cormorant Garamond + Inter fonts. `themeColor #23211c`. To make a chrome-free QR page, use a route group with its own layout.
- `src/lib/db/menu.ts` — `getMenu(): Promise<MenuCategory[]>`. Tries Supabase, falls back to `src/content/menu-data.ts`. **Reuse this for the QR page.**
- `src/content/menu-data.ts` — Local menu fallback + `MENU_SERVICE_NOTE` + `WINE_MENU_NOTICE`. 3 categories: **Topraktan** (soil/6 items), **Denizden** (sea/8 items), **Otlaktan** (pasture/7 items). Prices in TRY. All `imageUrl: null`. Wine list = "ask the team" notice (not exported from source — see `TODO_PANEL_EXPORTS.md`).
- `src/components/menu/MenuCategory.tsx` — Renders a category header + items list. Reusable.
- `src/components/menu/MenuItemCard.tsx` — Single item: name + leader dots + price, description, tags as `Badge`, allergens inline. Reusable.
- `src/lib/types.ts` — `MenuItem`, `MenuCategory`, `Locale = 'tr'|'en'|'de'`, `LOCALES`, `DEFAULT_LOCALE='tr'`.
- `src/lib/utils.ts` — `cn()` (clsx-lite), `formatPrice(price, currency)` → tr-TR Intl currency (e.g. ₺580).
- `src/lib/i18n/config.ts`, `src/lib/i18n/dictionaries.ts` — i18n scaffolding exists (check before building a language switcher).

**Design tokens (Tailwind classes seen in use):** `bg-marble`, `text-charcoal`, `bg-cream-deep`, `border-stone`/`border-stone-soft`, `text-muted`, `text-olive-deep`, `text-wine`/`bg-wine`, `font-display` (Cormorant). `container-editorial` utility. Aesthetic = editorial, warm, restaurant fine-dining.

**Reusability note:** `MenuCategory` + `MenuItemCard` + `getMenu()` can likely be reused as-is. The QR page is mostly: a new route + a bare/minimal layout (no Header/Footer) + a mobile-optimized wrapper around the existing menu components.

---

## 4. Repo / Git State

- Branch: `main` (this is also the main/PR base branch).
- Working tree: **clean** at handover.
- Recent commits:
  - `ed9aa2d .` ← committed the imported `public/images/imported/*.jpg` (were untracked at session start)
  - `3d1b92a docs: add Coolify deployment guide`
  - `568db88 chore: point site URL to temporary domain notyetbro.club`
- ⚠️ Commit `ed9aa2d` has a bad message ("."). Consider amending to something descriptive (e.g. `chore: add imported menu/gallery images`) if not yet pushed.
- **Memory note:** Site is temporarily on `notyetbro.club`; revert to `cineocucina.com` when live (see `~/.claude/.../memory/`). QR codes should encode the final/stable URL — confirm which domain the printed QR will point to before generating any QR asset.

---

## 5. Conventions To Honor (from user's global CLAUDE.md / rules)

- TypeScript: explicit types on exported/public APIs, no `any`, Zod for boundary validation, immutability (spread, no mutation), no `console.log`.
- Files: many small focused files (200–400 lines typical, 800 max), organize by feature.
- Commit format: conventional commits (`feat:`, `fix:`, etc.). Attribution disabled globally. Optional decision trailers (`Constraint:`, `Rejected:`, `Confidence:`...) for non-trivial commits.
- Workflow: research/reuse before new code; plan → (TDD where it fits) → code review → commit. Keep authoring and review in separate passes.
- Delegate multi-file work; verify before claiming done.

---

## 6. How To Resume (for the next session)

1. Re-invoke the `superpowers:brainstorming` skill (we're mid-flow on it).
2. Re-present **Question 1** (Section 2) to the user if not already answered, OR continue from their answer.
3. Work through remaining clarifying questions (Section 2) one at a time.
4. Propose 2-3 approaches, present design, get approval, write spec, then `writing-plans` → implement.
5. Do NOT skip the design-approval gate. Do NOT write code before the user approves a design.

**Likely shape of the eventual solution** (NOT yet approved — just orientation): a new App Router route (e.g. `app/(qr)/qr/page.tsx`) inside a route group with its own minimal `layout.tsx` (no global Header/Footer), reusing `getMenu()` + `MenuCategory` + `MenuItemCard`, mobile-first styling, TR-first, read-only list for v1, possibly sticky category jump-nav. Confirm all of this with the user via the questions above before building.
