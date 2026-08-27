import type {
  Award as AwardDoc,
  Client as ClientDoc,
  Faq as FaqDoc,
  Home as HomeDoc,
  Page as PagesDoc,
  Post as PostDoc,
  Service as ServiceDoc,
  Site as SiteDoc,
  Testimonial as TestimonialDoc,
  Work as WorkDoc,
} from '@/payload-types'
import type { Content, Lists } from './content'
import { mapPost, mapWork } from './docs-map'
import { mapHome } from './home-map'
import { mapAward, mapClient, mapFaq, mapService, mapTestimonial } from './lists-map'
import { mapPages } from './pages-map'
import { mapSite } from './site-map'

export type PreviewMessage = { collectionSlug?: string; globalSlug?: string; doc: Record<string, any> }

/** Documents the admin has not saved yet arrive without timestamps; the mappers treat that as "never saved". */
const saved = <T>(doc: Record<string, any>): T => ({ updatedAt: 'preview', ...doc }) as T

/**
 * The mapped content types mirror the static content and carry no document id, so rows are matched by
 * their natural key — slug, title, name, question. This records the key each document id produced in a
 * list, so renaming that very field in the admin still replaces the right row instead of appending a
 * duplicate. It hangs off the list array rather than off the module, which keeps `applyPreview` pure:
 * React replays state updaters (StrictMode), and a replay must not see a key written by its first run.
 */
const rowKeys = new WeakMap<object, ReadonlyMap<string, string>>()
const noKeys: ReadonlyMap<string, string> = new Map()

/** The key this document produced in `rows` last time, falling back to the key it carries now. */
const previousKey = (rows: object, id: unknown, key: string): string => (rowKeys.get(rows) ?? noKeys).get(String(id)) ?? key

function remember(base: object, next: object, id: unknown, key: string): void {
  if (next !== base) rowKeys.set(next, new Map(rowKeys.get(base) ?? noKeys).set(String(id), key))
}

const replaceAt = <T>(rows: T[], i: number, row: T): T[] => rows.map((r, k) => (k === i ? row : r))

/** Index of the row this document produced last time, or -1 when it is new to the list. */
const rowIndex = <T>(rows: T[], row: T, id: unknown, keyOf: (r: T) => string): number => {
  const previous = previousKey(rows, id, keyOf(row))
  return rows.findIndex((r) => keyOf(r) === previous)
}

/**
 * Replaces the row this document produced last time, or appends when it is new. Only the edited
 * document carries an `_order`, so the server-rendered order of every other row is left alone and
 * new rows land at the end until the next server render sorts them.
 */
function upsert<T>(rows: T[], row: T, id: unknown, keyOf: (r: T) => string): T[] {
  const i = rowIndex(rows, row, id, keyOf)
  const next = i === -1 ? [...rows, row] : replaceAt(rows, i, row)
  remember(rows, next, id, keyOf(row))
  return next
}

/** Like `upsert`, but never grows the list — used for `homePosts`, whose membership is a server query. */
function replaceIfPresent<T>(rows: T[], row: T, id: unknown, keyOf: (r: T) => string): T[] {
  const i = rowIndex(rows, row, id, keyOf)
  if (i === -1) return rows
  const next = replaceAt(rows, i, row)
  remember(rows, next, id, keyOf(row))
  return next
}

function patchList<K extends keyof Lists>(
  content: Content,
  slug: K,
  row: Lists[K][number],
  keyOf: (r: Lists[K][number]) => string,
  id: unknown,
): Content {
  const rows = upsert(content.lists[slug] as Lists[K][number][], row, id, keyOf)
  return { ...content, lists: { ...content.lists, [slug]: rows } }
}

const bySlug = (r: { slug: string }) => r.slug

/**
 * Returns a new `Content` with the populated document applied: globals are re-mapped in full,
 * collection documents are upserted into their list. Unknown slugs return the content unchanged.
 */
export function applyPreview(content: Content, { collectionSlug, globalSlug, doc }: PreviewMessage): Content {
  if (globalSlug === 'home') {
    const home = mapHome(saved<HomeDoc>(doc))
    return home ? { ...content, home } : content
  }
  if (globalSlug === 'pages') {
    const pages = mapPages(saved<PagesDoc>(doc))
    return pages ? { ...content, pages } : content
  }
  if (globalSlug === 'site') {
    const site = mapSite(saved<SiteDoc>(doc))
    return site ? { ...content, site } : content
  }

  if (collectionSlug === 'works') {
    return { ...content, works: upsert(content.works, mapWork(doc as WorkDoc), doc.id, bySlug) }
  }
  if (collectionSlug === 'posts') {
    const post = mapPost(doc as PostDoc)
    return {
      ...content,
      posts: upsert(content.posts, post, doc.id, bySlug),
      // Which three posts the home page shows is decided by a server query (featured first, then by
      // order) that a preview message cannot re-run — so an edited post is patched where it already
      // shows and the selection itself waits for the next server render.
      homePosts: replaceIfPresent(content.homePosts, post, doc.id, bySlug),
    }
  }
  if (collectionSlug === 'services') return patchList(content, 'services', mapService(doc as ServiceDoc), (r) => r.title, doc.id)
  if (collectionSlug === 'testimonials') return patchList(content, 'testimonials', mapTestimonial(doc as TestimonialDoc), (r) => r.name, doc.id)
  if (collectionSlug === 'clients') return patchList(content, 'clients', mapClient(doc as ClientDoc), (r) => r.name, doc.id)
  if (collectionSlug === 'awards') return patchList(content, 'awards', mapAward(doc as AwardDoc), (r) => r.name, doc.id)
  if (collectionSlug === 'faqs') return patchList(content, 'faqs', mapFaq(doc as FaqDoc), (r) => r.q, doc.id)

  return content
}
