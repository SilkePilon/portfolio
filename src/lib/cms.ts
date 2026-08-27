import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Blog, Work } from '@/content/types'
import { works as staticWorks } from '@/content/works'
import { blogs as staticBlogs, homeBlogs as staticHomeBlogs } from '@/content/blogs'
import { site as staticSite } from '@/content/site'
import { home as staticHome, pages as staticPages } from '@/content/home'
import { mapSite, type SiteContent } from './site-map'
import { mapPost, mapWork } from './docs-map'
import { mapHome } from './home-map'
import { mapPages } from './pages-map'
import { mapAward, mapClient, mapFaq, mapService, mapTestimonial } from './lists-map'
import type { Content, HomeContent, Lists, PagesContent } from './content'

export type { SiteContent } from './site-map'
export type { Content, HomeContent, Lists, PagesContent } from './content'

const payload = () => getPayload({ config })

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

export function getHome(): Promise<HomeContent> {
  return safely('home', async () => mapHome(await (await payload()).findGlobal({ slug: 'home', depth: 1 })), staticHome)
}

export function getPages(): Promise<PagesContent> {
  return safely('pages', async () => mapPages(await (await payload()).findGlobal({ slug: 'pages', depth: 1 })), staticPages)
}

export async function getLists(): Promise<Lists> {
  const [services, testimonials, clients, awards, faqs] = await Promise.all([
    safely(
      'services',
      async () => {
        const r = await (await payload()).find({ collection: 'services', sort: '_order', limit: 100, depth: 1, pagination: false })
        return r.docs.length ? r.docs.map(mapService) : null
      },
      staticHome.services.rows,
    ),
    safely(
      'testimonials',
      async () => {
        const r = await (await payload()).find({ collection: 'testimonials', sort: '_order', limit: 100, depth: 1, pagination: false })
        return r.docs.length ? r.docs.map(mapTestimonial) : null
      },
      staticHome.testimonials.items,
    ),
    safely(
      'clients',
      async () => {
        const r = await (await payload()).find({ collection: 'clients', sort: '_order', limit: 100, depth: 1, pagination: false })
        return r.docs.length ? r.docs.map(mapClient) : null
      },
      staticHome.clients.list,
    ),
    safely(
      'awards',
      async () => {
        const r = await (await payload()).find({ collection: 'awards', sort: '_order', limit: 100, depth: 1, pagination: false })
        return r.docs.length ? r.docs.map(mapAward) : null
      },
      staticHome.awards.list,
    ),
    safely(
      'faqs',
      async () => {
        const r = await (await payload()).find({ collection: 'faqs', sort: '_order', limit: 100, depth: 1, pagination: false })
        return r.docs.length ? r.docs.map(mapFaq) : null
      },
      staticHome.faq.items,
    ),
  ])
  return { services, testimonials, clients, awards, faqs }
}

/**
 * Everything a page needs to render, fetched together with static fallbacks per field.
 * Cached per request so `generateMetadata` and `RootLayout` share a single round-trip.
 */
export const getContent = cache(async function getContent(): Promise<Content> {
  const [site, home, pages, lists, works, posts, homePosts] = await Promise.all([
    getSite(),
    getHome(),
    getPages(),
    getLists(),
    getWorks(),
    getPosts(),
    getHomePosts(),
  ])
  return { site, home, pages, lists, works, posts, homePosts }
})
