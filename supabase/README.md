# Supabase Setup & Database Guide

This guide covers how to apply the initial database schema, seed content, and understand the security model.

## Initial Setup: Apply Migrations

The initial schema is defined in `supabase/migrations/001_initial_schema.sql`. This file must be executed once to create all tables, indexes, triggers, Row-Level Security (RLS) policies, and grants.

### Option A: Cloud Supabase (Recommended)

1. Create a new Supabase project at https://supabase.com
2. In the Supabase dashboard, go to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor and click **Execute**
6. All tables, indexes, triggers, and RLS policies are now created

### Option B: Local Supabase CLI

1. Ensure Supabase CLI is installed: https://supabase.com/docs/guides/cli/getting-started
2. In the project root, run:
   ```bash
   supabase db reset
   ```
   This applies all migrations in `supabase/migrations/` in order and re-seeds the database.

### Option C: Direct PostgreSQL Connection (Advanced)

If you have direct access to the Postgres database via `psql`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_initial_schema.sql
```

## Seeding Initial Content

Once the schema is applied, populate the database with initial content:

```bash
pnpm db:seed
```

This script is defined in `scripts/seed-supabase.ts` and:
- Inserts page content (home, menu, about, etc.)
- Inserts menu categories and items
- Inserts site settings (navigation, contact info, hours)
- Inserts redirect rules for legacy Wix URLs
- Inserts initial media asset manifest

## Regenerating TypeScript Types

When the database schema changes, regenerate TypeScript types:

```bash
pnpm db:types
```

This command generates `src/lib/supabase/database.types.ts` from the live schema, ensuring all TypeScript interfaces match the database.

## Row-Level Security (RLS) Model

All tables have RLS enabled. The security model is:

### Public READ Access

**Who**: Anonymous (`anon`) and authenticated users

**What**: Published/active content only

- **site_settings**: Rows where `is_public = true` only
- **pages**: Rows where `status = 'published'` only
- **menu_categories**: Rows where `is_active = true` only
- **menu_items**: Rows where `is_active = true` only
- **media_assets**: All rows (non-sensitive image metadata)
- **redirects**: All rows (needed by middleware for slug mapping)

### Public INSERT Access

**Who**: Anonymous and authenticated users

**What**: Form submissions only

- **reservation_requests**: New reservations (`status = 'new'`, `source = 'website'`, validated via WITH CHECK constraints)
- **contact_messages**: New contact messages (`status = 'new'`, `source = 'website'`, validated via WITH CHECK constraints)

### Server-Side Management (service_role)

**Who**: Server-side only (via `SUPABASE_SERVICE_ROLE_KEY`)

**What**: Create, read, update, delete all content

The `service_role` key bypasses all RLS policies and is used for:
- Creating and updating pages, menu items, settings
- Managing reservation requests (updating status, notes)
- Bulk operations and admin tasks

**Security**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser or public code.

## Database Schema

8 tables organized by domain:

### Configuration & Content

**site_settings** — Key/value JSON config
- `key` (unique): Setting identifier (e.g., "nav", "hours", "social")
- `value` (jsonb): JSON value for the setting
- `is_public` (bool): Whether anonymous users can read this setting
- RLS: Public reads `is_public = true` only

**pages** — CMS-style page content
- `slug` (unique): URL slug (e.g., "home", "about", "experiences")
- `title`, `excerpt`, `content_md`, `content_json`: Page content in multiple formats
- `seo_title`, `seo_description`, `og_image_url`: SEO metadata
- `status`: 'published', 'draft', or 'archived'
- `sort_order`: Display ordering
- RLS: Public reads `status = 'published'` only

### Menu

**menu_categories** — Menu category groupings
- `slug` (unique): URL-friendly category name (e.g., "topraktan", "denizden")
- `name`, `description`: Display name and description
- `is_active`: Visibility flag
- `sort_order`: Display ordering
- RLS: Public reads `is_active = true` only

**menu_items** — Menu item details
- `category_id`: Foreign key to menu_categories
- `name`, `description`, `price`, `currency`: Item details (prices in TRY)
- `image_url`: Menu item image
- `tags`: Array of tags (e.g., ["vegetarian", "vegan"], populated by application logic)
- `allergens`: Array of allergen labels (e.g., ["nuts", "dairy", "gluten"]) — **must be restaurant-verified**
- `dietary_flags`: Array of dietary info (e.g., ["vegan", "gluten-free"])
- `is_active`: Visibility flag
- `sort_order`: Display ordering
- RLS: Public reads `is_active = true` only

### Media & Assets

**media_assets** — Image manifest (Wix CDN → local storage mapping)
- `source_url`: Original Wix CDN URL
- `storage_path`: Local file path in `public/images/imported/`
- `alt`, `title`, `width`, `height`: Image metadata
- `mime_type`: Image MIME type (e.g., "image/jpeg")
- `context`: Where the image is used (e.g., "menu", "team", "hero")
- RLS: Public can read all rows (non-sensitive manifest)

### Public Forms

**reservation_requests** — Reservation form submissions
- `name`, `email`, `phone`: Guest contact info
- `party_size`, `requested_date`, `requested_time`: Reservation details
- `message`: Optional special requests
- `status`: 'new', 'confirmed', 'declined', 'cancelled' (managed by staff)
- `source`: Always 'website' for public submissions
- RLS: Public can INSERT with constraints; no SELECT/UPDATE/DELETE

**contact_messages** — Contact form submissions
- `name`, `email`, `phone`: Sender contact info
- `subject`, `message`: Message content
- `status`: 'new', 'read', 'replied', 'archived' (managed by staff)
- `source`: Always 'website' for public submissions
- RLS: Public can INSERT with constraints; no SELECT/UPDATE/DELETE

### Routing

**redirects** — Legacy Wix slug → new slug mappings
- `source_path`: Old Wix URL path (e.g., "/about-1")
- `target_path`: New URL path (e.g., "/about")
- `status_code`: HTTP redirect code (301, 302, 307, or 308)
- RLS: Public can read all rows (needed by Next.js middleware for redirect routing)

## Development Workflow

### Local Development

1. Start local Supabase:
   ```bash
   supabase start
   ```

2. Reset the database (applies all migrations and seeds):
   ```bash
   supabase db reset
   ```

3. When schema changes, regenerate types:
   ```bash
   pnpm db:types
   ```

4. Make code changes and test locally with `pnpm dev`

### Cloud Development

1. Make schema changes in Supabase SQL editor or via migration file
2. Regenerate types if schema changed:
   ```bash
   pnpm db:types
   ```
3. Update application code to match new schema
4. Test changes in staging/cloud database

## Troubleshooting

**Problem**: Type generation fails

**Solution**: Ensure `.env.local` has valid Supabase credentials and the project is reachable.

**Problem**: RLS policies block expected queries

**Solution**: Check that the role (`anon` vs `service_role`) matches the intended access level. Service-side code should use `service_role`; public-facing code should use `anon`.

**Problem**: Seed script fails

**Solution**: Ensure `SUPABASE_DB_URL` is set in `.env.local` and points to a valid Postgres database.

---

For more information, see:
- **Project README**: `README.md`
- **Migration notes**: `MIGRATION_NOTES.md`
- **Remaining tasks**: `TODO_PANEL_EXPORTS.md`
- **Supabase docs**: https://supabase.com/docs
