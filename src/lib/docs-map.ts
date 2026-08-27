import type { Blog, Work } from '@/content/types'
import type { Post as PostDoc, Work as WorkDoc } from '@/payload-types'
import { lexicalToBlocks } from './lexical'
import { img, placeholder } from './site-map'

/** "2026-01-31" → "January 31, 2026", the format the cards and detail pages show. */
const formatDate = (iso: string | null | undefined, fallback = ''): string =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : fallback

/** Maps a `works` document onto the shape the case-study components consume. */
export function mapWork(d: WorkDoc): Work {
  const title = d.title
  const gallery = (d.gallery ?? []).map((g) => img(g.image, placeholder(title)))
  const cover = img(d.cover, placeholder(title))
  return {
    slug: d.slug,
    title,
    services: (d.services ?? []).map((s) => s.label),
    cover,
    hoverCover: img(d.hoverCover, gallery[0] ?? cover),
    description: d.description ?? '',
    overview: d.overview ?? '',
    date: formatDate(d.date),
    client: d.client ?? '',
    industry: d.industry ?? '',
    liveUrl: d.liveUrl || undefined,
    gallery,
  }
}

/** Maps a `posts` document onto the shape the blog components consume. */
export function mapPost(d: PostDoc): Blog {
  return {
    slug: d.slug,
    title: d.title,
    category: d.category,
    date: formatDate(d.date),
    cover: img(d.cover, placeholder(d.title)),
    body: lexicalToBlocks(d.body),
  }
}
