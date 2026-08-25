import 'server-only'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Blog, Img, Work } from '@/content/types'
import { works as staticWorks } from '@/content/works'
import { blogs as staticBlogs, homeBlogs as staticHomeBlogs } from '@/content/blogs'
import { site as staticSite } from '@/content/site'
import type { Media, Post as PostDoc, Site as SiteDoc, Work as WorkDoc } from '@/payload-types'
import { lexicalToBlocks } from './lexical'

/** Shape every layout component consumes (same as the static `site` content). */
export type SiteContent = typeof staticSite

const payload = () => getPayload({ config })

type MediaRef = Media | number | string | null | undefined

function img(m: MediaRef, fallback: Img): Img {
  if (m && typeof m === 'object' && m.url) {
    return { src: m.url, alt: m.alt || fallback.alt, width: m.width ?? fallback.width, height: m.height ?? fallback.height }
  }
  return fallback
}

const placeholder = (alt: string): Img => ({ src: '/images/og.png', alt, width: 1200, height: 630 })

export const formatDate = (iso: string | null | undefined, fallback = ''): string =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : fallback

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
      const r = await (await payload()).find({ collection: 'works', sort: 'order', limit: 100, depth: 1, pagination: false })
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
      const r = await (await payload()).find({ collection: 'posts', sort: 'order', limit: 100, depth: 1, pagination: false })
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
      const featured = await p.find({ collection: 'posts', where: { featured: { equals: true } }, sort: 'order', limit: 3, depth: 1 })
      if (featured.docs.length >= 3) return featured.docs.map(mapPost)
      const all = await p.find({ collection: 'posts', sort: 'order', limit: 3, depth: 1 })
      return all.docs.length ? all.docs.map(mapPost) : null
    },
    staticHomeBlogs,
  )
}

function mapSite(d: SiteDoc): SiteContent | null {
  if (!d.nav?.length) return null // never saved in the admin → keep the static content
  return {
    name: d.name,
    wordmark: [d.wordmarkLine1, d.wordmarkLine2] as unknown as SiteContent['wordmark'],
    description: d.description,
    nav: d.nav.map((l) => ({ label: l.label, to: l.to })),
    bookCall: { label: d.bookCall?.label ?? staticSite.bookCall.label, href: d.bookCall?.href ?? staticSite.bookCall.href },
    socials: (d.socials ?? []).map((s) => ({ label: s.label, href: s.href })),
    profile: {
      name: d.profile?.name ?? staticSite.profile.name,
      role: d.profile?.role ?? staticSite.profile.role,
      avatar: img(d.profile?.avatar, staticSite.profile.avatar),
    },
    contact: { email: d.contact?.email ?? staticSite.contact.email, phone: d.contact?.phone ?? staticSite.contact.phone },
    footer: {
      tagline: [{ text: d.taglineMuted ?? '', muted: true }, { text: d.taglineStrong ?? '' }],
      socialsTitle: d.socialsTitle ?? staticSite.footer.socialsTitle,
      socialsText: d.socialsText ?? staticSite.footer.socialsText,
      createdBy: {
        label: d.createdBy?.label ?? staticSite.footer.createdBy.label,
        name: d.createdBy?.name ?? staticSite.footer.createdBy.name,
        href: d.createdBy?.href ?? staticSite.footer.createdBy.href,
        avatar: img(d.createdBy?.avatar, staticSite.footer.createdBy.avatar),
      },
    },
    ogImage: img(d.ogImage, { src: '/images/og.png', alt: d.name, width: 1200, height: 630 }),
  }
}

export function getSite(): Promise<SiteContent> {
  return safely('site', async () => mapSite(await (await payload()).findGlobal({ slug: 'site', depth: 1 })), staticSite)
}
