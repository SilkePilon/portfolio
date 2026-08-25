# Elian Kent → React + Vite 1:1 port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild https://eliankent.framer.website/ pixel-for-pixel (layout, type, assets, responsive behaviour, animations) as a self-hostable React + Vite app in this repo.

**Architecture:** One Vite SPA; `react-router-dom` routes → page components → section components fed by typed content files in `src/content`. Shared UI primitives reproduce Framer's 4-column rule grid, corner markers and button behaviours. Animations: `motion` (appear / hover / accordion), GSAP ScrollTrigger + SplitText (scroll-scrubbed text reveal and the video reel), Lenis (smooth scroll), three.js (liquid hover on work cards).

**Tech Stack:** Vite 8, React 19, TypeScript 6, Tailwind CSS 4.3 (`@tailwindcss/vite`), react-router-dom 7, motion 13, gsap 3.15, lenis 1.3, three 0.185, @fontsource-variable/host-grotesk, @fontsource/ibm-plex-mono, @fontsource-variable/inter, vitest + @testing-library/react (tests), playwright-core (screenshots, uses `~/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-25-eliankent-clone-design.md`. Fidelity to the original is the acceptance bar; do not "improve" the design.
- Breakpoints (Framer): phone `< 810px` (default / mobile-first), `tablet:` `≥ 810px`, `desktop:` `≥ 1200px`. No other breakpoints.
- Page grid: sections have `padding: 0 20px` (`0 10px` on phone), inner container `max-width: 1600px`, 4 equal columns on desktop (`repeat(4, minmax(50px, 1fr))`), 2 columns on tablet/phone unless the digest says otherwise. Column rules are 1 px lines: `rgba(255,255,255,.15)` on dark, `rgba(0,0,0,.15)` on light.
- Colours: black `#0e0e0e`, white `#fff`, light-section bg `#ededed`, gray-900 `#1a1a1a`, gray-800 `#212121`, gray-500 `#999999` (muted text on dark and light), gray-400 `#ababab`, gray-300 `#c4c4c4` (nav link idle), gray-100 `#e0e0e0`, link `#0099ff`, white-60 `rgba(255,255,255,.6)`.
- Fonts: display = Host Grotesk (variable), mono = IBM Plex Mono, fallback sans = Inter. Type utilities in §Task 1 are the only type styles allowed (no ad-hoc font sizes except FitText and the hero/footer wordmarks).
- `<main>` is `flex flex-col items-center gap-[150px] pb-[150px] bg-black`; light sections add their own `py-[150px]` and bg `#ededed`.
- Every visible string comes from `src/content/*`. Components never import content directly except pages.
- Reference material lives in `reference/` (gitignored): `index.html`, `works*.html`, `blogs*.html`, `this-page-does-not-exist-404.html`, JS bundles in `js/`, screenshots in `shots/` (`pw_home_00..06.png` desktop 1440 wide in 3000 px slices, `pw_home_phone_00..07.png` 390 wide, `home_works.png`, `home_works_destello.png`, `home_blogs.png`, `home_blogs_the-roadmap-behind-great-design.png`, interaction states `ix_*.png`, `contact_sheet.png`), `content_pages.json`, `icons.md`, and the layout digest tool `digest.py`.
- Layout digest tool: `python3 reference/digest.py reference/index.html "Section - Works" 7 desktop` prints the original DOM tree for that section (framer names, classes, resolved CSS for the given breakpoint, inline styles, text). Use `tablet` / `phone` as the 4th arg for other breakpoints and any other `reference/*.html` file for sub-pages. Root names: `Section - Hero`, `Section - Bio`, `Section - About`, `Section - Showcase reel`, `Section - Works`, `Section - Services`, `Section - Testimonial`, `Section - Clients`, `Section - Approach`, `Section - Awards`, `Section - Blogs`, `Section - FAQ`, `Section - Contact`, `tag:footer`, `Desktop` (first match = navbar), `Load Innitial` (preloader), `Main`.
- Do not reproduce: Framer badges ("Made in Framer", "Use for free"), the "New Release" promo modal (`Cta`/`Backdrop`/`Content`), Framer analytics, Framer forms, Framer search index.
- Commit after every task (`git add -A && git commit -m "..."`). Never commit `reference/` or `qa/` (gitignored).
- Verify with `npm run build` (tsc + vite) and `npm test` before every commit. For visual tasks also run `node scripts/shot.mjs <path> <name>` and compare against `reference/shots/`.

---

## File structure

```
index.html                         head: title, description, favicon (light/dark), og image, theme-color
vite.config.ts                     react + tailwind plugins, @ alias, vitest config
src/main.tsx                       BrowserRouter + App
src/App.tsx                        Routes → Layout → pages (lazy)
src/index.css                      tailwind import, @theme tokens, font imports, base, type utilities
src/test/setup.ts                  jest-dom matchers
src/lib/cn.ts                      class join helper
src/lib/gsap.ts                    gsap + ScrollTrigger + SplitText registration
src/lib/lenis.ts                   Lenis singleton wired to GSAP ticker
src/lib/rich.tsx                   <Rich text="~muted~ strong"/> renderer for mixed muted/strong copy
src/content/types.ts               content types
src/content/site.ts                brand, nav, socials, footer, seo
src/content/home.ts                every home section's copy + image refs
src/content/works.ts               Work[] (generated then hand-checked)
src/content/blogs.ts               Blog[] (generated then hand-checked)
src/content/pages.ts               works/blogs/404 page headers + labels
scripts/gen-content.mjs            generates works.ts/blogs.ts from reference/content_pages.json
scripts/shot.mjs                   local screenshots at 1440/1024/390 into qa/
scripts/compare.py                 side-by-side composite local vs original
src/components/ui/{Section,GridLines,Grid,Corners,SectionTag,Chip,Dots,Icons,ArrowButton,SlideText,FitText,Video,Profile}.tsx
src/components/anim/{Appear,TextReveal,Counter,Preloader,LiquidImage}.tsx
src/components/layout/{Layout,Navbar,MobileMenu,Footer,SmoothScroll,ScrollManager,Seo}.tsx
src/components/home/{Hero,BioStrip,About,Metrics,ShowcaseReel,WorksGrid,Services,Testimonials,Clients,Approach,Awards,BlogsPreview,Faq,Contact}.tsx
src/components/works/{WorkCard,NextWork}.tsx
src/components/blogs/{BlogCard,NextBlogs}.tsx
src/pages/{Home,Works,WorkDetail,Blogs,BlogDetail,NotFound}.tsx
public/images/**, public/videos/showcase.mp4, public/favicon-*.png, public/og.png   (already in place)
```

Asset manifest (already copied to `public/`): `images/hero.png` (2400×1412), `about-1.png` (1800×2400, seated portrait), `about-2.png` (2400×1600, close portrait; also the profile avatar everywhere), `services-1.png` (1808×2400 desk clock), `services-2.png` (2400×1200 motion-blur flower), `services/{brand-identity.webp,web-design.webp,creative-direction.png,ux-ui.webp}`, `approach.png` (2400×1800), `testimonials/team-{1..4}.png` (100×83), `clients/{lunaris-studio.webp,verden-health.png,altrove-labs.png,haven-and-co.png,solvra-systems.png,northmere-capital.png,echion-media.png,arden-supply-house.png}` (hover reveal images), `creator.jpg`, `works/{slug}-cover.png` + `works/{slug}-{1..4}.png|jpg` (gallery; `-1` is also the liquid hover image; glidex has only 1..3), `blogs/{slug}.{png|jpg|webp}` covers, `videos/showcase.mp4` (1280p re-encode of the original 4K clip), `favicon-light.png`, `favicon-dark.png`, `og.png`.

---

## Phase 1 — Foundation (Tasks 1–5, run inline, sequential)

### Task 1: Tooling, tokens, type system

**Files:**
- Modify: `vite.config.ts`, `tsconfig.app.json`, `index.html`, `package.json` (scripts)
- Create: `src/index.css`, `src/test/setup.ts`, `src/lib/cn.ts`, `.env.example`, `scripts/shot.mjs`
- Delete: `src/App.css`, `src/assets/react.svg`, default `src/App.tsx` body (replaced in Task 5)
- Test: `src/lib/cn.test.ts`

**Interfaces:**
- Produces: Tailwind theme (`tablet:`/`desktop:` variants, colour names above, `font-display|mono|sans`), utility classes `text-display text-h2 text-h3 text-h4 text-h4-regular text-h5 text-lead text-body text-mono text-mono-bold text-nav`, CSS vars `--rule`, `--corner` set by `.theme-dark` / `.theme-light`; Tailwind colours `rule` (→ `var(--rule)`) and `corner`; `cn()`.

- [ ] **Step 1: Install test deps**

Run: `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: vite.config.ts**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
})
```

`tsconfig.app.json`: add `"baseUrl": ".", "paths": { "@/*": ["src/*"] }, "types": ["vitest/globals", "@testing-library/jest-dom"]` inside `compilerOptions`, and `"include": ["src", "scripts"]` stays `["src"]`.

`src/test/setup.ts`: `import '@testing-library/jest-dom/vitest'`

`package.json` scripts: `"dev": "vite", "build": "tsc -b && vite build", "preview": "vite preview", "test": "vitest run", "test:watch": "vitest", "lint": "oxlint", "shot": "node scripts/shot.mjs", "gen:content": "node scripts/gen-content.mjs"`.

- [ ] **Step 3: index.html head**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Elian Kent</title>
    <meta name="description" content="I create digital experiences that feel effortless to use and powerful in impact—FRAMER sites that help modern brands grow with clarity and confidence" />
    <link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" />
    <link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Elian Kent" />
    <meta property="og:image" content="/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0e0e0e" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: src/index.css**

```css
@import "tailwindcss";
@import "@fontsource-variable/host-grotesk";
@import "@fontsource-variable/host-grotesk/wght-italic.css";
@import "@fontsource/ibm-plex-mono/400.css";
@import "@fontsource/ibm-plex-mono/400-italic.css";
@import "@fontsource/ibm-plex-mono/500.css";
@import "@fontsource/ibm-plex-mono/600.css";
@import "@fontsource/ibm-plex-mono/700.css";
@import "@fontsource-variable/inter";
@import "lenis/dist/lenis.css";

@theme {
  --breakpoint-*: initial;
  --breakpoint-tablet: 810px;
  --breakpoint-desktop: 1200px;

  --color-*: initial;
  --color-black: #0e0e0e;
  --color-white: #ffffff;
  --color-light: #ededed;
  --color-gray-900: #1a1a1a;
  --color-gray-800: #212121;
  --color-gray-500: #999999;
  --color-gray-400: #ababab;
  --color-gray-300: #c4c4c4;
  --color-gray-100: #e0e0e0;
  --color-link: #0099ff;
  --color-rule: var(--rule);
  --color-corner: var(--corner);

  --font-display: "Host Grotesk Variable", "Host Grotesk", sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --font-sans: "Inter Variable", Inter, sans-serif;

  --ease-framer: cubic-bezier(0.79, 0.04, 0.16, 1);
  --ease-out-expo: cubic-bezier(0.22, 1, 0.36, 1);
}

@layer base {
  :root { --rule: rgba(255, 255, 255, 0.15); --corner: rgba(255, 255, 255, 0.5); }
  .theme-dark { --rule: rgba(255, 255, 255, 0.15); --corner: rgba(255, 255, 255, 0.5); color: var(--color-white); }
  .theme-light { --rule: rgba(0, 0, 0, 0.15); --corner: rgba(0, 0, 0, 0.5); color: var(--color-black); }
  html { background: var(--color-black); color: var(--color-white); -webkit-font-smoothing: antialiased; }
  body { font-family: var(--font-sans); overflow-x: clip; }
  img, video { display: block; max-width: 100%; }
  a { color: inherit; text-decoration: none; }
  button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  input, textarea { font: inherit; color: inherit; background: none; border: 0; outline: none; }
}

/* Type presets copied from the Framer style presets (phone / tablet / desktop) */
@utility text-display { font-family: var(--font-display); font-weight: 700; font-size: 64px; line-height: 0.9; letter-spacing: -0.05em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 90px; } @media (width >= 1200px) { font-size: 120px; } }
@utility text-h2 { font-family: var(--font-display); font-weight: 700; font-size: 50px; line-height: 0.9; letter-spacing: -0.03em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 64px; } @media (width >= 1200px) { font-size: 80px; } }
@utility text-h3 { font-family: var(--font-display); font-weight: 700; font-size: 32px; line-height: 0.9; letter-spacing: -0.03em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 40px; } @media (width >= 1200px) { font-size: 50px; } }
@utility text-h4 { font-family: var(--font-display); font-weight: 700; font-size: 20px; line-height: 0.9; letter-spacing: -0.02em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 24px; } @media (width >= 1200px) { font-size: 30px; } }
@utility text-h4-regular { font-family: var(--font-display); font-weight: 400; font-size: 20px; line-height: 0.9; letter-spacing: -0.02em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 24px; } @media (width >= 1200px) { font-size: 30px; } }
@utility text-h5 { font-family: var(--font-display); font-weight: 700; font-size: 14px; line-height: 1; letter-spacing: -0.02em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 16px; } @media (width >= 1200px) { font-size: 18px; } }
@utility text-lead { font-family: var(--font-display); font-weight: 400; font-size: 16px; line-height: 1.1; letter-spacing: -0.01em;
  @media (width >= 810px) { font-size: 18px; } @media (width >= 1200px) { font-size: 22px; } }
@utility text-body { font-family: var(--font-display); font-weight: 400; font-size: 14px; line-height: 1.1; letter-spacing: -0.01em;
  @media (width >= 810px) { font-size: 16px; } @media (width >= 1200px) { font-size: 18px; } }
@utility text-mono { font-family: var(--font-mono); font-weight: 400; font-size: 12px; line-height: 1.4; text-transform: uppercase;
  @media (width >= 810px) { font-size: 13px; } }
@utility text-mono-bold { font-family: var(--font-mono); font-weight: 600; font-size: 12px; line-height: 1.4; text-transform: uppercase;
  @media (width >= 810px) { font-size: 13px; } }
@utility text-nav { font-family: var(--font-mono); font-weight: 500; font-size: 13px; line-height: 1; letter-spacing: -0.02em; text-transform: uppercase;
  @media (width >= 810px) { font-size: 14px; } }
```

- [ ] **Step 5: cn helper + test**

`src/lib/cn.ts`
```ts
export type ClassValue = string | false | null | undefined | 0
export const cn = (...classes: ClassValue[]): string => classes.filter(Boolean).join(' ')
```
`src/lib/cn.test.ts`
```ts
import { cn } from './cn'
test('joins truthy classes', () => { expect(cn('a', false, 'b', undefined, null, 'c')).toBe('a b c') })
```

- [ ] **Step 6: scripts/shot.mjs** (used by every visual task)

```js
// usage: node scripts/shot.mjs <path> <name> [baseUrl]  → qa/<name>-{1440,1024,390}.png
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const exe = `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`
const [,, path = '/', name = 'home', base = 'http://localhost:5173'] = process.argv
mkdirSync('qa', { recursive: true })
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] })
for (const width of [1440, 1024, 390]) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 900 } })
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(3500)
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += 400) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120) }
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600)
  await page.screenshot({ path: `qa/${name}-${width}.png`, fullPage: true })
  console.log('saved', `qa/${name}-${width}.png`)
  await page.close()
}
await browser.close()
```

`.env.example`: `VITE_FORM_ENDPOINT=` (blank → simulated submit).

- [ ] **Step 7: Verify** `npm test` passes, `npm run build` passes (App may still be the Vite default). Commit: `chore: tooling, tokens and type system`.

### Task 2: Content model and content files

**Files:**
- Create: `src/content/types.ts`, `src/content/site.ts`, `src/content/home.ts`, `src/content/pages.ts`, `scripts/gen-content.mjs` → generates `src/content/works.ts`, `src/content/blogs.ts`
- Test: `src/content/content.test.ts`

**Interfaces (produces):**
```ts
export type Img = { src: string; alt: string; width: number; height: number }
export type Work = { slug: string; title: string; services: string[]; description: string; overview: string; date: string; client: string; industry: string; liveUrl?: string; cover: Img; hover: Img; gallery: Img[] }
export type BlogSection = { heading: string; paragraphs: string[] }
export type Blog = { slug: string; title: string; category: string; date: string; cover: Img; intro: string; sections: BlogSection[] }
export type Metric = { end: number; suffix: string; label: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Service = { n: string; title: string; text: string; tags: string[]; image: Img }
export type Testimonial = { quote: string; name: string; role: string; avatar: Img }
export type Client = { name: string; year: string; image: Img }
export type Step = { n: string; title: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Award = { n: string; name: string; text: string }
export type Faq = { q: string; a: string }
export type NavLink = { label: string; to: string }
export type Social = { label: string; href: string }
```
Rich copy convention: strings may contain `~…~` segments = muted (gray-500) spans; everything else renders in the current text colour. `src/lib/rich.tsx` (Task 3) renders them.

- [ ] **Step 1: types.ts** as above.

- [ ] **Step 2: site.ts**

```ts
import type { Img, NavLink, Social } from './types'
export const site = {
  name: 'Elian Kent',
  logoLines: ['EliaN', 'Kent'],
  seo: { title: 'Elian Kent', description: 'I create digital experiences that feel effortless to use and powerful in impact—FRAMER sites that help modern brands grow with clarity and confidence' },
  nav: [
    { label: 'Home', to: '/' }, { label: 'About', to: '/#about' }, { label: 'Works', to: '/works' },
    { label: 'Blogs', to: '/blogs' }, { label: 'Contact', to: '/#contact' },
  ] satisfies NavLink[],
  bookCall: { label: 'Book a Call', href: 'https://calendly.com/frontendzaid/30min' },
  socials: [
    { label: 'Twitter(X)', href: 'https://x.com/zaidkhan3419' },
    { label: 'Instagram', href: 'https://www.instagram.com/frontendzaid/' },
    { label: 'Framer', href: 'https://www.framer.com/@zaid-khan/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/zaidkhan3419/' },
    { label: 'Dribble', href: 'https://dribbble.com/zaidkhan3419' },
  ] satisfies Social[],
  profile: { name: 'Elian Kent', role: 'Framer Pro Expert', avatar: { src: '/images/about-2.png', alt: 'Elian Kent', width: 2400, height: 1600 } satisfies Img },
  footer: {
    tagline: '~Crafting thoughtful digital experiences built on~ clarity, purpose, and precision.',
    followLabel: 'Follow on',
    note: 'Creating experiences that balance aesthetics, usability, and intent.',
    createdBy: { label: 'Created by', name: 'Zaid Khan', href: 'https://www.framer.com/@zaid-khan/', avatar: { src: '/images/creator.jpg', alt: 'Template owner', width: 1080, height: 1350 } satisfies Img },
    wordmark: 'Elian Kent',
  },
}
```

- [ ] **Step 3: home.ts** — every home string, exactly as on the original (copy from `reference/index.html` / the spec):

```ts
import type { Img, Metric, Service, Testimonial, Client, Step, Award, Faq } from './types'
const img = (src: string, alt: string, width: number, height: number): Img => ({ src, alt, width, height })
export const hero = {
  firstName: 'Elian', lastName: 'Kent',
  intro: '~I create digital experiences that feel~ effortless to use and powerful in impact—FRAMER sites ~that help modern brands grow~ with clarity and confidence',
  badge: 'Certified pro expert',
  image: img('/images/hero.png', 'Elian Kent', 2400, 1412),
}
export const bio = [
  { label: 'Location', value: 'London, UK' }, { label: 'Field', value: 'Design & Development' },
  { label: 'Approach', value: 'Less but Better' }, { label: 'Clients', value: 'Startups & Creative Brands' },
]
export const about = {
  tag: 'About',
  paragraphs: [
    'I’m a FRAMER designer from London, working with brands and founders to create websites that feel clear, confident, and easy to use. I enjoy taking ideas that feel messy or complicated and turning them into something simple and structured.',
    'The process so everything feels aligned and intentional. My goal is always the same: to create work that feels good, works well, and lasts.',
  ],
  image1: img('/images/about-1.png', 'Elian Kent', 1800, 2400),
  caption: '~I build websites that feel~ as good as they look. Clean, intentional, ~and made to leave an impression.~',
  image2: img('/images/about-2.png', 'Elian Kent', 2400, 1600),
  resultTag: 'Driven Result',
  resultHeading: 'The work doesn’t just look good — it performs. Here’s the impact behind the design.',
}
export const metrics: Metric[] = [
  { end: 62, suffix: '+', label: 'Projects', text: 'Websites designed & built for startups, agencies, and brands worldwide.', dots: 1 },
  { end: 3, suffix: '+', label: 'Years Experience', text: 'Refining process, clarity, and performance-driven design.', dots: 2 },
  { end: 98, suffix: '%', label: 'Client Satisfaction', text: 'Long-term relationships, strong communication, and clear delivery.', dots: 3 },
  { end: 5, suffix: '+', label: 'Avg Rating', text: 'Trusted by founders, creatives & teams across different industries.', dots: 4 },
]
export const reel = { video: '/videos/showcase.mp4', words: ['Show', 'Case'] as const }
export const worksSection = {
  tag: 'Selected works(05)',
  heading: '~A collection~\n~of~ refined digital experiences',
  text: '~Every project here was shaped with intention —~ from layout and typography to interaction and tone.',
  closing: '~These selected projects reflect~ my approach to clarity, usability and design. ~You can explore additional case studies and~ work examples.',
  cta: 'Explore all works',
  order: ['sienna', 'glidex', 'veon', 'zayla', 'destello'],
}
export const services = {
  tag: 'Services(04)', heading: '~Design~\nThat Speaks\nfor You',
  text: '~I help brands and startups create~ digital experiences that feel clear, modern, and effortless to use.',
  images: [img('/images/services-1.png', 'Aesthetic Pc setup', 1808, 2400), img('/images/services-2.png', 'Motion blur flowers', 2400, 1200)],
  rows: [
    { n: '01/', title: 'Brand Identity & Visual Systems', text: 'I shape the core visuals of a brand, from logotypes and typography to palettes and systems — ensuring the brand feels memorable, and unmistakably.', tags: ['Category', 'Lifestyle', 'Creative Studios', 'Fashion'], image: img('/images/services/brand-identity.webp', 'Brand Identity & Visual Systems', 1504, 1128) },
    { n: '02/', title: 'Website Design & Development', text: 'I design and develop responsive, high-performing websites focused on clarity, usability, and seamless interaction. Built to look refined and work beautifully across all devices.', tags: ['Figma', 'Framer', 'React', 'NextJS', 'Node.js', 'HTML', 'Tailwind', 'SCSS'], image: img('/images/services/web-design.webp', 'Website Design & Development', 1504, 1128) },
    { n: '03/', title: 'Creative Direction & Content Aesthetic', text: 'I guide visual storytelling through photography, video mood, and brand expression — ensuring every piece of content feels consistent & intentional', tags: ['Hotels & Resorts', 'Product Brands', 'Editorial', 'Travel'], image: img('/images/services/creative-direction.png', 'Creative Direction & Content Aesthetic', 640, 448) },
    { n: '04/', title: 'UX/UI for Digital Products', text: 'I design interfaces that feel intuitive and visually clear — balancing aesthetics with usability to create experiences that are smooth, functional, and scalable.', tags: ['Startups', 'Apps', 'Platforms', 'Dashboards'], image: img('/images/services/ux-ui.webp', 'UX/UI for Digital Products', 1504, 1128) },
  ] satisfies Service[],
}
export const testimonials = {
  tag: 'Testimonials(04)', heading: '~Words That~\nCarry Weight', prev: 'Prev', next: 'Next',
  items: [
    { quote: '"Elian understood the direction instantly. The final result felt refined, balanced, and aligned with exactly how we wanted to present ourselves."', name: 'Olivia Bennett', role: 'Director, Aestha Studio', avatar: img('/images/testimonials/team-1.png', 'Olivia Bennett', 100, 83) },
    { quote: '“There’s a clarity in Aiden’s work that’s hard to find. The site feels modern and intentional, and it performs just as well as it looks.”', name: 'Marcus Lee', role: 'Founder, Nova Labs', avatar: img('/images/testimonials/team-2.png', 'Marcus Lee', 100, 83) },
    { quote: '“Aiden transformed our brand presence. The visual language, structure, and storytelling now feel cohesive and elevated — it finally feels like us.”', name: 'Emma Clarke', role: 'Marketing Lead, Solis Agency', avatar: img('/images/testimonials/team-3.png', 'Emma Clarke', 100, 83) },
    { quote: '“Aiden brings calm, precision, and direction to the process. The collaboration felt seamless, and the result speaks for itself — polished and purposeful.”', name: 'Daniel Ruiz', role: 'Product Manager, Orbit Systems', avatar: img('/images/testimonials/team-4.png', 'Daniel Ruiz', 100, 83) },
  ] satisfies Testimonial[],
}
export const clients = {
  tag: 'Clients(08)', heading: '~Brands~\nI’ve Worked\nWith',
  text: '~I collaborate with~ companies who care about thoughtful digital presence~. Each project is shaped through~ understanding, refinement, and attention to detail.',
  sentence: '~The goal is always the same:~ design that communicates clearly and leaves a lasting impression.',
  cta: 'Book a call',
  items: [
    { name: 'Lunaris Studio', year: '2025/', image: img('/images/clients/lunaris-studio.webp', 'Clients', 1504, 1128) },
    { name: 'Verden Health', year: '2025/', image: img('/images/clients/verden-health.png', 'Clients', 427, 640) },
    { name: 'Altrove Labs', year: '2024/', image: img('/images/clients/altrove-labs.png', 'Clients', 482, 640) },
    { name: 'Haven & Co.', year: '2024/', image: img('/images/clients/haven-and-co.png', 'Clients', 640, 640) },
    { name: 'Solvra Systems', year: '2023/', image: img('/images/clients/solvra-systems.png', 'Clients', 480, 640) },
    { name: 'Northmere Capital', year: '2022/', image: img('/images/clients/northmere-capital.png', 'Clients', 512, 640) },
    { name: 'Echion Media', year: '2021/', image: img('/images/clients/echion-media.png', 'Clients', 640, 359) },
    { name: 'Arden Supply House', year: '2020/', image: img('/images/clients/arden-supply-house.png', 'Clients', 554, 640) },
  ] satisfies Client[],
}
export const approach = {
  tag: 'Approach(04)', heading: '~Creative~\nApproach',
  text: '~Every project is different, but the path to great work stays the same —~ a balance of research, clarity, creativity, and refinement.',
  image: img('/images/approach.png', 'Minimal laptop with coffee', 2400, 1800),
  steps: [
    { n: '01/', title: 'Discovery & Insight', text: 'I start by understanding your world — your audience, your goals, and the challenges behind them.', dots: 1 },
    { n: '02/', title: 'Structure & Strategy', text: 'Uuser flows, content direction, and the overall framework. This is where ideas take shape.', dots: 2 },
    { n: '03/', title: 'Design & Build', text: 'I explore visuals and layouts that elevate your brand while staying aligned with your goals.', dots: 3 },
    { n: '04/', title: 'Refine & Finalize', text: 'This final phase ensures your project feels cohesive, intuitive, and ready for real-world use.', dots: 4 },
  ] satisfies Step[],
}
export const awards = {
  tag: 'Awards & Recognitions', heading: '~Awards~\nThat Define\nthe Craft',
  text: '~Over the years, my work in~ development, design, and modern web development ~has been recognized for its~ clarity, creativity, and technical precision.',
  items: [
    { n: '01/', name: 'Awwwards (3×)', text: 'Recognized on the Awwwards platform a milestone that celebrates both direction and technical execution.' },
    { n: '02/', name: 'CSSDA (9×)', text: 'Featured on CSS Design Awards with Best Innovation, Best Creativity, Best Animation, and multiple Developer Awards.' },
    { n: '03/', name: 'Framer Gallery (8×)', text: 'I earned a spot in the Framer Gallery twice and received the Framer Expert Badge, showcasing high-quality execution.' },
    { n: '04/', name: 'Behance (3×)', text: 'Awarded across Behance with badges in Figma, Adobe Illustrator, UI/UX, and multiple case study features.' },
  ] satisfies Award[],
}
export const blogsSection = {
  tag: 'Blogs(03)', heading: '~Stories~\nBehind the\nWork', cta: 'Read more blogs',
  text: '~I write to unpack the thinking behind~ the work — the choices, the reasoning, and the quiet decisions that shape how a project feels and performs',
  slugs: ['designing-with-intent-why-clarity-beats-complexity', 'why-framer-makes-the-workflow-effortless', 'how-visual-hierarchy-shapes-user-decisions'],
}
export const faq = {
  tag: 'FAQ’s(08)', heading: '~Frequently~\nAsked Questions',
  items: [
    { q: 'How does the project typically start?', a: 'We begin with a short call or message to understand your goals, audience, and brand direction. From there, I create a clear project outline before any design work begins.' },
    { q: 'How long does a project usually take?', a: 'Timelines vary based on scope, but most full website projects take 2–4 weeks. I’ll share a schedule before we start and keep you updated throughout the process.' },
    { q: 'What if I don’t have branding yet?', a: 'Not a problem. I can create or refine your brand direction — including color palette, typography, and visual tone — before the website design begins.' },
    { q: 'Do you offer ongoing support after the project?', a: 'Yes. I offer ongoing maintenance and improvements if needed. You can reach out anytime for updates or future expansions.' },
    { q: 'Will the website be responsive for all devices?', a: 'Absolutely. Every design is created to work seamlessly across desktop, tablet, and mobile.' },
    { q: 'Can you work with content I already have?', a: 'Yes — I can either work with what you provide or help refine/improve the content to make sure it communicates clearly and effectively.' },
    { q: 'What about SEO?', a: 'I implement clean structure, metadata, and performance optimization as part of the build. If you want deeper SEO strategy or campaigns, we can discuss next steps.' },
    { q: 'What’s your pricing structure?', a: 'Pricing is based on scope, complexity, and timeline. Once I understand your requirements, I’ll send a clear, transparent quote — no hidden fees.' },
  ] satisfies Faq[],
  footer: { heading: '~Didn’t Find~\nYour Answer?', text: '~No worries — just reach out.~ I’m always happy to clarify or walk you through anything.', cta: 'Send me a message' },
}
export const contact = {
  tag: 'Contact', heading: '~Have a~\nProject in\nMind?',
  sentence: '~I’m always open to~ collaborations and creative challenges.',
  connectLabel: "Lets' Connect", email: 'hello@eliankent.com', phone: '+00 0123456789',
  fields: { name: { label: 'Name', placeholder: 'Jane Smith' }, email: { label: 'Email', placeholder: 'your@email.com' }, phone: { label: 'Phone', placeholder: '+00 0123456789' }, budget: { label: 'Budget', placeholder: '$2000 - $5000' }, message: { label: 'Message', placeholder: 'My message is...' } },
  note: '~I usually reply within~ 24 hours.', submit: 'Send Request', sent: 'Request sent', error: 'Try again',
}
```

- [ ] **Step 4: pages.ts**

```ts
export const pages = {
  works: { tag: 'Case Studies', heading: '~Built to~\nStand Out', text: 'A set of projects that showcase clean thinking, strong execution, and design that actually works.', seoTitle: 'Works - Elian Kent' },
  workDetail: { tag: 'Case Studies', overview: 'Overview', labels: { date: 'Date:', client: 'Client:', industry: 'Industry:', services: 'Services:', live: 'Live Project:' }, next: 'Next Project', cta: 'Explore all works' },
  blogs: { tag: 'Blogs', heading: '~From~\nMy Desk', text: 'Simple thoughts on design, development, and creativity.', seoTitle: 'Blogs - Elian Kent' },
  blogDetail: { next: 'Next Blogs', cta: 'Explore all blogs' },
  notFound: { title: '404', text: 'It seems you’ve reached a page that doesn’t exist. Head back to the homepage or use the navigation above to continue exploring.', cta: 'Back to Home', seoTitle: '404 - Elian Kent' },
}
```

- [ ] **Step 5: scripts/gen-content.mjs** — generates works.ts and blogs.ts from `reference/content_pages.json` (blocks are `[tag, text]` pairs in page order):

```js
import { readFileSync, writeFileSync } from 'node:fs'
const data = JSON.parse(readFileSync('reference/content_pages.json', 'utf8'))
const q = s => JSON.stringify(s)
const coverExt = { 'why-framer-development-is-modern-creation': 'jpg', 'from-design-to-fully-functional-websites': 'webp' }
const coverSize = { 'why-framer-development-is-modern-creation': [2400,1200], 'the-roadmap-behind-great-design': [448,640], 'designing-a-brand-that-speaks-without-words': [480,640], 'building-brand-atmosphere-through-color-typography': [640,427], 'from-design-to-fully-functional-websites': [1280,720], 'how-visual-hierarchy-shapes-user-decisions': [640,640], 'why-framer-makes-the-workflow-effortless': [1024,964], 'designing-with-intent-why-clarity-beats-complexity': [1680,2400] }
const categories = { 'why-framer-development-is-modern-creation': 'Framer Development', 'the-roadmap-behind-great-design': 'Design Strategy', 'designing-a-brand-that-speaks-without-words': 'Brand Identity', 'building-brand-atmosphere-through-color-typography': 'Brand Identity', 'from-design-to-fully-functional-websites': 'Framer Development', 'how-visual-hierarchy-shapes-user-decisions': 'UI Principles', 'why-framer-makes-the-workflow-effortless': 'Framer Development', 'designing-with-intent-why-clarity-beats-complexity': 'Design Strategy' }
const blogOrder = Object.keys(categories)
const blogs = blogOrder.map(slug => {
  const page = data[`blogs_${slug}.html`]
  const title = page.title.replace(' - Elian Kent', '')
  const blocks = page.blocks.filter(([t]) => ['h2','h3','h5','p'].includes(t))
  const date = blocks.find(([t, s]) => t === 'p' && /\d{4}$/.test(s))?.[1] ?? 'November 18, 2025'
  const firstH3 = blocks.findIndex(([t]) => t === 'h3')
  const intro = blocks.slice(0, firstH3).filter(([t]) => t === 'h5').map(([, s]) => s).join('\n\n')
  const sections = []
  for (let i = firstH3; i < blocks.length; i++) {
    if (blocks[i][0] !== 'h3') continue
    const paragraphs = []
    for (let j = i + 1; j < blocks.length && blocks[j][0] === 'h5'; j++) paragraphs.push(blocks[j][1])
    if (paragraphs.length) sections.push({ heading: blocks[i][1], paragraphs })
  }
  const [w, h] = coverSize[slug]
  return `  { slug: ${q(slug)}, title: ${q(title)}, category: ${q(categories[slug])}, date: ${q(date)}, cover: { src: ${q(`/images/blogs/${slug}.${coverExt[slug] ?? 'png'}`)}, alt: ${q(title)}, width: ${w}, height: ${h} },\n    intro: ${q(intro)},\n    sections: [\n${sections.map(s => `      { heading: ${q(s.heading)}, paragraphs: [${s.paragraphs.map(q).join(', ')}] }`).join(',\n')}\n    ] }`
})
writeFileSync('src/content/blogs.ts', `import type { Blog } from './types'\n\nexport const blogs: Blog[] = [\n${blogs.join(',\n')}\n]\n\nexport const blogBySlug = (slug: string) => blogs.find(b => b.slug === slug)\n`)

const workMeta = {
  sienna: { services: ['Web design', 'Branding', 'Framer development'], galleryExt: ['jpg', 'png', 'png', 'png'] },
  glidex: { services: ['Web design', 'Branding', 'SEO'], galleryExt: ['png', 'png', 'png'] },
  veon: { services: ['E-Commerce', 'UIUX Design', 'Shopify', 'Framer Development'], galleryExt: ['png', 'png', 'png', 'png'] },
  zayla: { services: ['Web Development', 'Content Creation'], galleryExt: ['png', 'png', 'png', 'png'] },
  destello: { services: ['UIUX Design', 'Branding', 'Framer Development', 'AI Automation'], galleryExt: ['png', 'png', 'png', 'png'] },
}
const liveUrls = { destello: 'https://destello.framer.website/', zayla: 'https://zaylamonroe.framer.website/' }
const works = Object.keys(workMeta).map(slug => {
  const page = data[`works_${slug}.html`]
  const title = page.title.replace(' - Elian Kent', '')
  const b = page.blocks
  const description = b.find(([t]) => t === 'p')[1]
  const overview = b.find(([t]) => t === 'h5')[1]
  const after = key => { const i = b.findIndex(([t, s]) => t === 'p' && s === key); return i >= 0 ? b[i + 1][1] : '' }
  const meta = workMeta[slug]
  const gallery = meta.galleryExt.map((ext, i) => `{ src: ${q(`/images/works/${slug}-${i + 1}.${ext}`)}, alt: ${q(title)}, width: 1600, height: 1200 }`)
  return `  { slug: ${q(slug)}, title: ${q(title)}, services: ${JSON.stringify(meta.services)},\n    description: ${q(description)},\n    overview: ${q(overview)},\n    date: ${q(after('Date:'))}, client: ${q(after('Client:'))}, industry: ${q(after('Industry:'))},${liveUrls[slug] ? ` liveUrl: ${q(liveUrls[slug])},` : ''}\n    cover: { src: ${q(`/images/works/${slug}-cover.png`)}, alt: ${q(title)}, width: 1600, height: 1200 },\n    hover: ${gallery[0]},\n    gallery: [${gallery.join(', ')}] }`
})
writeFileSync('src/content/works.ts', `import type { Work } from './types'\n\nexport const works: Work[] = [\n${works.join(',\n')}\n]\n\nexport const workBySlug = (slug: string) => works.find(w => w.slug === slug)\n`)
console.log('wrote', blogs.length, 'blogs and', works.length, 'works')
```
Run `npm run gen:content`, then open both generated files and check: destello `client` = `Maya L - Director at Destello`, `industry` = `Agency Editorial`, all 8 blogs have ≥ 3 sections, no empty strings. Fix the script (not the output) if something is off. Gallery sizes: RNCxCWsbL0FEtv5Rd5jBquWpec (destello-4) is 2568×2962, sienna-1.jpg 1600×1200 — fix widths by hand where the contact sheet says otherwise (`reference/shots/contact_sheet.png`).

- [ ] **Step 6: content.test.ts**

```ts
import { existsSync } from 'node:fs'
import { works } from './works'
import { blogs } from './blogs'
import { site } from './site'
import * as home from './home'
const exists = (src: string) => existsSync(`public${src}`)
test('work slugs unique and images exist', () => {
  expect(new Set(works.map(w => w.slug)).size).toBe(5)
  for (const w of works) { expect(exists(w.cover.src)).toBe(true); expect(exists(w.hover.src)).toBe(true); w.gallery.forEach(g => expect(exists(g.src)).toBe(true)); expect(w.overview.length).toBeGreaterThan(40) }
})
test('blog slugs unique, covers exist, sections present', () => {
  expect(new Set(blogs.map(b => b.slug)).size).toBe(8)
  for (const b of blogs) { expect(exists(b.cover.src)).toBe(true); expect(b.sections.length).toBeGreaterThanOrEqual(3); expect(b.intro.length).toBeGreaterThan(40) }
})
test('home images exist', () => {
  const imgs = [home.hero.image, home.about.image1, home.about.image2, home.approach.image, ...home.services.images, ...home.services.rows.map(r => r.image), ...home.testimonials.items.map(t => t.avatar), ...home.clients.items.map(c => c.image), site.profile.avatar, site.footer.createdBy.avatar]
  imgs.forEach(i => expect(exists(i.src)).toBe(true))
  expect(exists(home.reel.video)).toBe(true)
  home.blogsSection.slugs.forEach(s => expect(blogs.some(b => b.slug === s)).toBe(true))
  home.worksSection.order.forEach(s => expect(works.some(w => w.slug === s)).toBe(true))
})
```

- [ ] **Step 7:** `npm test` green → commit `feat: content model and site content`.

### Task 3: UI primitives

**Files:** Create `src/lib/rich.tsx`, `src/components/ui/Section.tsx`, `GridLines.tsx`, `Grid.tsx`, `Corners.tsx`, `SectionTag.tsx`, `Chip.tsx`, `Dots.tsx`, `Icons.tsx`, `ArrowButton.tsx`, `SlideText.tsx`, `FitText.tsx`, `Video.tsx`, `Profile.tsx`; tests `src/components/ui/ui.test.tsx`.

**Interfaces (produces):**
```tsx
<Rich text="~muted~ strong" as="span"|"p"|"h2" className?/>       // '~' toggles muted; '\n' → <br/>
<Section id? theme="dark"|"light" className? innerClassName?>        // <section class="relative w-full px-2.5 tablet:px-5 theme-*"> <div class="mx-auto w-full max-w-[1600px]">
<GridLines theme="dark"|"light" />                                   // absolute overlay, 5 vertical rules (3 below desktop)
<Grid cols={4} className?>                                           // grid grid-cols-2 desktop:grid-cols-4, gap-0
<Corners variant="4"|"top"|"bottom" />                               // absolutely positioned 12px plus markers at -6px
<SectionTag>Selected works(05)</SectionTag>                          // ● + text-mono gray-500 uppercase
<Chip>Figma</Chip>                                                   // text-mono-bold border border-rule px-3 py-2
<Dots active={1|2|3|4} />                                            // four 5px dots, inactive opacity .4
<LogoMark className/>, <ArrowIcon className/>, <PlusIcon/>, <Hamburger open/>   // SVGs from reference/icons.md
<ArrowButton to?|href? bar? className? diagonal?>Label</ArrowButton>  // 290px-ish cell: px-5 py-[25px] text-nav, slide-up label + arrow on hover; bar = 5px white left bar
<SlideText text="Home" idleClassName? hoverClassName? />             // per-char two-layer hover (nav links / socials)
<FitText text="Elian" className? lineHeight=0.8 />                   // scales font-size so the text spans the container width
<Video src poster? className? />                                     // autoplay muted loop playsInline, plays on viewport
<Profile name role avatar size=40 />                                 // round 40px avatar + name (text-mono) + role (text-mono white/60)
```

- [ ] **Step 1: Rich**

```tsx
import { Fragment, createElement, type ElementType } from 'react'
export function Rich({ text, as = 'span', className, mutedClassName = 'text-gray-500' }: { text: string; as?: ElementType; className?: string; mutedClassName?: string }) {
  const parts = text.split('~')
  const children = parts.flatMap((part, i) => {
    const lines = part.split('\n').flatMap((l, j) => (j === 0 ? [l] : [<br key={`br${i}-${j}`} />, l]))
    return i % 2 === 1 ? [<span key={i} className={mutedClassName}>{lines}</span>] : [<Fragment key={i}>{lines}</Fragment>]
  })
  return createElement(as, { className }, ...children)
}
```

- [ ] **Step 2: Section, GridLines, Grid, Corners**

```tsx
// Section.tsx
import { cn } from '@/lib/cn'
export function Section({ id, theme = 'dark', className, innerClassName, children }: { id?: string; theme?: 'dark' | 'light'; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('relative w-full px-2.5 tablet:px-5', theme === 'light' ? 'theme-light bg-light' : 'theme-dark', className)}>
      <div className={cn('relative mx-auto w-full max-w-[1600px]', innerClassName)}>{children}</div>
    </section>
  )
}
// GridLines.tsx — mirrors Framer "border pattern": absolute, 5 x 1px columns spread across the 1600px container
export function GridLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 z-[2] flex justify-center px-2.5 tablet:px-5', className)}>
      <div className="relative flex h-full w-full max-w-[1600px] justify-between overflow-hidden">
        {[0, 1, 2, 3, 4].map(i => <span key={i} className={cn('h-full w-px bg-rule', (i === 1 || i === 3) && 'hidden desktop:block')} />)}
      </div>
    </div>
  )
}
// Grid.tsx
export function Grid({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('grid w-full grid-cols-2 desktop:grid-cols-4', className)}>{children}</div>
}
// Corners.tsx — Framer "4 corners" / "2 corners - bottom": 12px plus icons centred on the box corners
import { PlusIcon } from './Icons'
export function Corners({ variant = '4', className }: { variant?: '4' | 'top' | 'bottom'; className?: string }) {
  const pos = { tl: '-top-1.5 -left-1.5', tr: '-top-1.5 -right-1.5', bl: '-bottom-1.5 -left-1.5', br: '-bottom-1.5 -right-1.5' }
  const keys = variant === '4' ? ['tl', 'tr', 'bl', 'br'] : variant === 'top' ? ['tl', 'tr'] : ['bl', 'br']
  return <>{keys.map(k => <PlusIcon key={k} className={cn('pointer-events-none absolute z-[3] size-3 text-corner', pos[k as keyof typeof pos], className)} />)}</>
}
```
Parent of `<Corners>` must be `relative`.

- [ ] **Step 3: SectionTag, Chip, Dots, Icons, Profile**

```tsx
export function SectionTag({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2.5', className)}><span className="size-[5px] rounded-full bg-current" /><span className="text-mono text-gray-500">{children}</span></div>
}
export function Chip({ children }: { children: React.ReactNode }) { return <span className="text-mono-bold inline-flex border border-rule px-3 py-2">{children}</span> }
export function Dots({ active }: { active: 1 | 2 | 3 | 4 }) {
  return <div className="flex items-center gap-[5px]">{[1, 2, 3, 4].map(i => <span key={i} className="size-[5px] rounded-full bg-current" style={{ opacity: i <= active ? 1 : 0.4 }} />)}</div>
}
```
`Icons.tsx`: `LogoMark` (viewBox `0 0 49 40`, path from `reference/icons.md`, `fill="currentColor"`), `ArrowIcon` (viewBox `0 0 47 47`, path from icons.md — it is a diagonal ↗ arrow; add `className="rotate-45"` prop when a → is needed, default `→` style = rotate 45°; compare with `reference/shots/pw_home_00.png` nav "BOOK A CALL →" and the blog cards "↗"), `PlusIcon` (viewBox `0 0 47 47`, path from icons.md), `Hamburger` (two 18px lines, becomes × when `open`).
`Profile.tsx`: `flex items-start gap-2.5` → `img` 40×40 `rounded-full object-cover` + column gap-[5px]: name `text-mono`, role `text-mono text-white/60` (light: `text-black/60`).

- [ ] **Step 4: ArrowButton + SlideText**

Framer facts: `Form CTA` = `padding 25px 20px`, `justify-between`, 5 px white bar at left when `bar`, label in `overflow-hidden` box with a second copy positioned `top:-20px` that becomes visible on hover while the first moves to `bottom:-20px`; the arrow does the same vertically. Nav/footer `Button` (yCKzG) = same without bar, width 290 px in Framer (here: the parent decides width).

```tsx
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { ArrowIcon } from './Icons'
type Props = { to?: string; href?: string; bar?: boolean; diagonal?: boolean; className?: string; children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }
export function ArrowButton({ to, href, bar, diagonal, className, children, onClick, type, disabled }: Props) {
  const inner = (
    <>
      {bar && <span aria-hidden className="absolute top-0 left-0 z-[1] h-full w-[5px] bg-white" />}
      <span className="relative block overflow-hidden text-nav">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute top-full left-0 block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
      </span>
      <span className="relative block size-3 overflow-hidden">
        <ArrowIcon className={cn('absolute inset-0 size-3 transition-transform duration-500 ease-out-expo group-hover:-translate-y-full', !diagonal && 'rotate-45')} />
        <ArrowIcon className={cn('absolute inset-0 size-3 translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0', !diagonal && 'rotate-45')} />
      </span>
    </>
  )
  const cls = cn('group relative flex w-full cursor-pointer items-center justify-between px-5 py-[25px] text-left', className)
  if (to) return <Link to={to} className={cls} onClick={onClick}>{inner}</Link>
  if (href) return <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>{inner}</a>
  return <button type={type ?? 'button'} className={cls} onClick={onClick} disabled={disabled}>{inner}</button>
}
```
Note: `ease-out-expo` utility comes from `--ease-out-expo` in `@theme` (Tailwind v4 generates `ease-out-expo`). Verify the arrow orientation against `reference/shots/pw_home_00.png` (nav "BOOK A CALL →", footer arrows →, blog card ↗).

```tsx
// SlideText.tsx — Framer nav link: each character has a gray copy and a white copy stacked; on hover the copies shift up
export function SlideText({ text, className, idle = 'text-gray-300', hover = 'text-white' }: { text: string; className?: string; idle?: string; hover?: string }) {
  return (
    <span className={cn('group/slide inline-flex whitespace-pre text-nav', className)}>
      {[...text].map((ch, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <span className={cn('block transition-transform duration-500 ease-out-expo group-hover/slide:-translate-y-full', idle)} style={{ transitionDelay: `${i * 20}ms` }}>{ch}</span>
          <span aria-hidden className={cn('absolute top-full left-0 block transition-transform duration-500 ease-out-expo group-hover/slide:-translate-y-full', hover)} style={{ transitionDelay: `${i * 20}ms` }}>{ch}</span>
        </span>
      ))}
    </span>
  )
}
```
The hover should also trigger when an ancestor with class `group` is hovered: add `group-hover:-translate-y-full` next to `group-hover/slide:` on both spans.

- [ ] **Step 5: FitText + Video**

```tsx
// FitText.tsx — Framer "fit text": font-size scales so the text spans 100% of the container width
import { useLayoutEffect, useRef, useState } from 'react'
export function FitText({ text, className, lineHeight = 0.8, as: Tag = 'div' }: { text: string; className?: string; lineHeight?: number; as?: 'div' | 'h1' | 'span' }) {
  const box = useRef<HTMLDivElement>(null); const probe = useRef<HTMLSpanElement>(null); const [size, setSize] = useState(100)
  useLayoutEffect(() => {
    const el = box.current, p = probe.current; if (!el || !p) return
    const fit = () => { const w = el.clientWidth, natural = p.getBoundingClientRect().width; if (w && natural) setSize(100 * (w / natural)) }
    fit(); const ro = new ResizeObserver(fit); ro.observe(el); document.fonts?.ready.then(fit); return () => ro.disconnect()
  }, [text])
  return (
    <div ref={box} className="relative w-full">
      <span ref={probe} aria-hidden className={cn('pointer-events-none absolute top-0 left-0 whitespace-pre opacity-0', className)} style={{ fontSize: 100, lineHeight }}>{text}</span>
      <Tag className={cn('block whitespace-pre', className)} style={{ fontSize: size, lineHeight }}>{text}</Tag>
    </div>
  )
}
// Video.tsx
export function Video({ src, className }: { src: string; className?: string }) {
  return <video src={src} className={cn('h-full w-full object-cover', className)} autoPlay muted loop playsInline preload="metadata" />
}
```

- [ ] **Step 6: ui.test.tsx** — render `<Rich text="~a~ b\nc"/>` and assert the muted span has class `text-gray-500`, `<Dots active={2}/>` renders 4 dots with opacities `1,1,0.4,0.4`, `<ArrowButton to="/works">Explore</ArrowButton>` (inside a `MemoryRouter`) renders a link with href `/works` and the label twice, `<SlideText text="Home"/>` renders 8 characters. Run `npm test`.

- [ ] **Step 7:** `npm run build` + `npm test` → commit `feat: ui primitives`.

### Task 4: Animation utilities and preloader

**Files:** Create `src/lib/gsap.ts`, `src/lib/lenis.ts`, `src/components/anim/Appear.tsx`, `TextReveal.tsx`, `Counter.tsx`, `Preloader.tsx`; tests `src/components/anim/anim.test.tsx`.

**Interfaces (produces):**
```tsx
<Appear preset="up"|"left"|"right"|"fade"|"scale" x? y? delay=0 duration=1 amount=0.15 trigger="view"|"mount" className? as="div"|"section"|…>children</Appear>
<TextReveal as="p" className>text</TextReveal>            // GSAP SplitText scroll-scrub reveal
<Counter end={62} suffix="+" duration=2 className/>
<Preloader />                                              // renders overlay on first load only; exports `preloaderShown` boolean
export const PRELOADER_DURATION = 2.4                       // seconds; hero delays add nothing when preloaderShown === false
getLenis(): Lenis | null
```

- [ ] **Step 1: lib/gsap.ts + lib/lenis.ts**

```ts
// gsap.ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(ScrollTrigger, SplitText)
export { gsap, ScrollTrigger, SplitText }
// lenis.ts
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
let lenis: Lenis | null = null
export function initLenis() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(t => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}
export const getLenis = () => lenis
```

- [ ] **Step 2: Appear**

```tsx
import { motion, useReducedMotion } from 'motion/react'
import type { ComponentProps } from 'react'
type Preset = 'up' | 'left' | 'right' | 'fade' | 'scale'
const presets: Record<Preset, Record<string, number>> = { up: { opacity: 0, y: 40 }, left: { opacity: 0, x: -30 }, right: { opacity: 0, x: 30 }, fade: { opacity: 0 }, scale: { opacity: 0, scale: 1.2 } }
type Props = { preset?: Preset; x?: number; y?: number; delay?: number; duration?: number; amount?: number; trigger?: 'view' | 'mount'; as?: keyof typeof motion; className?: string; style?: React.CSSProperties; children?: React.ReactNode } & Omit<ComponentProps<'div'>, 'style' | 'children'>
export function Appear({ preset = 'up', x, y, delay = 0, duration = 1, amount = 0.15, trigger = 'view', as = 'div', className, style, children, ...rest }: Props) {
  const reduce = useReducedMotion()
  const Tag = motion[as] as typeof motion.div
  const initial = { ...presets[preset], ...(x !== undefined && { x }), ...(y !== undefined && { y }) }
  const target = { opacity: 1, x: 0, y: 0, scale: 1 }
  const transition = { type: 'spring' as const, bounce: 0, duration, delay }
  if (reduce) return <Tag className={className} style={style} {...(rest as object)}>{children}</Tag>
  return trigger === 'mount'
    ? <Tag className={className} style={style} initial={initial} animate={target} transition={transition} {...(rest as object)}>{children}</Tag>
    : <Tag className={className} style={style} initial={initial} whileInView={target} viewport={{ once: true, amount }} transition={transition} {...(rest as object)}>{children}</Tag>
}
```

- [ ] **Step 3: TextReveal** (original: SplitText words+chars, chars start at opacity .4, timeline scrubbed from `top 90%` to `bottom 70%`, each char to opacity 1 sequentially)

```tsx
import { useLayoutEffect, useRef } from 'react'
import { gsap, SplitText } from '@/lib/gsap'
export function TextReveal({ children, className, as: Tag = 'p' }: { children: React.ReactNode; className?: string; as?: 'p' | 'h2' | 'h3' | 'div' }) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return
    const ctx = gsap.context(() => {
      SplitText.create(el, { type: 'words,chars', autoSplit: true, onSplit: self => {
        gsap.set(self.words, { whiteSpace: 'nowrap' })
        return gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 70%', scrub: true } })
          .fromTo(self.chars, { opacity: 0.4 }, { opacity: 1, duration: 1, stagger: 1, ease: 'none' })
      } })
    })
    return () => ctx.revert()
  }, [])
  return <Tag ref={ref as never} className={className}>{children}</Tag>
}
```

- [ ] **Step 4: Counter**

```tsx
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
export function Counter({ end, suffix = '', prefix = '', duration = 2, className }: { end: number; suffix?: string; prefix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null); const inView = useInView(ref, { once: true, amount: 0.5 }); const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0; const start = performance.now()
    const tick = (t: number) => { const p = Math.min(1, (t - start) / (duration * 1000)); setValue(Math.round((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [inView, end, duration])
  return <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>{prefix}{value}{suffix}</span>
}
```

- [ ] **Step 5: Preloader** (Framer "Panels Intro": 4 white panels + brand name; after 1 s → "Load Finish": name drops out (tween .8 s, ease `[.79,.04,.16,1.03]`), panels collapse to the bottom (tween 1 s, 0.12 s stagger). Name chars appear on mount: opacity 0→1, y 30→0, spring stiffness 200 damping 20, 0.05 s stagger)

```tsx
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
export let preloaderShown = false
export const PRELOADER_DURATION = 2.4
const EASE = [0.79, 0.04, 0.16, 1] as const
export function Preloader({ brand }: { brand: string }) {
  const [show, setShow] = useState(() => !preloaderShown)
  const [exit, setExit] = useState(false)
  useEffect(() => {
    if (!show) return
    preloaderShown = true
    document.documentElement.style.overflow = 'hidden'
    const t1 = setTimeout(() => setExit(true), 1000)
    const t2 = setTimeout(() => { setShow(false); document.documentElement.style.overflow = '' }, PRELOADER_DURATION * 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); document.documentElement.style.overflow = '' }
  }, [show])
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden" aria-hidden>
          <div className="absolute inset-0 flex">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="relative h-full flex-1">
                <motion.div className="absolute top-0 left-[-1.5%] h-full w-[103%] origin-bottom bg-white"
                  animate={exit ? { scaleY: 0.02, y: '100%' } : { scaleY: 1, y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: exit ? i * 0.12 : 0 }} />
              </div>
            ))}
          </div>
          <motion.div className="relative z-[3] flex text-h4 text-black" animate={exit ? { y: '60vh' } : { y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            {[...brand].map((ch, i) => (
              <motion.span key={i} className="inline-block whitespace-pre" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1, delay: 0.05 * i }}>{ch}</motion.span>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
```
Hero delays: the original hero uses `delay 1.0 / 1.4 / 1.6 / 1.8 / 2.0` (bg / ELIAN / KENT / intro / badge). Export a helper `export const heroDelay = (d: number) => (preloaderShown ? d : Math.max(0, d - 1))` from Preloader.tsx — Hero (Task 6) uses it.

- [ ] **Step 6: anim.test.tsx** — `Counter` renders `0+` initially (`useInView` false in jsdom) ; `Appear` renders children; `Preloader` renders the brand characters (mock `motion` minimal? no — motion works in jsdom). Run `npm test`.

- [ ] **Step 7:** build + test → commit `feat: animation utilities and preloader`.

### Task 5: Layout, navbar, footer, routing, 404

**Files:** Create `src/components/layout/{Layout,Navbar,MobileMenu,Footer,SmoothScroll,ScrollManager,Seo}.tsx`, `src/pages/{Home,Works,WorkDetail,Blogs,BlogDetail,NotFound}.tsx` (placeholders except NotFound), `src/App.tsx`, `src/main.tsx`; test `src/App.test.tsx`.

**Original facts (run the digests for exact values):**
- Navbar (`Desktop`): `position: relative`, full width, `padding: 0 20px` (`0 10px` phone), bottom rule 1 px; inner container `max-w-1600 flex items-center` with left/right rules and 2 bottom-corner pluses (`2 corners - bottom`); left cell `pl-5`: logo = 36 px `LogoMark` + two-line wordmark `EliaN`/`Kent` (`text-mono-bold`-like 12 px uppercase, leading 1); centre `links wrapper` flex-2 `gap-[30px]` centred `SlideText` links (idle `#c4c4c4`, hover white); right cell: `ArrowButton` "Book a Call" (`href` calendly, left rule, width ≈ 290 px / 25 % of container). Height ≈ 60 px. Tablet/phone: logo left, `Hamburger` right (36 px square with border), links hidden. See `reference/shots/pw_home_00.png` (top 60 px) and `ix_phone_top.png`, `ix_phone_menu.png`.
- MobileMenu (phone screenshot `ix_phone_menu.png`): full-screen dark overlay below the nav; links stacked `text-h2`-sized uppercase Host Grotesk (~40 px on 390) `gap 4px` starting ~60 px below the nav, then a "BOOK A CALL →" `ArrowButton` cell with top/bottom rules; close = × in the hamburger box. Links stagger in (motion, 0.05 s).
- Footer (`tag:footer`): bg `#1a1a1a`, has its own `GridLines` (5 cols), top rule; 4-col grid (2 cols below desktop): col 1 = brand block (`p-[30px_20px]`, gap 20: logo, tagline `text-mono` white/60 muted + white strong, max-w-240) + "BOOK A CALL" ArrowButton (top rule); col 2 = sitemap: 5 `ArrowButton`s (Home, About, Works, Blogs, Contact) each with top rule; col 3 = "FOLLOW ON" label + 5 `SlideText` socials stacked `gap-[14px]` (`p-[30px_20px]`); col 4 = note text (`text-mono` white/60) top and "CREATED BY [24px avatar] ZAID KHAN" bottom. Then the giant wordmark row: `FitText` "Elian Kent" (font-weight 700, uppercase, `lineHeight 0.8`, clipped by `overflow-hidden`, `-mb-[2%]` so the baseline sits on the bottom edge as in `pw_home_06.png`). Footer has parallax: `translateY(-170px)` → `0` while it scrolls into view (implement with motion `useScroll({target, offset:['start end','end end']})` + `useTransform(progress,[0,1],[-170,0])`; on phone no parallax).
- `<main>` = `theme-dark relative flex w-full flex-col items-center gap-[150px] bg-black pb-[150px]` with a `<GridLines/>` overlay as first child (z-index 2, pointer-events none) — the vertical lines run through the entire page; light sections draw their own lines above it.

- [ ] **Step 1: Seo, ScrollManager, SmoothScroll**

```tsx
// Seo.tsx
import { useEffect } from 'react'
export function Seo({ title, description }: { title: string; description?: string }) {
  useEffect(() => { document.title = title; if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description) }, [title, description])
  return null
}
// SmoothScroll.tsx
import { useEffect } from 'react'
import { initLenis } from '@/lib/lenis'
export function SmoothScroll() { useEffect(() => { initLenis() }, []); return null }
// ScrollManager.tsx — scroll to top on route change, scroll to #hash targets (also from other routes)
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '@/lib/lenis'
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    const lenis = getLenis()
    if (hash) { const go = () => { const el = document.querySelector(hash); if (!el) return; lenis ? lenis.scrollTo(el as HTMLElement, { offset: 0 }) : el.scrollIntoView() }; const t = setTimeout(go, 100); return () => clearTimeout(t) }
    lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
```

- [ ] **Step 2: Navbar + MobileMenu + Footer** — implement per the facts above using `Section`-less markup (`<header className="relative z-[5] w-full px-2.5 tablet:px-5 border-b border-rule">`). Nav wordmark: `<span className="font-display text-[12px] font-bold uppercase leading-[1]">EliaN<br/>Kent</span>` next to `<LogoMark className="size-9 text-white"/>` (check exact size in the digest, `.h2g579` = 36 px). Mobile menu state lives in Navbar; lock body scroll while open (`getLenis()?.stop()` / `.start()`).

- [ ] **Step 3: Layout, App, main.tsx, NotFound**

```tsx
// Layout.tsx
export function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      <SmoothScroll /><ScrollManager />
      {pathname === '/' && <Preloader brand={site.name} />}
      <Navbar />
      <main className="theme-dark relative flex w-full flex-col items-center gap-[150px] bg-black pb-[150px]">
        <GridLines />
        <Suspense fallback={null}><Outlet /></Suspense>
      </main>
      <Footer />
    </>
  )
}
// App.tsx — lazy pages, routes: / works works/:slug blogs blogs/:slug *
```
NotFound page (from `reference/this-page-does-not-exist-404.html` + `home_.png` is blank there; use the digest of `Section - Hero` in that file): 4-col grid row with "404" (`text-display`), paragraph (`text-mono` white/60), "Back to Home" `ArrowButton` cell with rules + corners.

- [ ] **Step 4: App.test.tsx** — render `<MemoryRouter initialEntries={['/nope']}><App/></MemoryRouter>` and expect text `404`; render `/` and expect the nav link `Works` (mock `lenis` with `vi.mock('lenis', () => ({ default: class { on(){} raf(){} scrollTo(){} stop(){} start(){} } }))` and stub `ResizeObserver` + `IntersectionObserver` in `src/test/setup.ts`).

- [ ] **Step 5:** `npm run dev` in background, `node scripts/shot.mjs / layout` → compare nav + footer against `reference/shots/pw_home_00.png` (top) / `pw_home_06.png` (bottom) / `pw_home_phone_00.png` / `pw_home_phone_07.png`. Then build + test → commit `feat: layout, navbar, footer, routing, 404`.

---

## Phase 2 — Home sections (Tasks 6–16; independent, can run in parallel as subagents once Phase 1 is committed)

Common rules for every section task:
1. Read the spec §5/§6 entry, then run the digest for the section at `desktop`, `tablet`, `phone` and study the matching slices of `reference/shots/pw_home_0N.png` (desktop) and `pw_home_phone_0N.png` (phone). Reproduce paddings, gaps, column spans, borders (each cell's `--border-*` vars → `border-t/border-b border-rule`), text colours (`rgb(153,153,153)` → `text-gray-500`, `rgba(255,255,255,.6)` → `text-white/60`), and corner markers.
2. Props in, no content imports: the page passes the content object (`home.ts` export) to the component.
3. Appear animations: wrap the elements that have `data-framer-appear-id` / inline `opacity:0` in the digest with `<Appear>` using the same preset (`translateX(-30px)` → `left`, `translateY(40px)` → `up`, `translateX(30px)` → `right`, `scale(1.2)` → `scale`) and a small stagger (0.1 s per sibling).
4. Add the section to `src/pages/Home.tsx` in order, export from the section file, add a render test (`src/components/home/home.test.tsx`, one `it` per section: renders and shows a key string).
5. Verify: `node scripts/shot.mjs / home` → open `qa/home-1440.png` and `qa/home-390.png`, compare with reference; iterate until matching. Build + test, commit `feat(home): <section>`.

### Task 6: Hero (`Section - Hero`)
Facts: `<header>` `h-screen` (100vh, includes the nav overlap — the nav has a solid background and sits on top; the hero starts at page top, so `Layout` must render the nav `absolute top-0 z-10 w-full` **only on the home page**, static on other pages), `px-5`, `flex items-end`; `bg` div absolute inset-0 with `hero.png` `object-cover` and appear `scale` (delay `heroDelay(1)`, duration 1.5); container `max-w-1600 flex-col justify-end`. Row 1 (4-col grid): `FitText "Elian"` spanning cols 1–2 (Framer fit-text svg, `lineHeight 0.8`, appear `left` x −150, delay `heroDelay(1.4)`, duration 1) placed at the bottom-left of the row; intro `Rich` text (`text-mono`, right-aligned, `max-w-[350px]`, white with muted spans `text-white/60`, `pb-5`, col 4, appear fade delay `heroDelay(1.8)` 1.5 s); Row 2: `FitText "Kent"` cols 3–4 (appear `right` x 150, delay `heroDelay(1.6)`), badge cell col 1 (`Corners variant="bottom"`, top+bottom rules, bg `black/20`, `p-5` flex gap-2.5: `LogoMark` 12 px + "Certified pro expert" `text-mono`, appear fade delay `heroDelay(2)`). Check `pw_home_00.png` (0–900 px) and `pw_home_phone_00.png` (phone: intro text above the name, name spans full width, two lines).

### Task 7: BioStrip + About + Metrics (`Section - Bio`, `Section - About`)
BioStrip: 4-col grid (2 on phone), each cell `p-5` (`p-[14px_10px]` phone) with top+bottom rules; label `text-mono text-gray-500` + value `text-mono-bold`; whole grid appears `fade`.
About: section `gap-[70px]` column; row 1 grid: col 1–2 = `SectionTag About` + two `TextReveal` paragraphs (`text-h3`-sized uppercase Host Grotesk, weight 700? — check digest: preset `63buh5` = text-h3), col 4 = image box (`Corners 4`, `p-5`, `about-1.png` 3:4 `object-cover`) + caption `Rich text-mono text-right`; row 2: col 1–2 image `about-2.png` (`Corners 4`), col 3–4 bottom-aligned `SectionTag Driven Result` + `resultHeading` (`text-h3`). Metrics: 4 cells with top/bottom rules, `p-5`, `Dots`, `Counter` (`text-display`-like size — check digest, ≈ 100 px → use `font-display font-bold` with the size from the digest), label `text-mono-bold`, text `text-mono text-gray-500`. Reference `pw_home_00.png` (600–3000) and `pw_home_01.png` (0–260).

### Task 8: ShowcaseReel (`Section - Showcase reel`)
Facts: section `relative`, sticky container `h-screen w-full sticky top-0 flex items-center justify-center overflow-hidden pointer-events-none`, spacer `h-[300vh]` after it. Inside sticky: `video - holder` absolute inset-0 (scale 0.2 → 1), inner `Video` wrapper (scale 1.8 → 1, `brightness(.6)`), two words "Show"/"Case" (`text-display`, z-2) side by side that translate from x −1200 / +1200 → 0. GSAP: `gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 } })` with all four tweens at position 0, `ease: 'none'`. Respect reduced motion (skip tweens, show final state). Use `gsap.context` + cleanup, call `ScrollTrigger.refresh()` after fonts load.

### Task 9: WorksGrid + WorkCard + LiquidImage (`Section - Works`)
Facts: heading row (`px-5`, flex, `gap-[30px]`): `SectionTag` + `Rich` h2 (`text-h2`, `left` appear) and right-aligned `Rich text-mono` (`right` appear). Cards on the 4-col grid with explicit placement (desktop): Sienna `col-start-2 col-span-2`, then Glidex `col-start-1 col-span-1` + Veon `col-start-3 col-span-2` on the same row, Zayla `col-start-1 col-span-2`, Destello `col-start-2 col-span-2`; phone/tablet: single column stack (see `pw_home_phone_02.png`). WorkCard (`Works - Card`, 580×450 desktop ratio): `Corners 4` + rules, `p-5` image area (`LiquidImage cover/hover`), bottom row split in two cells (`border-t border-rule`): title `text-h4` left cell, services list right cell `text-mono text-right` (one per line). Whole card links to `/works/{slug}`; appear `up`. Closing row: grid — col 1–2 `Rich` sentence (`text-lead`), col 4 `ArrowButton bar to="/works"` "Explore all works" with top/bottom rules.
LiquidImage (three.js, `src/components/anim/LiquidImage.tsx`): props `{ base: Img; hover: Img; className }`. Renders `<img base>` (always, for SEO/no-WebGL) and a `<canvas>` overlay. On mount (desktop pointer devices only: `matchMedia('(hover:hover)')`), create `WebGLRenderer({alpha:true, antialias:false})`, `OrthographicCamera(-1,1,1,-1,0,1)`, a 2×2 `PlaneGeometry` with `ShaderMaterial`:
```glsl
// vertex
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
// fragment
precision highp float; varying vec2 vUv;
uniform sampler2D uBase, uHover; uniform vec2 uRes, uBaseSize, uHoverSize, uMouse; uniform float uTime, uProgress, uRadius;
vec2 cover(vec2 uv, vec2 res, vec2 tex){ float r = res.x/res.y, t = tex.x/tex.y; vec2 s = r < t ? vec2(r/t, 1.0) : vec2(1.0, t/r); return (uv - 0.5) * s + 0.5; }
// simplex noise (Ashima 2D) → float snoise(vec2 v)
void main(){
  vec2 px = vUv * uRes; vec2 m = uMouse * uRes;
  float n = snoise(vUv * 6.0 + uTime * 0.6) * 0.5;      // "texture" 0.5, "speed" ~ time*0.6
  float d = distance(px, m) / uRadius + n * 0.5;          // "boost" 0.5
  float mask = smoothstep(1.0, 0.6, d) * uProgress;      // "interaction" softness 0.5
  vec2 disp = (vec2(snoise(vUv*4.0+uTime*0.4), snoise(vUv*4.0-uTime*0.4))) * 0.02 * mask;
  vec4 b = texture2D(uBase, cover(vUv, uRes, uBaseSize));
  vec4 h = texture2D(uHover, cover(vUv + disp, uRes, uHoverSize));
  gl_FragColor = mix(b, h, mask);
}
```
Uniforms: `uRadius = 100 * devicePixelRatio`, `uMouse` eased toward the pointer each frame (`lerp 0.12`), `uProgress` eased to 1 on `pointerenter`, 0 on `pointerleave`; `uTime += dt`. Render loop only while hovered or progress > 0.01 (otherwise idle). `ResizeObserver` sets `uRes` + renderer size. Dispose on unmount. Textures: `TextureLoader` with `colorSpace = SRGBColorSpace`, `minFilter = LinearFilter`. Also scale the whole image box `hover:scale-[1.05]` transition 0.5 s. Fallback (touch): plain `<img>` + CSS `active:` cross-fade to hover image.

### Task 10: Services (`Section - Services`, light)
Facts: `Section theme="light"` with `py-[150px]` and its own `<GridLines/>`; container `gap-[70px]`: heading row (tag + `Rich` h2 `text-h2` black with muted gray-500; right `Rich text-mono`), two image boxes on the grid (`col-span-2` each, `Corners 4`, `p-5`, images `services-1.png` (portrait crop → fixed height, `object-cover`) and `services-2.png`), then 4 rows each a 4-col grid with top rule (last with bottom rule): col 1 `n` (`text-mono`, `p-5`), col 2 title (`text-h5`) + text (`text-mono text-gray-500`, `max-w-[300px]`), col 3 `Chip`s (`flex flex-wrap gap-2.5`, chips `border-black/15`), col 4 thumbnail (`p-5`, 4:3 `object-cover`). Row hover: nothing beyond cursor. Phone: rows stack (n, title/text, chips, image). Reference `pw_home_03.png` (960–2000) + `pw_home_04.png` (0–560).

### Task 11: Testimonials (`Section - Testimonial`)
Facts: heading centred (`SectionTag` centred + `Rich` h2 `text-h2 text-center`); 4-col grid: slider card `col-start-2 col-span-2` (`Corners 4`, rules, `p-10`, `h-[500px]` desktop, `flex-col justify-between items-center text-center`): quote `text-lead max-w-[450px]`, then `Profile`-like column (avatar 40 px round, name `text-mono`, role `text-mono text-white/60`) and `Dots active={index+1}`; below, a 2-cell row (`Prev` / `Next` `text-nav` centred, each `py-5`, split by the middle rule, hover = label slides up like `ArrowButton`). State: `index` 0–3, wraps; `AnimatePresence mode="wait"` fade/slide (`y: 20 → 0`, 0.4 s) on the quote + author block. Reference `pw_home_04.png` (560–1180).

### Task 12: Clients (`Section - Clients`)
Facts: heading row (tag + `Rich` h2, right text). Grid: col 1 = sentence `Rich text-lead`, `Profile`, and `ArrowButton` "Book a call" (href calendly, rules, no bar); col 3–4 = list of 8 rows, each a link (`target=_blank`, href `#`) `flex justify-between items-baseline py-2.5`: name `text-h4-regular text-gray-500 group-hover:text-white`, year `text-mono text-gray-500 group-hover:text-white`. Hovering a row reveals that client's image in col 2 (`ix_client_hover.png`): an absolutely positioned box in col 2 (aspect 3:4, `object-cover`) that fades/scales in (`motion`, opacity 0 → 1, scale .95 → 1, 0.3 s) showing `items[hovered].image`; hidden when nothing is hovered. Phone: list only (no hover image). Reference `pw_home_04.png` (1180–2000).

### Task 13: Approach + Awards (`Section - Approach` light, `Section - Awards`)
Approach: `Section theme="light" py-[150px]` + `GridLines`; heading row; grid: col 1–2 image box (`Corners 4`, `p-5`, `approach.png` 4:3), col 3–4 = 2×2 cells each `p-5 min-h-[200px] flex-col justify-between` with rules: top row `n` (`text-mono`) + `Dots`, bottom `title` (`text-h5`) + text (`text-mono text-gray-500`). Reference `pw_home_05.png` (0–680).
Awards: grid: col 1–2 left column (tag, `Rich` h2, `Rich` sentence `text-lead`), col 3–4 = 4 rows (`border-t`, last `border-b`), each `flex justify-between p-5`: left `n` `text-mono` + name `text-lead`, right `text-mono text-gray-500 text-right max-w-[300px]`. Reference `pw_home_05.png` (680–1090) and `ix_award_hover.png`.

### Task 14: BlogsPreview + BlogCard (`Section - Blogs`)
Facts: heading grid: col 1–2 tag + `Rich` h2; col 4 `ArrowButton bar to="/blogs"` "Read more blogs" (rules). Cards grid: col 1 = profile card (`bg-gray-900`, `p-5`, `flex-col justify-between min-h-[300px]`: `Profile` + `Rich text-mono`), col 3 = BlogCard #1; next row col 2 = BlogCard #2, col 4 = BlogCard #3 (see `pw_home_05.png` 1200–2000). BlogCard (`Blogs - Card`): link to `/blogs/{slug}`, `Corners 4` + rules, `p-5 flex-col justify-between min-h-[300px]`: top row category `text-mono` + date `text-mono text-gray-500` left, arrow circle right (40 px, `border border-rule rounded-full`, `ArrowIcon` diagonal 12 px; hover → bg white + black arrow); bottom title `text-lead`. Card hover → `bg-gray-900` (`ix_blog_hover.png`).

### Task 15: Faq (`Section - FAQ`)
Facts: centred heading; grid: items `col-start-2 col-span-2`, each row `border-b border-rule` (first also `border-t`), button `flex w-full justify-between items-center gap-5 px-5 py-[22px] text-left`: question `text-body` (open → `text-gray-500`), `PlusIcon` 12 px rotates 45° when open (`ix_faq_open.png`); answer `text-mono text-gray-500 px-5 pb-6 max-w-[600px]` animated with motion `height: 0 → auto` (0.4 s, ease `[.22,1,.36,1]`), one open at a time. Footer row grid: col 1 `Rich` h4 (`text-h4`), col 3 `ArrowButton bar to="/#contact"` "Send me a message" (rules), col 4 `Rich text-mono text-right`.

### Task 16: Contact (`Section - Contact`, id `contact`)
Facts: container `gap-[70px]`: heading (`px-5`, tag + `Rich` h2 `max-w-[500px]`); grid: col 1 `contact details` (rules): block 1 `p-[30px_20px] gap-5` (`Profile`, `Rich` `text-lead max-w-[300px]`), block 2 (`border-t`) `p-[30px_20px] gap-5`: "Lets' Connect" `text-mono text-gray-500`, email + phone as `text-mono-bold` links (`mailto:`/`tel:`), `Corners 4` on the whole column; col 3–4 = `<form>` (`col-span-2 flex-col gap-5`): each field = `label` column: label row `px-5` `text-mono` uppercase + input row (`border-y border-rule px-5 py-[22px]`, `text-body`-sized Host Grotesk regular, placeholder `text-gray-500`); EMAIL | PHONE share one row (two cells split by the middle rule); MESSAGE textarea `min-h-[180px]`; submit row = 2-col grid: note `Rich text-mono` (col 1, bottom-left, `max-w-[180px]`), `ArrowButton bar type="submit"` "Send Request" (col 2, rules). Honeypot input `name="website"` hidden. Behaviour: HTML5 `required` + email pattern; state `idle|pending|success|error`; on submit: if `import.meta.env.VITE_FORM_ENDPOINT` → `fetch(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(fields)})`, else `await new Promise(r => setTimeout(r, 800))`; label becomes `contact.sent` / `contact.error`; reset form on success. Test: submit with fields filled → button label becomes "Request sent" (use fake timers). Reference `pw_home_06.png` (830–1500).

---

## Phase 3 — Sub-pages (Tasks 17–18; parallel)

### Task 17: Works page + WorkDetail + NextWork
- `pages/Works.tsx`: `Seo`, `Section` with heading row (`SectionTag pages.works.tag`, `Rich` h2 `text-h2` with muted first line, right `text-mono`), cards on the 4-col grid with placement (from `reference/shots/home_works.png` + `digest.py reference/works.html "Section - Works" 8 desktop`): Glidex `col-1`, Veon `col-3 span-2`, Sienna `col-2 span-2`, Zayla `col-1 span-2`, Destello `col-2 span-2`; phone single column. Reuse `WorkCard`.
- `pages/WorkDetail.tsx` (`reference/works_destello.html`, screenshot `home_works_destello.png`): 404 redirect if slug unknown (`<Navigate to="/404">` → NotFound); hero heading row: tag + `h1 text-h2` title left, `text-mono` description right; full-width image box (`Corners 4`, `p-5`, cover 16:9 `object-cover`); content grid (top rule): col 1 `SectionTag Overview`; col 3–4: overview paragraph (`text-lead`), then rows `Date: / Client: / Industry: / Services: / Live Project:` each `flex justify-between py-2.5 border-t border-rule` with label `text-mono text-gray-500` and value `text-mono text-right` (services one per line; live = link `text-mono underline-offset-4` opening in new tab, hidden when absent); gallery 2×2 (`col-2 span-2` … see digest: `img wrapper` with `img 1..4`, each `Corners 4` `p-5` 4:3); "Next Project" row: `SectionTag` col 1, `WorkCard` of the next work (array order, wrap) col 3–4, and `ArrowButton bar to="/works"` "Explore all works" under it. Appear presets as in home.
- `NextWork.tsx` = the next-project block (used by WorkDetail only).
- Tests: `/works` shows 5 titles; `/works/destello` shows "Maya L - Director at Destello" and "Sienna" (next); `/works/unknown` shows 404.

### Task 18: Blogs page + BlogDetail + NextBlogs
- `pages/Blogs.tsx` (`reference/blogs.html`, `home_blogs.png`): heading row (tag `Blogs`, `Rich` h2, right `text-mono`), 8 `BlogCard`s in a 4-col grid (2 rows; 2 cols tablet, 1 col phone).
- `pages/BlogDetail.tsx` (`reference/blogs_the-roadmap-behind-great-design.html`, screenshot `home_blogs_the-roadmap-behind-great-design.png`): header grid: col 1–2 `SectionTag category` + `h1 text-h2` (max 3 lines), col 4 date `text-mono text-gray-500 text-right` bottom-aligned; content grid (top rule): col 1 cover box (`Corners 4`, `p-5`, `object-cover` 3:4, sticky `top-5` on desktop); col 3–4 `intro` (`text-lead`) then each section: `h3 text-h3` + paragraphs (`text-body text-white/60`? — check digest: preset `12lrsqq`/`1uto14k` and colour), `gap-[30px]`; "Next Blogs" row: `SectionTag`, two `BlogCard`s for the next two posts (array order, wrap), `ArrowButton bar to="/blogs"` "Explore all blogs".
- Tests: `/blogs` shows 8 titles; `/blogs/the-roadmap-behind-great-design` shows "Start With Understanding".

---

## Phase 4 — QA and hand-off

### Task 19: Visual QA loop, README, final verification
- [ ] `scripts/compare.py`: `python3 scripts/compare.py qa/home-1440.png reference/shots/pw_home.png qa/cmp-home-1440.png` → side-by-side composite (PIL), scaled to equal width; run for home / works / destello / blogs / blog detail at 1440 and 390 (original phone shots exist only for home; for other pages compare desktop only and use judgement for phone). Fix every visible delta (spacing, sizes, colours, missing rules/corners).
- [ ] Interaction check with `reference/interact.mjs` adapted to localhost: nav hover, card hover (liquid), testimonial next, FAQ open, mobile menu, client hover.
- [ ] `README.md`: stack, `npm run dev|build|test|shot`, where content lives (`src/content`), how to swap images (drop into `public/images`, update `src/content`), `VITE_FORM_ENDPOINT`, deploy notes (any static host; SPA fallback to `index.html` required).
- [ ] Final: `npm run build`, `npm test`, `npm run lint`; commit `chore: qa fixes and readme`.

---

## Phase 5 — CMS migration (Next.js + Payload 3) — revision 2026-08-25 evening

Decisions: one Next.js App Router app with the Payload admin, SQLite, CMS scope = Posts + Works + Media + Messages + Site global (see spec §12). Vite, react-router and the `src/pages` shells are gone; everything below the page level (primitives, sections, animations, content files) carried over.

### Task 20: Migrate the app shell to Next.js + Payload — DONE
- `package.json` scripts: `dev` (next dev :3000), `build`, `start`, `payload`, `generate:types`, `generate:importmap`, `seed`, `typecheck`, `test`, `shot`, `compare`.
- Config: `next.config.ts` (`withPayload`), `postcss.config.mjs` (`@tailwindcss/postcss`), `tsconfig.json` (Next plugin, `@/*` + `@payload-config` paths), `vitest.config.mts` (jsdom + `vite-tsconfig-paths`), `src/test/setup.ts` mocks `next/navigation`.
- Payload: `src/payload.config.ts`, `src/cms/access.ts`, `src/cms/collections/{Works,Posts,Media,Messages,Users}.ts`, `src/cms/globals/Site.ts`; generated `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js`.
- Frontend: `src/app/(frontend)/layout.tsx` (fonts, metadata from the Site global, `Shell`), pages for `/`, `/works`, `/works/[slug]`, `/blogs`, `/blogs/[slug]`, `not-found`; `src/app/api/contact/route.ts`.
- Adapters: `src/lib/cms.ts` (getSite/getWorks/getWork/getNextWork/getPosts/getPost/getNextPosts/getHomePosts with static fallback), `src/lib/lexical.ts`, `src/lib/form.ts`.
- Components: `react-router` → `next/link` / `usePathname`; `'use client'` on interactive files; `Shell` + `SiteProvider`/`useSite()` replace `Layout`/`Seo`; `WorksGrid`/`BlogsPreview` take CMS data as props; new `WorksIndex`, `WorkDetail`, `BlogsIndex`, `BlogDetail`, `BlogCard`, `NotFoundView`.
- Seed: `scripts/seed.ts` (`npm run seed`).

### Task 21: Remaining home sections (inline)
Finish Task 7 (Metrics), then Tasks 10–16 exactly as specified above; `BlogsPreview` receives `posts: Blog[]` from the page (three home posts) and `Contact` submits through `src/lib/form.ts`.

### Task 22: Works/blogs page polish (Tasks 17–18 against the CMS)
`WorksIndex`, `WorkDetail`, `BlogsIndex`, `BlogDetail` exist; compare them with `reference/shots/home_works.png`, `home_works_destello.png`, `home_blogs.png`, `home_blogs_the-roadmap-behind-great-design.png` and the digests, and fix deltas (card placement, meta rows, gallery, sticky cover).

### Task 23: QA against the original (Task 19, adjusted)
`npm run build && npm start` (port 3000) then `node scripts/compare.mjs http://localhost:3000`; fix deltas; verify the admin flow (create first user at `/admin`, edit a work, see it on `/works`), the contact form → Messages, and `npm run seed` idempotency. README already documents the CMS; add a Dockerfile if a container deploy is wanted.
