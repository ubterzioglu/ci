# Deploying Çi Neo Cucina to Coolify

This app is ready to deploy on [Coolify](https://coolify.io) via its **GitHub
Git integration** — Coolify builds the included `Dockerfile` (Next.js
standalone output) on every push to `main`.

Repository: `https://github.com/ubterzioglu/ci` · Branch: `main`

Temporary domain currently in use: **https://notyetbro.club**
Final domain (switch when DNS is ready): **https://www.cineocucina.com**

---

## 1. Create the application in Coolify

1. In the Coolify dashboard: **+ New** → **Resource** → **Application**.
2. Source: connect the **GitHub** account/app and pick the repo
   `ubterzioglu/ci`, branch `main`.
3. Build Pack: **Dockerfile** (Coolify auto-detects the `Dockerfile` in the
   repo root — no extra build/start commands needed).
4. Port: **3000** (the Dockerfile exposes 3000 and runs `node server.js`).
5. Leave health check on the default `/` path (returns 200).

> The Dockerfile is multi-stage and uses `pnpm install --frozen-lockfile`, so
> the committed `pnpm-lock.yaml` must match `package.json` (it does — verified
> with `pnpm install --frozen-lockfile`).

## 2. Set the domain

- Set the application **FQDN** to `https://notyetbro.club` for now.
- Point the domain's DNS A record to the server IP, then let Coolify issue the
  Let's Encrypt certificate.
- When `cineocucina.com` is live, change the FQDN to
  `https://www.cineocucina.com` and update `NEXT_PUBLIC_SITE_URL` (below).

## 3. Environment variables

Add these in Coolify → the app → **Environment Variables**. Values come from
your local `.env.local` (do NOT commit them). `NEXT_PUBLIC_*` vars are needed
at **build time** too — mark them as "Build Variable" in Coolify so they are
inlined into the client bundle.

| Variable | Build? | Value (source) |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://notyetbro.club` (→ `https://www.cineocucina.com` later) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://wwzdqqtyeuphzdyneydr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | anon key from `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | — | service_role key from `.env.local` (server only) |
| `RESERVATION_NOTIFICATION_EMAIL` | — | `cineo.cucina@gmail.com` |
| `CONTACT_NOTIFICATION_EMAIL` | — | `cineo.cucina@gmail.com` |
| `RESEND_API_KEY` | — | _(optional — leave empty until email is set up)_ |
| `DEEPL_API_KEY` | — | _(optional — only needed for `pnpm i18n:translate`, not at runtime)_ |

> Do **not** set `SUPABASE_DB_URL`, `SUPABASE_SECRET_KEY`, or
> `SUPABASE_ACCESS_TOKEN` on the running app — those are for local
> CLI/migration/seed work only.

## 4. Database (one-time, already done for this project)

The schema is already applied and seeded on the Supabase project. For a fresh
environment:

```bash
# Apply schema
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_initial_schema.sql
# Seed content
pnpm db:seed
```

See [`supabase/README.md`](./supabase/README.md) for details.

## 5. Deploy

Click **Deploy**. Coolify will build the Docker image and start the container.
Subsequent pushes to `main` trigger automatic redeploys (enable
"Auto Deploy" / the GitHub webhook).

## 6. Post-deploy smoke check

```bash
curl -I https://notyetbro.club/            # 200
curl -I https://notyetbro.club/menu        # 200 (renders Supabase menu)
curl -I https://notyetbro.club/about-1     # 308 → /about
curl -s https://notyetbro.club/robots.txt  # robots
curl -s https://notyetbro.club/sitemap.xml # sitemap
```

Then submit the reservation and contact forms once and confirm the rows appear
in the Supabase `reservation_requests` / `contact_messages` tables.

---

### Switching to the final domain later

1. Change the Coolify app FQDN to `https://www.cineocucina.com`.
2. Update `NEXT_PUBLIC_SITE_URL=https://www.cineocucina.com` (build variable) and redeploy.
3. Update `src/lib/site-config.ts` fallback URL back to the cineocucina.com domain (optional, since the env var wins).
