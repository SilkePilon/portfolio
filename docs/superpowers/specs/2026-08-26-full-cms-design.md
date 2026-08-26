# Everything editable in Payload + live preview — design

Date: 2026-08-26. Builds on `2026-08-25-eliankent-clone-design.md` §12.

## Goal

Every piece of copy and every image on the site is editable in `/admin`, the admin is tidy and self-explanatory, and every editable document shows a **live preview** of the real site that updates while typing. Save = live (no drafts). The static files in `src/content/` stay as fallbacks and as the seed source.

Decisions (user): grey/white headings use `**markers**` in plain text fields; live-preview pane (not just a button); no drafts; lists are **separate collections** (Services, Testimonials, Clients, Awards, FAQ).

## Admin information architecture

Sidebar groups, in order:

| group | items | type |
| --- | --- | --- |
| **Pages** | Home page · Other pages · Site settings | globals |
| **Content** | Works · Blog posts · Media | collections |
| **Home lists** | Services · Testimonials · Clients · Awards · FAQ | collections, `orderable: true` (drag to reorder), `useAsTitle` |
| **Inbox** | Messages | collection |
| **Admin** | Users | collection |

Admin meta: title suffix ` · <site name>` replaced by a neutral ` · Portfolio CMS` (name is user data). Every field gets a `label`/`description` in plain English that names where it shows on the page. Collections with ordering drop the numeric `order` field in favour of Payload's `orderable` (Works, Posts too — the "order" concept becomes drag-and-drop in the list view; Posts keep `featured`).

### Home page global (`home`) — one tab per section

| tab | fields |
| --- | --- |
| Hero | `intro` (marked text) · `bio` array {label, value} |
| About | `tag`, `paragraphs` array {text}, `image1`, `caption` (marked), `image2`, `resultTag`, `resultHeading` (marked) · `metrics` array {end, suffix, label, text} (dots = index+1) |
| Showcase | `reelWord1`, `reelWord2`, `video` upload (mp4) |
| Works | `tag`, `heading`, `text`, `outro` (marked), `cta` |
| Services | `tag`, `heading` (marked), `text`, `image1`, `image2` (rows live in the Services collection) |
| Testimonials | `tag`, `heading` (marked), `prev`, `next` |
| Clients | `tag`, `heading`, `text`, `sentence` (marked), `cta` |
| Approach | `tag`, `heading` (marked), `text`, `image`, `steps` array {title, text} (dots = index+1) |
| Awards | `tag`, `heading`, `sentence` (marked) |
| Blogs | `tag`, `heading`, `profileText` (marked), `cta` |
| FAQ | `tag`, `heading`, `outroHeading` (marked), `outroText`, `outroCta` |
| Contact | `tag`, `heading`, `sentence`, `replyNote` (marked), `connectLabel`, `fields` array {name, placeholder, type select}, `submit`, `submitting`, `sent`, `failed` |

Section tags like `Services(04)` are stored verbatim — the count is part of the text the editor types (matches the template; no magic).

### Other pages global (`pages`)

Tabs: **404** (heading, text, cta) · **Works page** (tag, heading marked, text) · **Blogs page** (tag, heading marked, text) · **Labels** (work detail labels: overview/date/client/industry/services/live/next/cta; blog: next/cta).

### Site settings global (`site`) — unchanged fields, regrouped

Tabs: Brand · Home hero · Navigation · Contact & socials · Footer (footer tagline becomes one marked-text field `tagline` instead of muted/strong pair — mapper keeps backward compat by reading both).

### Home-list collections

| slug | fields | title |
| --- | --- | --- |
| `services` | title, text, tags array {label}, image | title |
| `testimonials` | quote, name, role, avatar | name |
| `clients` | name, year, image, href | name |
| `awards` | name, text | name |
| `faqs` | question, answer | question |

All: `orderable: true`, `defaultSort: '_order'`, public read, authenticated write, `admin.group: 'Home lists'`, `defaultColumns` sensible.

## Marked text (`Rich` ⇄ string)

`src/lib/marked.ts`:

- `parseMarked(s: string): Rich` — `**x**` → `{text:'x'}` (white); other text → `{text, muted:true}`; `\n` → `{br:true}`. Unbalanced `**` is literal.
- `toMarked(r: Rich): string` — inverse (used by the seed and tests; round-trips every heading in `src/content/*.ts`).

Field helper `markedText(name, label, opts)` in `src/cms/fields.ts` returns a `textarea` field with description "Wrap the white part in **double asterisks**; new line = line break." Reused everywhere.

## Data flow

```
Payload docs ──(src/lib/home-map.ts, pages-map.ts, site-map.ts, list-map.ts: pure, client-safe)──▶ content shapes (typeof home, typeof pages, SiteContent, Service[]…)
        ▲                                                                                              │
        │ server: src/lib/cms.ts getHome()/getPages()/getLists()/getSite() with `safely()` fallback     ▼
        │                                                                          <ContentProvider value={...}> (client context)
        └── live preview: window message ──▶ mergeData (populates uploads) ──▶ same mapper ──▶ patch context
```

- New client context `ContentProvider` (extends `SiteProvider`) exposes `useSite()`, `useHome()`, `usePages()`, `useLists()` (services, testimonials, clients, awards, faqs). All home/page components read from these hooks instead of importing `@/content/home`. Server pages fetch everything once (`getContent()` → one object) and pass it to `Shell`.
- Works/posts already flow as props; they join the same context (`useWorks()`, `usePosts()`) so previews can patch them.

### Live preview

- `payload.config.ts`: `admin.livePreview = { breakpoints: [Mobile 390×844, Tablet 810×1080, Desktop 1440×900], collections: [...], globals: [...] }`; per-document `url`: home/lists → `/`, pages → `/works` (404 tab previews `/this-page-does-not-exist`), site → `/`, works → `/works/<slug>`, posts → `/blogs/<slug>`. `openByDefault: true`. URL base = `SITE_URL` (server) so it works in Docker.
- Frontend `src/components/layout/LivePreviewBridge.tsx` (client, mounted once in Shell): listens for `payload-live-preview` messages (origin must equal `window.location.origin`), calls `mergeData` from `@payloadcms/live-preview` to get the populated doc, maps it with the matching mapper, and patches the provider state: globals replace `home/pages/site`; collection docs replace-by-id (or insert) in the matching list and re-sort by `_order`. Calls `ready()` on mount. No-op outside an iframe.
- Sections must react to prop changes: components that snapshot content into refs/GSAP at mount (TextReveal, Counter, ShowcaseReel) re-run on text change (key on the text).

## Seed

`scripts/seed.ts` extends: home global, pages global, five list collections (from `src/content/home.ts` via `toMarked`), video upload. Idempotent: globals seeded only when `updatedAt` missing; list docs matched by title/name/question.

## Migration

One new migration `20260826_*_full_cms` (generated). Existing `order` number fields on works/posts are dropped; the seed and README explain drag ordering.

## Testing

- `marked.test.ts`: parse/serialise round-trip for every `Rich` in `home.ts`/`pages`/`site.ts`.
- `home-map.test.ts` / `list-map.test.ts`: mapping with empty docs → static fallback; populated doc → values.
- `live-preview.test.tsx`: bridge patches context from a synthetic message (mock `mergeData`).
- Existing section tests keep passing via `ContentProvider` default = static content.
- Manual: admin walk-through (each document opens with preview pane, typing updates), `npm run seed` on fresh DB, Docker image start (migration applied).

## Out of scope

Drafts/versions, localisation, custom admin theme/logo beyond the title, per-section counts computed automatically.
