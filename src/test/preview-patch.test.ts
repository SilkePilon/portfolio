import { staticContent } from '@/components/layout/ContentProvider'
import { home } from '@/content/home'
import { applyPreview } from '@/lib/preview-patch'

test('a global message re-maps the global onto the content', () => {
  const next = applyPreview(staticContent, { globalSlug: 'home', doc: { updatedAt: 'x', faq: { tag: 'NEW' } } })
  expect(next.home.faq.tag).toBe('NEW')
  // Untouched fields keep the static copy, and the other slices are the very same objects.
  expect(next.home.faq.outroText).toBe(home.faq.outroText)
  expect(next.site).toBe(staticContent.site)
  expect(staticContent.home.faq.tag).toBe(home.faq.tag)
})

test('an unsaved global (no updatedAt) still maps instead of being dropped', () => {
  expect(applyPreview(staticContent, { globalSlug: 'pages', doc: { works: { tag: '(preview)' } } }).pages.works.tag).toBe('(preview)')
})

test('a collection message upserts by id: the same id twice replaces the row', () => {
  const empty = { ...staticContent, lists: { ...staticContent.lists, faqs: [] } }
  const first = applyPreview(empty, { collectionSlug: 'faqs', doc: { id: 1, question: 'Q1', answer: 'A', _order: 'a0' } })
  expect(first.lists.faqs).toEqual([{ q: 'Q1', a: 'A' }])

  const second = applyPreview(first, { collectionSlug: 'faqs', doc: { id: 1, question: 'Q1', answer: 'A2', _order: 'a0' } })
  expect(second.lists.faqs).toEqual([{ q: 'Q1', a: 'A2' }])

  // Renaming the question still replaces the same row — the id is remembered across messages.
  const renamed = applyPreview(second, { collectionSlug: 'faqs', doc: { id: 1, question: 'Q1 renamed', answer: 'A2', _order: 'a0' } })
  expect(renamed.lists.faqs).toEqual([{ q: 'Q1 renamed', a: 'A2' }])

  // A different id appends a second row.
  const two = applyPreview(renamed, { collectionSlug: 'faqs', doc: { id: 2, question: 'Q2', answer: 'B', _order: 'a1' } })
  expect(two.lists.faqs.map((f) => f.q)).toEqual(['Q1 renamed', 'Q2'])
})

test('re-running the same patch on the same content is idempotent (React replays state updaters)', () => {
  const empty = { ...staticContent, lists: { ...staticContent.lists, faqs: [] } }
  const seeded = applyPreview(empty, { collectionSlug: 'faqs', doc: { id: 7, question: 'Seeded?', answer: 'A' } })
  const rename = { collectionSlug: 'faqs', doc: { id: 7, question: 'Renamed?', answer: 'A' } }

  expect(applyPreview(seeded, rename).lists.faqs).toEqual([{ q: 'Renamed?', a: 'A' }])
  // StrictMode runs the updater a second time against the very same base content.
  expect(applyPreview(seeded, rename).lists.faqs).toEqual([{ q: 'Renamed?', a: 'A' }])
})

test('a works doc is upserted in place and keeps its slug', () => {
  const first = staticContent.works[0]
  const next = applyPreview(staticContent, {
    collectionSlug: 'works',
    doc: { id: 10, title: 'Edited title', slug: first.slug, services: [{ label: 'Design' }] },
  })
  expect(next.works).toHaveLength(staticContent.works.length)
  expect(next.works[0].slug).toBe(first.slug)
  expect(next.works[0].title).toBe('Edited title')
  expect(next.works[0].services).toEqual(['Design'])
  expect(next.works[1]).toBe(staticContent.works[1])
})

test('a post already on the home page is patched there too', () => {
  const shown = staticContent.homePosts[0]
  const next = applyPreview(staticContent, {
    collectionSlug: 'posts',
    doc: { id: 20, title: 'Edited post', slug: shown.slug, category: 'Design', date: '2025-01-02T00:00:00.000Z', body: null },
  })
  expect(next.homePosts[0].title).toBe('Edited post')
  expect(next.posts.find((p) => p.slug === shown.slug)?.title).toBe('Edited post')
})

test('an unknown slug leaves the content untouched', () => {
  expect(applyPreview(staticContent, { collectionSlug: 'messages', doc: { id: 1 } })).toBe(staticContent)
  expect(applyPreview(staticContent, { doc: { id: 1 } })).toBe(staticContent)
})
