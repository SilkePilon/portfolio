# Elian Kent — portfolio (Next.js + Payload CMS)

A self-hostable rebuild of the free Framer template [Elian](https://www.framer.com/marketplace/templates/elian/) by Zaid Khan (published demo: https://eliankent.framer.website/). Layout, typography, responsive behaviour and animations follow the original 1:1; the case studies, blog posts and site settings are edited in a built-in **Payload CMS** admin, so the site can be updated in minutes without touching code. All copy, images and the reel video are placeholders meant to be replaced.

## Stack

Next.js 16 (App Router) · Payload 3 (admin at `/admin`, REST/GraphQL at `/api`) · SQLite (`@payloadcms/db-sqlite`) · React 19 · TypeScript · Tailwind CSS v4 · `motion` (appear/hover) · GSAP ScrollTrigger + SplitText · Lenis (smooth scroll) · three.js (liquid-mask hover on work cards) · self-hosted fonts via `@fontsource`.

## Getting started

```bash
cp .env.example .env        # set a long random PAYLOAD_SECRET
npm install
npm run seed                # imports the template's placeholder works, posts, images and site settings
npm run dev                 # http://localhost:3000  — admin at http://localhost:3000/admin
```

On the first visit to `/admin` Payload asks you to create the first admin user. The seed is idempotent (re-running it skips documents that already exist).

## Scripts

| command | what it does |
| --- | --- |
| `npm run dev` | dev server on http://localhost:3000 |
| `npm run build` / `npm start` | production build / production server |
| `npm run seed` | import the placeholder content into the CMS |
| `npm run generate:types` | regenerate `src/payload-types.ts` after changing collections |
| `npm run generate:importmap` | regenerate the admin import map (after adding custom admin components) |
| `npm run payload -- migrate:create <name>` | write a DB migration to `src/migrations/` after changing collections/globals — required for production (dev applies schema changes automatically) |
| `npm test` | Vitest (content integrity, components, adapters) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run shot -- /works works [selector] [baseUrl]` | screenshots of a route at 1440 / 1024 / 390 into `qa/` |
| `npm run compare -- http://localhost:3000` | side-by-side screenshots local vs. original for every template into `qa/` |

Screenshots use the Playwright Chromium build; install it once with `npx playwright-core install chromium` (or set `CHROME_PATH`).

## Editing the site

**In the CMS (`/admin`)**
- **Works** — the case studies: title, slug, order, date, cover + hover image, description, overview, client/industry/live URL, services, 4-image gallery. Order = position on the home page and the works page.
- **Blog posts** — title, slug, order, `featured` (the three featured posts appear on the home page), date, category, cover, rich-text body (Heading 3 for section titles; paragraphs and bullet lists render).
- **Media** — uploads (served from `/api/media/file/<name>`, stored in `media/` or `MEDIA_DIR`).
- **Messages** — contact-form submissions (inbox).
- **Site settings** — brand name + logo wordmark, meta description, share image, **home hero (background photo, the two big name lines, badge text)**, navigation links, "book a call" button, contact e-mail/phone, social links, the small profile (avatar/name/role), footer texts and the "created by" credit.

Edits are live on the next request (pages are rendered on demand). When the database is empty the site falls back to the static content in `src/content/`.

**In code (`src/content/home.ts`)** — the home-page section copy: hero, bio strip, about, metrics, services, testimonials, clients list, approach, awards, FAQ and the contact-form labels. Mixed-colour strings use the `Rich` shape: `[{ text: 'grey part', muted: true }, { br: true }, { text: 'white part' }]`. Images for those sections live in `public/images/**`; the reel video is `public/videos/showcase.mp4` (1280×720 H.264).

## Contact form

Submissions go to `/api/contact` and land in the CMS **Messages** collection. To send them elsewhere instead, set `NEXT_PUBLIC_FORM_ENDPOINT` to any URL that accepts a JSON `POST` (`{ Name, Email, Phone, Budget, Message }`).

## Deploying — Docker (recommended)

Every GitHub release publishes a ready-to-run image to `ghcr.io/silkepilon/portfolio` (`latest`, `1.2.3`, `1.2`, `1`). One container, one volume:

```bash
curl -O https://raw.githubusercontent.com/SilkePilon/portfolio/main/docker-compose.yml
printf 'PAYLOAD_SECRET=%s\nSITE_URL=https://your-domain.com\n' "$(openssl rand -hex 32)" > .env
docker compose up -d          # http://localhost:3000 — admin at /admin
```

The database and uploads live in the `/data` volume; upgrade with `docker compose pull && docker compose up -d`. Full guide (env vars, backups, seeding, releasing, building locally): **[docs/deploy.md](docs/deploy.md)**.

Running without Docker is `npm run build && npm start` with `PAYLOAD_SECRET`, `SITE_URL`, `DATABASE_URI` and `MEDIA_DIR` set (see `.env.example`).

## Project notes

- Design spec: `docs/superpowers/specs/2026-08-25-eliankent-clone-design.md` (§12 = the CMS revision)
- Implementation plan: `docs/superpowers/plans/2026-08-25-eliankent-clone.md` (Phase 5 = the CMS revision)
- Framer-only bits (Made-in-Framer badges, template promo modal, Framer analytics/forms) were intentionally left out.
