# Elian Kent — portfolio

A self-hostable React + Vite rebuild of the free Framer template [Elian](https://www.framer.com/marketplace/templates/elian/) by Zaid Khan (published demo: https://eliankent.framer.website/). Layout, typography, responsive behaviour and animations follow the original 1:1; all copy, images and the reel video are placeholders meant to be replaced.

## Stack

Vite 8 · React 19 · TypeScript · Tailwind CSS v4 · react-router-dom 7 · `motion` (appear/hover) · GSAP ScrollTrigger + SplitText (scroll-scrubbed text reveal, video reel) · Lenis (smooth scroll) · three.js (liquid-mask hover on work cards) · self-hosted fonts via `@fontsource` (Host Grotesk, IBM Plex Mono, Inter).

## Scripts

| command | what it does |
| --- | --- |
| `npm run dev` | dev server on http://localhost:5173 |
| `npm run build` | type-check + production build into `dist/` |
| `npm run preview` | serve `dist/` on http://localhost:4173 |
| `npm test` | Vitest (content integrity, components, routes) |
| `npm run shot -- /works works [selector]` | screenshots of a local route at 1440 / 1024 / 390 into `qa/` (dev server must run) |
| `npm run compare` | full-page side-by-side screenshots local vs. original for every template into `qa/` (run `npm run preview` first) |

Screenshots use the Playwright Chromium build; install it once with `npx playwright-core install chromium` (or set `CHROME_PATH`).

## Editing content

Everything textual lives in `src/content/`:

- `site.ts` — brand name/wordmark, navigation, socials, contact e-mail/phone, footer copy, "book a call" link.
- `home.ts` — every home section (hero, bio strip, about, metrics, services, testimonials, clients, approach, awards, FAQ, contact form labels) plus the copy of the works/blogs/404 pages (`pages`).
- `works.ts` — the case studies (order = order on the home page and works page). Each has a cover, a hover image (the liquid-mask reveal), meta rows and a 4-image gallery.
- `blogs.ts` — the posts; `body` is an ordered list of `heading` / `paragraph` / `list` blocks. `homeBlogs` picks the three shown on the home page.

Mixed-colour strings use the `Rich` shape: `[{ text: 'grey part', muted: true }, { br: true }, { text: 'white part' }]`.

Images live in `public/images/**` (referenced by path from the content files, with their pixel size for layout stability); the reel video is `public/videos/showcase.mp4` (1280×720 H.264; swap for your own — the section scales it to the viewport). Favicons and the Open Graph image are `public/images/favicon-*.png` and `public/images/og.png` (referenced from `index.html`).

## Contact form

The form is wired but has no backend. Set `VITE_FORM_ENDPOINT` (see `.env.example`) to any URL that accepts a JSON `POST` (`{ Name, Email, Phone, Budget, Message }`) — e.g. a Formspree/Web3Forms endpoint or your own function. Without it the form simulates a successful send after 800 ms.

## Deploying

`npm run build` produces a static site in `dist/`. Because routing is client-side, the host must serve `index.html` for unknown paths: `public/_redirects` (Netlify) and `vercel.json` (Vercel) are included; for nginx use `try_files $uri /index.html;`.

## Project notes

- Design spec: `docs/superpowers/specs/2026-08-25-eliankent-clone-design.md`
- Implementation plan: `docs/superpowers/plans/2026-08-25-eliankent-clone.md`
- Framer-only bits (Made-in-Framer badges, template promo modal, Framer analytics/forms) were intentionally left out.
