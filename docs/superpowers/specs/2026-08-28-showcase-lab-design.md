# Showcase lab — scroll-animation alternatives to the reel video

## Goal
The home "Show / Case" section is a scroll-scrubbed video. Silke is a software developer and wants a
software-themed, scroll-driven animation instead. Before choosing, build a lab page with 10 candidates.

## Decisions (user)
- Each option is free-form: may change layout, words, scroll length.
- Lab lives in this app at `/lab/showcase` (real fonts, Lenis, theme). Deleted once an option is picked.
- Mix of flavours: code, terminal, graphs, 3D, particles, grids, glyphs.
- Code shown is real-looking TypeScript / React / Next snippets.

## Structure
- `src/app/(frontend)/lab/showcase/page.tsx` — `force-dynamic` like siblings, renders `<ShowcaseLab />`.
- `src/components/lab/showcase/ShowcaseLab.tsx` — intro header, fixed side nav (01–10, name, active state
  via IntersectionObserver), renders every option in order with a short caption between them.
- `src/components/lab/showcase/LabOption.tsx` — shared frame: `<section id>` with a sticky 100vh stage over a
  spacer (`heightVh` prop, default 300). Creates one GSAP ScrollTrigger (`scrub: true`) and calls
  `onProgress(p)` (0..1) via a ref so children never re-render per frame. Respects
  `prefers-reduced-motion` (reports progress 1 once). Refreshes on `document.fonts.ready`.
- `src/components/lab/showcase/options/*.tsx` — one file per option, each `export function OptionN()` that
  renders `<LabOption>` and drives its own DOM/canvas/three scene from progress.
  Only existing deps: gsap, motion, three, plain canvas/SVG. No new packages.

## Options
| # | id | idea | tech |
|---|----|------|------|
| 1 | editor | editor window scales up from 0.2, code types in line by line with cursor, syntax colours | DOM, string slicing |
| 2 | terminal | terminal streams `git push` → `next build` → deploy log, progress bar; words SHIP / IT slide in | DOM |
| 3 | gitgraph | SVG branch/merge graph strokes draw (stroke-dashoffset), commit dots pop, labels fade | SVG |
| 4 | mesh | three.js wireframe icosahedron rotates, explodes into points, reforms; words scale behind | three |
| 5 | network | canvas particle field links into graph, pulses travel along edges | canvas 2D |
| 6 | pipeline | Client → Edge → API → DB boxes; packets travel paths; latency counters tick | SVG + DOM |
| 7 | deck | browser / editor / terminal cards fan out with parallax + tilt then stack | DOM, motion |
| 8 | glyphs | monospace glyph grid; wave resolves random chars into SHOW / CASE | canvas 2D |
| 9 | iso | isometric blocks stack into an architecture diagram (web, api, queue, db) | SVG |
| 10 | layers | a page's layers (bg, grid, cards, text) separate in 3D z-space then flatten to a page | DOM 3D transforms |

Each option keeps the template look: black `#0e0e0e`, grey `#999`, white, Host Grotesk display words,
IBM Plex Mono for code, thin `rgba(255,255,255,.15)` rules, `--ease-framer` where eased.

## Testing / QA
- Vitest: `LabOption` renders children and skips ScrollTrigger in test mode; `ShowcaseLab` renders 10 sections.
- `npm run typecheck`, `npm test`.
- Screenshots: `scripts/shot.mjs /lab/showcase lab` at 1440 and 390 for a visual pass.

## Out of scope
Wiring the chosen option into the home page / CMS — separate task after Silke picks.

## Outcome (2026-08-28)

Option **10 — Exploded UI** was chosen and promoted to the real home-page showcase section; the lab is deleted.

- `src/components/lab/showcase/LabOption.tsx` → `src/components/anim/ScrollStage.tsx` (`LabOption` → `ScrollStage`,
  `data-lab-option` dropped; `seg` / `lerp` / `easeOut` / `easeInOut` still exported from there).
- `src/components/lab/showcase/options/Option10Layers.tsx` → `src/components/home/Showcase.tsx`
  (`export function Showcase`, section id `showcase`, `heightVh` 250, wrapper `z-[2] overflow-clip` to match
  the reel it replaced); its dashboard → `src/components/home/showcase/{Dashboard,state,ui,code,layers}`,
  with the `lab-` CSS prefix renamed to `sc-`.
- CMS: the Showcase tab lost `reelWord1` / `reelWord2` / `video` and now holds a single `appName` text field
  (default `Ledger`), read by the section for the demo app's sidebar brand. Migration
  `src/migrations/20260828_191551_showcase_app.ts`.
- Deleted: `src/app/(frontend)/lab/`, `src/components/lab/`, `scripts/lab-shot.mjs`,
  `src/components/home/ShowcaseReel.tsx`, `src/components/ui/Video.tsx`, `public/videos/showcase.mp4`,
  `src/test/{reel,showcase-lab}.test.tsx`. Options 1–9 live on only in this document and in git history
  (last commit holding them: `fd0e8c5`).
