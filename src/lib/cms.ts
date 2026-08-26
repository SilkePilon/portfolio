import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Blog, Img, Work } from '@/content/types'
import { works as staticWorks } from '@/content/works'
import { blogs as staticBlogs, homeBlogs as staticHomeBlogs } from '@/content/blogs'
import { site as staticSite } from '@/content/site'
import type { Post as PostDoc, Work as WorkDoc } from '@/payload-types'
import { lexicalToBlocks } from './lexical'
import { img, mapSite, type SiteContent } from './site-map'

export type { SiteContent } from './site-map'

const payload = () => getPayload({ config })

const placeholder = (alt: string): Img => ({ src: '/images/og.png', alt, width: 1200, height: 630 })

export const formatDate = (iso: string | null | undefined, fallback = ''): string =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : fallback

function mapWork(d: WorkDoc): Work {
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

function mapPost(d: PostDoc): Blog {
  return {
    slug: d.slug,
    title: d.title,
    category: d.category,
    date: formatDate(d.date),
    cover: img(d.cover, placeholder(d.title)),
    body: lexicalToBlocks(d.body),
  }
}

async function safely<T>(label: string, fn: () => Promise<T | null>, fallback: T): Promise<T> {
  try {
    const v = await fn()
    if (v !== null) return v
  } catch (e) {
    console.warn(`[cms] ${label}: falling back to static content —`, e instanceof Error ? e.message : e)
  }
  return fallback
}

export function getWorks(): Promise<Work[]> {
  return safely(
    'works',
    async () => {
      const r = await (await payload()).find({ collection: 'works', sort: '_order', limit: 100, depth: 1, pagination: false })
      return r.docs.length ? r.docs.map(mapWork) : null
    },
    staticWorks,
  )
}

export async function getWork(slug: string): Promise<Work | undefined> {
  return (await getWorks()).find((w) => w.slug === slug)
}

export async function getNextWork(slug: string): Promise<Work> {
  const all = await getWorks()
  return all[(all.findIndex((w) => w.slug === slug) + 1) % all.length]
}

export function getPosts(): Promise<Blog[]> {
  return safely(
    'posts',
    async () => {
      const r = await (await payload()).find({ collection: 'posts', sort: '_order', limit: 100, depth: 1, pagination: false })
      return r.docs.length ? r.docs.map(mapPost) : null
    },
    staticBlogs,
  )
}

export async function getPost(slug: string): Promise<Blog | undefined> {
  return (await getPosts()).find((b) => b.slug === slug)
}

export async function getNextPosts(slug: string, n = 2): Promise<Blog[]> {
  const all = await getPosts()
  const i = all.findIndex((b) => b.slug === slug)
  return Array.from({ length: Math.min(n, Math.max(all.length - 1, 0)) }, (_, k) => all[(i + 1 + k) % all.length])
}

/** The three posts on the home page: featured ones first, then the newest by order. */
export function getHomePosts(): Promise<Blog[]> {
  return safely(
    'home posts',
    async () => {
      const p = await payload()
      const featured = await p.find({ collection: 'posts', where: { featured: { equals: true } }, sort: '_order', limit: 3, depth: 1 })
      if (featured.docs.length >= 3) return featured.docs.map(mapPost)
      const all = await p.find({ collection: 'posts', sort: '_order', limit: 3, depth: 1 })
      return all.docs.length ? all.docs.map(mapPost) : null
    },
    staticHomeBlogs,
  )
}

export function getSite(): Promise<SiteContent> {
  return safely('site', async () => mapSite(await (await payload()).findGlobal({ slug: 'site', depth: 1 })), staticSite)
}
