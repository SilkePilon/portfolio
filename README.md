# Elian Kent — portfolio (Next.js + Payload CMS)

A self-hostable rebuild of the free Framer template [Elian](https://www.framer.com/marketplace/templates/elian/) by Zaid Khan (published demo: https://eliankent.framer.website/). Layout, typography, responsive behaviour and animations follow the original 1:1; the case studies, blog posts and site settings are edited in a built-in **Payload CMS** admin, so the site can be updated in minutes without touching code. All copy and images are placeholders meant to be replaced.

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
| `npm run seed` | import the template's placeholder copy and images into the CMS (idempotent) |
| `npm run generate:types` | regenerate `src/payload-types.ts` after changing collections |
| `npm run generate:importmap` | regenerate the admin import map (after adding custom admin components) |
| `npm run payload -- migrate:create <name>` | write a DB migration to `src/migrations/` after changing collections/globals — required for production (dev applies schema changes automatically) |
| `npm test` | Vitest (content integrity, components, adapters) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run shot -- /works works [selector] [baseUrl]` | screenshots of a route at 1440 / 1024 / 390 into `qa/` |
| `npm run compare -- http://localhost:3000` | side-by-side screenshots local vs. original for every template into `qa/` |

Screenshots use the Playwright Chromium build; install it once with `npx playwright-core install chromium` (or set `CHROME_PATH`).

## Editing the site

Every piece of copy on the site — every page, section heading, list of cards, and the site-wide settings — is edited in the built-in admin at **`/admin`**. There is no code editing needed for day-to-day content changes. The sidebar is grouped:

| group | contains |
| --- | --- |
| **Pages** | Home page (every section of `/`, tab per section) · Other pages (404, works/blogs page intros, work/blog label copy) · Site settings (brand, hero, nav, footer, contact) |
| **Content** | Works (case studies) · Blog posts · Media (uploads) |
| **Home lists** | Services · Testimonials · Clients · Awards · FAQ — the repeating cards shown on the home page |
| **Inbox** | Messages (contact-form submissions) |
| **Admin** | Users |

**Live preview** — every document (globals, works, posts, home lists) opens with a live preview pane on the right. It re-renders the page as you type, no save needed. Use the **Mobile (390)** / **Tablet (810)** / **Desktop (1440)** buttons above the pane to check a section at each breakpoint. **Other pages** previews `/works` on every tab, so the 404 tab has no preview of its own — open `/some-missing-url` in another tab to check that copy.

**Mixed-colour headings** — most headings and paragraphs are grey by default; wrap a part in `**double asterisks**` to render it white, e.g. `Design **that speaks for you**`. A newline in the field becomes a line break (`<br>`).

The section tags (`Clients(08)`, `Services(04)`, `FAQ’S(08)` …) are plain text, counts included — when you add or remove rows in a list, update the number in the tag yourself.

**Showcase** — the section between Metrics and Works is not an image or a video: it is a small interactive demo app (a trading terminal) that stays usable while it explodes into its five labelled layers as you scroll. Only its name is editable, under **Home page → Showcase → App name**; the layers, their labels and the app itself live in `src/components/home/Showcase.tsx` and `src/components/home/showcase/`.

**Drag to reorder** — Blog posts and every Home list (Services, Testimonials, Clients, Awards, FAQ) support drag-to-reorder in their list view; the order there is the order shown on the site. Works can be dragged too, but that only reorders the **`/works`** page: the home page uses the template's fixed five-card layout and picks its cards by slug (`sienna`, `glidex`, `veon`, `zayla`, `destello`). On Blog posts, toggle **`featured`** on up to three posts to choose which ones appear on the home page (falls back to the three most recent if fewer than three are featured).

Edits are live on the next request (pages are rendered on demand). When a document or global has never been saved, the site falls back to the placeholder content in `src/content/` — those files are fallbacks and the source `npm run seed` imports into the CMS; they are not read once a document exists in the admin.

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
