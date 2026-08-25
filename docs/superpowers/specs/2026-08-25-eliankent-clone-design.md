# Elian Kent template → React + Vite port — design spec

Date: 2026-08-25
Source: https://eliankent.framer.website/ (free Framer template "Elian" by Zaid Khan)
Target: self-hostable static site, `/home/silke/Documents/GitHub/portfolio`

## 1. Goal and constraints

Rebuild the published Framer site 1:1 (layout, typography, assets, responsive behaviour, animations) as a React + Vite app so it can be hosted anywhere. All copy, images and videos are placeholders the owner will swap before publishing, so content must live in one obvious place and be trivially editable.

Acceptance bar: side-by-side full-page screenshots of local vs. original at 1440 / 1024 / 390 px look the same to the eye for every template; every animation listed in §6 exists and matches timing/easing within reason; `npm run build` passes with zero TypeScript errors.

Out of scope (Framer-only or promotional): "Made in Framer" / "Use for free" badges, the "New Release" template promo modal ("Buy Template" component), Framer analytics script, Framer forms backend, Framer search index, the `framer.com/edit` link.

## 2. Source inventory

Pages (17): `/`, `/works`, `/works/{destello,zayla,veon,glidex,sienna}`, `/blogs`, `/blogs/{8 slugs}`, 404.
Templates (6): Home, Works list, Work detail, Blogs list, Blog detail, Not found.

Home sections in order: Preloader overlay → Navbar → Hero → Bio strip → About → Metrics → Showcase reel → Works → Services (light) → Testimonials → Clients → Approach (light) → Awards → Blogs → FAQ → Contact → Footer.

Assets: 48 images (mostly 1600×1200 PNG, some WebP/JPG), 1 video used (`new short.mp4`, 24 MB, showcase reel). Fonts: Host Grotesk (400/600/700/800 + italics), IBM Plex Mono (400/500/600/700 + italics), Inter (rich-text fallback only).

Colour tokens (from Framer CSS): black `#0e0e0e`, white `#fff`, light-bg `#e0e0e0`, gray-900 `#1a1a1a`, gray-800 `#212121`, gray-400 `#ababab`, gray-500 `#999999`, gray-300 `#c4c4c4`, gray-100 `#ededed`, border-dark `rgba(255,255,255,.15)`, border-light `rgba(0,0,0,.15)`, white-60 `rgba(255,255,255,.6)`, black-20 `rgba(0,0,0,.2)`, black-40 `rgba(14,14,14,.4)`, link `#0099ff`.

Breakpoints (Framer): phone `< 810`, tablet `810–1199`, desktop `≥ 1200`. Content max width 1600 px with 20 px page gutters (`min(100vw - 40px, 1600px)`), divided into 4 equal columns.

## 3. Architecture

Stack: Vite 8, React 19, TypeScript 6, Tailwind CSS v4 (`@tailwindcss/vite`), react-router-dom 7 (`BrowserRouter`), `motion` 13 (appear + hover + accordion animations), GSAP 3.15 with ScrollTrigger + SplitText (scroll-scrubbed text reveal, scroll-driven reel), Lenis 1.3 (smooth scroll), three.js 0.185 (liquid-mask hover on work cards), `@fontsource-variable/host-grotesk`, `@fontsource/ibm-plex-mono`, `@fontsource-variable/inter`.

No server. Contact form posts to `import.meta.env.VITE_FORM_ENDPOINT` when set, otherwise simulates success.

```
src/
  main.tsx                 BrowserRouter + <App/>
  App.tsx                  routes, <Layout/> (SmoothScroll, Navbar, Footer, ScrollToTop, Preloader on first load)
  index.css                @import "tailwindcss"; @theme tokens; font imports; base styles; global helpers
  content/
    site.ts                brand name, nav links, socials, contact details, footer copy, calendly url
    home.ts                hero, bio strip, about, metrics, services, testimonials, clients, approach, awards, faq, contact copy
    works.ts               Work[]  (slug, title, services, cover, hoverCover, date, client, industry, liveUrl, overview, gallery)
    blogs.ts               Blog[]  (slug, title, category, date, cover, intro, sections[])
    types.ts               shared content types
  components/
    layout/  Navbar, MobileMenu, Footer, Preloader, SmoothScroll, ScrollToTop, Seo
    ui/      Section, Grid (column rules), Corners (plus markers), SectionTag, ArrowButton, Chip, Dots,
             Counter, TextReveal, Appear (motion presets), LiquidImage (three), RichText, Video
    home/    Hero, BioStrip, About, Metrics, ShowcaseReel, WorksGrid, Services, Testimonials,
             Clients, Approach, Awards, BlogsPreview, Faq, Contact
    works/   WorkCard, NextWork
    blogs/   BlogCard, NextBlogs
  pages/     Home, Works, WorkDetail, Blogs, BlogDetail, NotFound
  hooks/     useBreakpoint, useReducedMotion, useInView helpers
  lib/       gsap.ts (plugin registration), lenis.ts, cn.ts
public/
  images/    semantic file names (hero.png, about-1.png, works/sienna-cover.png, …)
  videos/    showcase.mp4
  favicon.png, og.png
scripts/
  compare.mjs              playwright-core: screenshots local vs original per template/breakpoint into qa/
docs/superpowers/specs, docs/superpowers/plans
```

Each component owns one section or one reusable primitive; data comes in via props from the page, never imported deep inside (so swapping content never touches components).

## 4. Design system (Tailwind v4 `@theme`)

- `--color-*` for every token in §2; `--font-display: "Host Grotesk Variable"`, `--font-mono: "IBM Plex Mono"`, `--font-sans: "Inter Variable"`.
- `--breakpoint-tablet: 810px; --breakpoint-desktop: 1200px;` — mobile-first utilities, `tablet:` and `desktop:` variants. The default Tailwind breakpoints stay but are unused.
- Type scale copied from Framer style presets (exact px per breakpoint recorded in `index.css` as utility classes `text-h1 … text-h6, text-body, text-label`), e.g. giant hero/footer name ≈ 20vw uppercase 800, section H2 uppercase Host Grotesk, labels IBM Plex Mono 13–14 px uppercase with tracking.
- Grid primitives: `<Section theme="dark|light">` sets bg + text + border colour via CSS variables; `<Grid cols={4}>` draws the 1 px vertical rules; `<Corners variant="4|2-bottom|2-top">` renders the `+` markers (two 1 px lines, 11 px) absolutely positioned on the corners of a bordered box.
- Border colour is `currentColor`-independent: `--rule: var(--color-border-dark)` on dark sections, light variant on light sections.

## 5. Pages and components

Navbar (fixed, 60 px, full-width, bottom rule): logo (SVG mark + "ELIAN KENT" two-line wordmark), centre links HOME / ABOUT / WORKS / BLOGS / CONTACT (mono 13 px uppercase), right "BOOK A CALL →" cell with left rule. Below desktop: hamburger toggles `<MobileMenu>` (full-screen dark overlay, staggered link list, close button, body scroll lock). Hash links `/#about`, `/#contact` scroll to section ids (works from other routes).

Footer: 4 columns — brand + tagline + "BOOK A CALL →"; sitemap list with arrows; "FOLLOW ON" socials; tagline + "CREATED BY [avatar] ZAID KHAN"; then a full-width giant "ELIAN KENT" wordmark row (uppercase, ~19 vw, clipped to the row).

Home
- Hero: full-bleed red photo (`hero.png`) within the 4-column grid, giant "ELIAN" (top-left, white) and "KENT" (bottom-right) wordmarks overlapping the image, right-aligned mono intro paragraph, bottom-left "CERTIFIED PRO EXPERT" badge cell with 2 bottom corners.
- Bio strip: 4 cells — LOCATION / FIELD / APPROACH / CLIENTS with values.
- About: tag "● ABOUT", two-paragraph uppercase Host Grotesk text (scroll text reveal), right column photo `about-1.png` in a 4-corner box + mono caption; second row photo `about-2.png` left and "● DRIVEN RESULT" heading right.
- Metrics: 4 cells, each with `<Dots>` indicator, `<Counter>` (62+, 3+, 98%, 5+), mono label + text.
- Showcase reel: 200 vh section, sticky 100 vh viewport; video scales 0.2 → 1 (inner 1.8 → 1, `brightness(.6)`), "SHOW" / "CASE" giant words slide in from −1200 / +1200 px; all scroll-driven with spring smoothing.
- Works: heading row (tag "● SELECTED WORKS(05)", H2 "A collection of refined digital experiences" with grey first words, right mono text), then 5 `<WorkCard>` placed on the 4-column grid exactly like the original (Sienna spans cols 2–3, Glidex col 1, Veon cols 3–4, Zayla cols 1–2, Destello cols 2–3), then a closing row with Host Grotesk sentence + "EXPLORE ALL WORKS →" cell.
- Services (light): heading row, two feature images (`services-1.png`, `services-2.png`) in 4-corner boxes, 4 rows `01/ … 04/` each with title, mono text, tag chips, thumbnail.
- Testimonials: centred heading, slider card in cols 2–3 with quote (Host Grotesk), avatar, name, role, `<Dots>`, PREV / NEXT cells with text-slide hover.
- Clients: heading row + left column (sentence, profile row, "BOOK A CALL →" cell), right list of 8 brands with year suffix `2025/`.
- Approach (light): heading row, big image left (`approach.png`), 2×2 step cells `01/ … 04/` with dots.
- Awards: heading + sentence left, 4 rows right (`01/ Awwwards (3×)` + mono description).
- Blogs: heading + "READ MORE BLOGS →" cell, profile card (avatar, name, mono text), 3 `<BlogCard>` (category, date, arrow circle, title) laid on the grid.
- FAQ: centred heading, 8 `<Faq>` accordion rows in cols 2–3, then "DIDN'T FIND YOUR ANSWER?" row with "SEND ME A MESSAGE →" cell + mono text.
- Contact: heading + profile + "LETS' CONNECT" email/phone left; form right (NAME, EMAIL | PHONE, BUDGET, MESSAGE textarea, "I usually reply within 24 hours." + "SEND REQUEST →" cell). Inputs are borderless cells on the grid with mono labels.

Works list: tag "● CASE STUDIES", H2 "BUILT TO STAND OUT" (first line grey), right mono text, 5 cards placed on the grid (Glidex col 1 small, Veon cols 3–4, Sienna cols 2–3, Zayla cols 1–2, Destello cols 2–3).

Work detail: tag "● CASE STUDIES" + H1 title + right mono description; hero image full width in a 4-corner box; content row: "● OVERVIEW" left, right column with paragraph, DATE / CLIENT / INDUSTRY / SERVICES / LIVE PROJECT rows; 2×2 gallery with corners; "● NEXT PROJECT" with one `<WorkCard>` and "EXPLORE ALL WORKS →" cell.

Blogs list: tag "● BLOGS", H2 "FROM MY DESK", right mono text, 8 `<BlogCard>` in 2 rows of 4.

Blog detail: tag = category, H2 title, date right; small cover image left in a corner box; right column: intro (Host Grotesk regular), H3 uppercase section headings with paragraphs; "● NEXT BLOGS" with 2 `<BlogCard>` + "EXPLORE ALL BLOGS →" cell.

Not found: "404" H1 + paragraph + "BACK TO HOME →" cell inside the grid; shares navbar/footer.

## 6. Animation spec

1. Preloader (`<Preloader>`, home only, first full page load): fixed overlay z-50; 4 white panels each 25 % wide / 100 % high (103 % width to hide seams); brand name "ELIAN KENT" centred, Host Grotesk h4 uppercase, per-character appear (opacity 0 → 1, y 30 → 0, spring stiffness 200 damping 20, 0.05 s stagger) on mount. After 1 s: text drops out (translateY to below viewport, tween 0.8 s, ease `cubic-bezier(.79,.04,.16,1.03)`), panels collapse downward (height 100 % → 2 %, anchored at bottom −40 px, tween 1 s same ease, 0.12 s stagger per panel). Overlay unmounts at ~2.2 s. Hero appear delays (1.0 / 1.4 / 1.6 / 1.8 / 2.0 s) are relative to page load so they line up with the wipe. On client-side navigation back to home the preloader does not replay.
2. Appear system (`<Appear preset="fade|up|left|right|scale" delay amount>`): `motion.div` with `initial` + `whileInView` (`once: true`, `amount: 0.15`), spring `bounce: 0`, duration 1–1.5 s; presets: up (y 40 / 30), left (x −30, hero x −150), right (x 30, hero x 150), scale (1.2 → 1, hero image), fade. Respects `prefers-reduced-motion` (renders final state).
3. Text reveal (`<TextReveal>` on About paragraphs): GSAP SplitText into chars (words `white-space: nowrap`), initial opacity 0.4, ScrollTrigger scrub from `top 90%` to `bottom 70%` animating chars sequentially to opacity 1. Re-split on font load / resize.
4. Counter: counts from 0 to `end` over ~2 s ease-out when in view (once), prefix/suffix, tabular nums, `Number` formatting.
5. Showcase reel: ScrollTrigger scrub (with spring-like smoothing via `scrub: 1`) over the 200 vh section: holder scale 0.2 → 1, inner scale 1.8 → 1, words x ∓1200 → 0.
6. Work card hover (`<LiquidImage>`): three.js orthographic plane with two textures; fragment shader mixes hover texture inside a mouse-following circular mask (radius ~100 px) whose edge is distorted by time-animated simplex noise (`texture 0.5`, `speed 5`, `boost 0.5`); mask position eased toward the pointer each frame; fades out on leave. Touch / no-WebGL fallback: CSS cross-fade on tap/hover. Card image also scales 1 → 1.05 on hover (tween 0.5 s).
7. Testimonial slider: 4 items, index state; quote/author block cross-fades and slides (motion `AnimatePresence`, 0.4 s); dots reflect index; PREV/NEXT cells swap label upward on hover (duplicate label from below, spring 0.6 s).
8. FAQ accordion: one open at a time; answer height animates (motion `animate={{height}}` 0.4 s ease); plus icon rotates 45° when open; row hover changes text colour.
9. Buttons / arrow cells (`<ArrowButton>`): on hover the arrow slides right and a second arrow enters from the left (text-slide), background tints `white/5`; nav links hover to white; blog card arrow circle inverts colours; client rows hover brighten; service rows hover tint.
10. Mobile menu: overlay fades + links stagger in (0.05 s), hamburger morphs to ×.
11. Lenis: `lerp 0.1`, synced to GSAP ticker; `ScrollTrigger.update` on Lenis scroll; route change → `lenis.scrollTo(0, {immediate: true})`.
12. Page enter: sub-pages use the same appear presets for hero text/images (no preloader).

## 7. Content model (`src/content/types.ts`)

```ts
type Img = { src: string; alt: string; width: number; height: number }
type Work = { slug; title; services: string[]; cover: Img; hoverCover: Img; date; client; industry; liveUrl?: string; description; overview; gallery: Img[]; }
type Blog = { slug; title; category; date; cover: Img; intro; sections: { heading; body }[] }
type Faq = { q; a }   type Testimonial = { quote; name; role; avatar: Img }
type Client = { name; year }   type Award = { name; text }
type Service = { title; text; tags: string[]; image: Img }
type Metric = { end: number; suffix: string; label; text; dots: 1|2|3|4 }
type Step = { title; text; dots: 1|2|3|4 }
```
"Next" items are derived (next in array order, wrapping) rather than stored.

## 8. Form

Fields: Name, Email, Phone, Budget, Message (all required, email format check). Submit: disabled while pending; if `VITE_FORM_ENDPOINT` is set, `fetch(POST, JSON)`, else 800 ms simulated success. States: idle → pending → success ("REQUEST SENT") / error ("TRY AGAIN"). Honeypot field kept.

## 9. SEO / meta

`<Seo title description>` sets `document.title` and the description meta tag per page. `index.html` carries the favicon, OG image, theme colour `#0e0e0e`. No prerendering (can be added later with `vite-plugin-prerender`-style tooling if needed).

## 10. QA

`scripts/compare.mjs URL_LOCAL URL_ORIGINAL` uses playwright-core with the locally installed Chromium to capture full-page screenshots after scrolling through (so appear animations fire) at widths 1440 / 1024 / 390 for `/`, `/works`, `/works/destello`, `/blogs`, `/blogs/the-roadmap-behind-great-design`, `/nope` into `qa/`. Review by eye; fix deltas. `npm run build` must pass.

## 11. Phases (each becomes a plan section)

1. Foundation: tokens, fonts, base CSS, grid primitives, Navbar, MobileMenu, Footer, routing, Lenis, ScrollToTop, Seo, 404, assets copied with semantic names, content types + all content files.
2. Home sections — desktop layout for all 14 sections.
3. Home responsive — tablet and phone layouts.
4. Animations — preloader, appear presets, text reveal, counters, reel, liquid hover, slider, accordion, hover states.
5. Works list + detail, Blogs list + detail (layout, responsive, appear).
6. QA compare + fixes, README (how to edit content, env var, deploy).

Estimate: 8–11 h of agent work over several sessions.
