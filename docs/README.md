# Documentation — Çi Neo Cucina

Project documentation index. Application code lives in [`src/`](../src/); the raw
Wix export (content source of truth) lives in [`ref/`](../ref/).

## Operations

| Document | What it covers |
|---|---|
| [deployment-coolify.md](deployment-coolify.md) | Deploying to Coolify via the repo `Dockerfile` — build pack, env vars, domain, post-deploy checks |

## Project reference

| Document | What it covers |
|---|---|
| [migration-notes.md](migration-notes.md) | Wix → Next.js migration: what was exported, decisions made, what is incomplete |
| [panel-exports-todo.md](panel-exports-todo.md) | Checklist of data the restaurant still owes before launch (address, hours, legal texts, wine list) |
| [qr-menu.md](qr-menu.md) | QR table menu (`/qr`) — current status and admin panel integration notes |

## Handovers

[`handovers/`](handovers/) holds dated session handover notes, kept for historical
context. They are **snapshots, not living documents** — treat the files above and the
code itself as authoritative where they disagree.

| Document | Topic |
|---|---|
| [01-rebuild-session.md](handovers/01-rebuild-session.md) | Initial Next.js + Supabase rebuild |
| [02-experience-showcase.md](handovers/02-experience-showcase.md) | Homepage "Deneyim" showcase section |
| [03-wix-api-images.md](handovers/03-wix-api-images.md) | Wix image download + Wix API access |
| [04-qr-menu-brainstorm.md](handovers/04-qr-menu-brainstorm.md) | QR menu route brainstorming |
| [05-coolify-deploy.md](handovers/05-coolify-deploy.md) | Coolify/Docker build fix and temporary domain |
