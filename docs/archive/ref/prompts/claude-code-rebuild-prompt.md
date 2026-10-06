You are rebuilding a restaurant website exported from Wix.

Use the content in this folder as the source of truth:

- `content/pages/*.md`
- `content/data/menu.json`
- `content/data/contact.json`
- `content/data/navigation.json`
- `content/data/seo.json`
- `content/assets/image-assets.json`

Build a modern, production-ready website for “Çi Neo Cucina”.

Recommended stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Static content files from JSON/Markdown
- Responsive design
- SEO metadata per page

Pages:
- `/` home
- `/menu`
- `/about`
- `/reservations`
- `/experiences`
- `/contact`

Design direction:
Premium Mediterranean restaurant; calm, natural, timeless; white/cream base, olive green, stone tones, wine accent; large editorial images; serif headings; mobile-first.

Functional requirements:
1. Header with navigation from `navigation.json`.
2. Persistent mobile reservation CTA.
3. Footer with phone, email, hashtag, and copyright. Do not use Wix/Michael Bolano footer text.
4. Home page with hero, chef story, menu teaser cards, Chef's Table CTA, gallery, contact CTA.
5. Menu page generated from `menu.json`, grouped by category, with prices and dietary tags.
6. Reservations page with simple form fields: name, phone/email, party size, date, time, note. Since no backend is provided, create mailto/WhatsApp fallback or leave TODO.
7. About page with brand story, vision, team section.
8. Experiences page should show current empty state and optional coming soon section.
9. Contact page with phone/email and placeholder for address/map.
10. Use image URLs from `image-assets.json` initially. Add TODO to replace with locally optimized images after running `scripts/download-assets.sh`.

Quality requirements:
Clean component structure, no hard-coded menu items outside data files, accessible buttons/form labels, metadata from `seo.json`, setup README, do not invent missing address/opening hours/wine list items.
