# TODO: Wix Panel Exports & Missing Data

This checklist tracks all data that must be provided by the restaurant to complete the website launch. These items were either not present in the public Wix website export or were incomplete.

## Required for Launch

### Exact Street Address
- [ ] Provide full street address in Kaş, Antalya (currently only "Kaş, Antalya" is known)
- **Why needed**: Footer contact info, Google Maps embedding, reservation page location context

### Google Maps URL
- [ ] Provide Google Maps link to the restaurant location
- **Why needed**: Contact page, reservation page, footer

### Confirmed Opening Hours
- [ ] Confirm actual restaurant opening hours (the Wix source only mentioned "18:00–23:00" next to an empty wine menu)
- [ ] Format: Day-by-day hours (e.g., "Mon–Fri 11:00–14:00, 18:00–23:00", "Closed Sundays")
- **Why needed**: Contact page, footer, reservation page availability logic

### Allergen Tag Confirmation
- [ ] Review all menu item allergen tags and confirm they are accurate
- [ ] Flag any items with missing or incorrect allergen information
- [ ] Provide allergen corrections for each flagged item
- **Why needed**: Legal compliance, guest safety, dietary accommodations
- **Context**: Allergens were inferred from ingredient lists; must be restaurant-verified

### High-Resolution Images
- [ ] Provide original high-resolution images to replace Wix CDN versions
- [ ] Include: hero images, menu photos, about/team photos, experiences
- [ ] Format: JPG/PNG, 1920px+ width recommended
- **Why needed**: Image quality, performance optimization, legal image rights

## Improves User Experience

### Wine / Drinks Menu
- [ ] Provide complete wine and drinks menu (the Wix site had "Şarap Menüsü" header but no items)
- [ ] Include: wine name, region/country, price in TRY, description (optional)
- **Why needed**: Menu completeness, guest experience, upselling

### Social Media Links
- [ ] Instagram profile URL
- [ ] Facebook profile URL
- [ ] Any other social media profiles (LinkedIn, TikTok, etc.)
- **Why needed**: Header/footer navigation, social sharing, brand presence

### Email Provider Setup (Optional but Recommended)
- [ ] If notifications desired: provide Resend API key or alternative email service credentials
- [ ] Without this: form submissions still save to database but no email notifications sent
- **Why needed**: Team notification of reservations and contact requests

## Legal & Compliance

### Legal Text: /impressum
- [ ] Provide German-language Impressum (legal information required in Germany/EU)
- [ ] Include: business name, address, VAT ID, responsible person, contact info
- **Why needed**: Legal requirement for EU-facing website, SEO

### Legal Text: /datenschutz (Privacy Policy)
- [ ] Provide German-language Datenschutz (privacy policy)
- [ ] Cover: data collection, GDPR compliance, cookies, analytics
- **Why needed**: GDPR compliance, legal requirement, user trust

### Reservation Policy
- [ ] Confirm cancellation policy (notice period, penalties, etc.)
- [ ] Confirm group size limits (currently: 1–50 people, but verify this matches restaurant policy)
- [ ] Confirm deposit/prepayment requirements (if any)
- **Why needed**: Guest expectations, dispute prevention, operations

## Analytics & Tracking (Optional)

### Google Analytics / GTM ID
- [ ] Google Analytics 4 Property ID (if desired)
- **Why needed**: Traffic analytics, conversion tracking, user behavior insights

### Meta Pixel ID
- [ ] Meta Pixel ID for Facebook/Instagram conversion tracking (if desired)
- **Why needed**: Advertising optimization, retargeting

### Google Search Console & Verification
- [ ] Google Search Console property ID (if desired)
- **Why needed**: SEO monitoring, indexing status, search queries

## Post-Launch: Domain & Hosting

### Domain Migration: cineocucina.com
- [ ] Confirm current domain registrar and access credentials
- [ ] Plan DNS cutover from Wix to new hosting (Coolify or Vercel)
- [ ] Coordinate timing to minimize downtime
- **Why needed**: Directing traffic to the new site, preserving search rankings

### Hosting Provider Selection
- [ ] Confirm: Coolify (primary) or Vercel (alternative)?
- [ ] If Coolify: provide server/instance details, SSH access, deployment credentials
- [ ] If Vercel: link GitHub repository, confirm environment variables
- **Why needed**: Infrastructure configuration, deployment setup

## Additional Redirects (If Applicable)

### Legacy Wix URL Redirects
- [ ] List any other Wix URLs beyond `/about-1` that need 301 redirects to new URLs
- [ ] Format: old URL → new URL (e.g., `/services` → `/menu`)
- **Why needed**: SEO preservation, user experience, backlink retention

## Submission Checklist

Once items above are gathered, submit to the development team with:

- [ ] Street address (plain text)
- [ ] Google Maps URL (link)
- [ ] Opening hours (text)
- [ ] Allergen corrections (CSV or annotated menu item list)
- [ ] High-resolution images (ZIP or cloud link)
- [ ] Wine menu (CSV or JSON)
- [ ] Social media URLs (plain text)
- [ ] Resend API key (if email notifications desired)
- [ ] German legal text: Impressum (plain text or .md)
- [ ] German legal text: Datenschutz (plain text or .md)
- [ ] Reservation policy (plain text)
- [ ] Analytics IDs (plain text)
- [ ] Domain/hosting confirmation (plain text)

---

**Timeline**: Please provide all "Required for Launch" items at least 1 week before intended launch date. "Improves UX" and optional items can follow in a post-launch update.

**Questions?** Contact the development team or refer to `MIGRATION_NOTES.md` for context on migration decisions.
