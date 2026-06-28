# Çi Neo Cucina

Modern restaurant website for Çi Neo Cucina, a Mediterranean and Anatolian chef-led restaurant in Kaş, Antalya, Turkey. Built with Next.js 16, React 19, and Supabase.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Row-Level Security)
- **Forms**: Server Actions + Zod validation
- **Package Manager**: pnpm 10.28.1
- **Deployment**: Coolify (primary) or Vercel-compatible
- **Internationalization**: Turkish (default); English and German via DeepL API

## Features

- Full-featured restaurant website with menu, reservations, and contact forms
- Server-side rendering with Next.js 16 App Router for SEO optimization
- Real-time database with Supabase PostgreSQL backend
- Type-safe forms using Server Actions and Zod validation
- Responsive design with Tailwind CSS v4
- Row-level security for public content visibility
- Multi-language support (TR, EN, DE) via DeepL integration
- Asset import pipeline for legacy Wix image migration
- 301 redirects from legacy Wix slugs

## Prerequisites

- **Node.js**: 20.0.0 or higher
- **pnpm**: 10.28.1 or higher (install with `npm install -g pnpm`)
- **Supabase CLI** (optional, required for local development): https://supabase.com/docs/guides/cli/getting-started

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd cineocucina
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example file and fill in your actual values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project credentials and other settings (see Environment Variables table below).

### 4. Set up Supabase

Choose one of the following options:

#### Option A: Cloud Supabase (Recommended)

1. Create a new project at https://supabase.com
2. Go to the SQL Editor in the Supabase dashboard
3. Create a new query and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the SQL to create all tables, indexes, triggers, RLS policies, and grants
5. Copy your project URL and API keys to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your project URL (e.g., `https://<project-ref>.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/publishable key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server only, never expose in browser)
   - `SUPABASE_DB_URL`: Direct Postgres connection string (format: `postgresql://postgres:<password>@<host>:<port>/<database>`)
6. Seed the database with initial content:
   ```bash
   pnpm db:seed
   ```

#### Option B: Local Supabase CLI

1. Install Supabase CLI: https://supabase.com/docs/guides/cli/getting-started
2. Start local Supabase stack:
   ```bash
   supabase start
   ```
3. Reset the database (applies migrations and runs seed):
   ```bash
   supabase db reset
   ```
4. Generate types for local database:
   ```bash
   pnpm db:types
   ```
5. The CLI outputs connection details; use them to populate `.env.local`

### 5. Start development server

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash); used for Open Graph and sitemap | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g., `https://<project-ref>.supabase.co`) | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key for browser access | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server-side operations (never expose in browser) | Yes |
| `SUPABASE_SECRET_KEY` | Alternative server-side secret key (optional) | No |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token (used by seed and type generation scripts) | No |
| `SUPABASE_DB_URL` | Direct Postgres connection string (used by seed script) | No |
| `DEEPL_API_KEY` | DeepL API key for generating EN/DE translations from Turkish source | No |
| `RESEND_API_KEY` | Resend email provider API key for form notifications (if empty, forms only store submissions) | No |
| `RESERVATION_NOTIFICATION_EMAIL` | Email address to receive reservation form submissions | No |
| `CONTACT_NOTIFICATION_EMAIL` | Email address to receive contact form submissions | No |

## Available Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Start Next.js development server on port 3000 |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint on source files |
| `pnpm typecheck` | Run TypeScript type checker |
| `pnpm format` | Format all code with Prettier |
| `pnpm format:check` | Check code formatting without changes |
| `pnpm db:types` | Generate TypeScript types from Supabase schema |
| `pnpm db:seed` | Seed the database with initial content from `scripts/seed-supabase.ts` |
| `pnpm db:reset` | (Local Supabase only) Reset database and re-apply migrations |
| `pnpm assets:download` | Download legacy Wix images and store locally in `public/images/imported/` |
| `pnpm i18n:translate` | Generate EN/DE translations from Turkish source via DeepL |

## Project Structure

```
src/
├── app/                          # Next.js 16 App Router pages and layouts
│   ├── (main)/                   # Main site routes
│   ├── api/                      # API routes and Server Actions
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components (reservations, contact)
│   └── layout/                   # Header, footer, navigation
├── lib/
│   ├── supabase/                 # Supabase client and queries
│   ├── site-config.ts            # Brand facts, navigation, contact info
│   └── utils.ts                  # Shared utilities
├── content/                      # Markdown and JSON content
│   ├── pages/                    # Page markdown files
│   └── data/                     # SEO, menu, and other JSON data
└── styles/                       # Global CSS and Tailwind config

scripts/
├── seed-supabase.ts              # Populate database with initial content
├── download-assets.ts            # Download legacy Wix images
└── translate-content.ts          # Generate translations via DeepL

supabase/
├── migrations/
│   └── 001_initial_schema.sql    # Initial database schema with RLS policies
└── README.md                     # Database setup and seeding guide

public/
└── images/
    └── imported/                 # Localized Wix images (populated by pnpm assets:download)
```

## Deployment

### Coolify (Primary)

Coolify supports automatic Next.js deployments without custom Dockerfile or Nixpacks configuration:

1. Connect your Git repository to Coolify
2. Configure deployment:
   - **Build command**: `pnpm build`
   - **Start command**: `pnpm start`
   - **Node version**: 20 or higher
   - **Port**: 3000
3. Set all environment variables from `.env.example` in Coolify's environment configuration UI
4. Deploy

### Vercel (Alternative)

Vercel natively supports Next.js and handles build/start commands automatically:

1. Import your repository at https://vercel.com
2. Set all environment variables from `.env.example` in Vercel's project settings
3. Deploy (Vercel automatically detects Next.js and uses correct build configuration)

## Internationalization

The website is **Turkish-first**. English and German translations are generated from Turkish source content using the DeepL API.

To generate translations:

```bash
pnpm i18n:translate
```

This requires `DEEPL_API_KEY` to be set in `.env.local`.

## Content Migration from Wix

This project was migrated from a Wix website. Exported content, decisions made during migration, and remaining tasks are documented in `MIGRATION_NOTES.md`.

## Support

For questions or issues, contact the development team or file an issue in the repository.
