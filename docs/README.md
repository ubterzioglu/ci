# Documentation — Çi Neo Cucina

Project documentation index. Nothing in this directory is read at build or run
time — application code lives in [`src/`](../src/), and `docs/` holds only what
supports the work: guides, decision records and archived source material.

## Tree

```
docs/
  README.md              ← this index
  architecture/          code map, i18n flow, content/DB flow, SEO module
  guides/                operational guides
  seo/                   SEO/GEO plans and audits
  plans/                 multi-step implementation plans
  backlog/               data and tasks waiting on the restaurant
  archive/               historical records (handovers, Wix migration ref)
```

## Guides

| Document                                                     | What it covers                                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [guides/deployment-coolify.md](guides/deployment-coolify.md) | Deploying to Coolify via the repo `Dockerfile` — build pack, env vars, domain, post-deploy checks |
| [guides/qr-menu.md](guides/qr-menu.md)                       | QR table menu (`/qr`) — current status and admin panel integration notes                          |

## SEO

| Document                                                           | What it covers                      |
| ------------------------------------------------------------------ | ----------------------------------- |
| [seo/seo-geo-plan.md](seo/seo-geo-plan.md)                         | SEO/GEO improvement plan            |
| [seo/seo-geo-audit-2026-10-06.md](seo/seo-geo-audit-2026-10-06.md) | SEO/GEO audit findings (2026-10-06) |

## Plans

| Document                                                         | What it covers                                  |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| [plans/seo-cleanup-docs-plan.md](plans/seo-cleanup-docs-plan.md) | SEO, clean code and docs cleanup plan (current) |

## Backlog

| Document                                                       | What it covers                                                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [backlog/panel-exports-todo.md](backlog/panel-exports-todo.md) | Checklist of data the restaurant still owes before launch (address, hours, legal texts, wine list) |

## Archive

| Location                                                 | What it holds                                                                                                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [archive/ref/](archive/ref/)                             | The Wix content export the site was rebuilt from — pages, menu, SEO and image manifest. The site has since left Wix and this content now lives in `src/content/`; kept as the record of what the original said. |
| [archive/migration-notes.md](archive/migration-notes.md) | Wix → Next.js migration: what was exported, decisions made, what is incomplete                                                                                                                                  |
| [archive/handovers/](archive/handovers/)                 | Dated session handover notes — **tarihsel kayıt**; treat the code and live site as authoritative where they disagree.                                                                                           |

### Handovers

| Document                                                                                   | Topic                                         |
| ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| [archive/handovers/01-rebuild-session.md](archive/handovers/01-rebuild-session.md)         | Initial Next.js + Supabase rebuild            |
| [archive/handovers/02-experience-showcase.md](archive/handovers/02-experience-showcase.md) | Homepage "Deneyim" showcase section           |
| [archive/handovers/03-wix-api-images.md](archive/handovers/03-wix-api-images.md)           | Wix image download + Wix API access           |
| [archive/handovers/04-qr-menu-brainstorm.md](archive/handovers/04-qr-menu-brainstorm.md)   | QR menu route brainstorming                   |
| [archive/handovers/05-coolify-deploy.md](archive/handovers/05-coolify-deploy.md)           | Coolify/Docker build fix and temporary domain |
