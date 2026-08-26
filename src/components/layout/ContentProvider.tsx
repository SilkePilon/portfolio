'use client'
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { blogs as staticBlogs, homeBlogs as staticHomeBlogs } from '@/content/blogs'
import { home as staticHome, pages as staticPages } from '@/content/home'
import { site as staticSite } from '@/content/site'
import { works as staticWorks } from '@/content/works'
import type { Content, HomeContent, Lists, PagesContent } from '@/lib/content'
import type { SiteContent } from '@/lib/site-map'

export type { Content, HomeContent, Lists, PagesContent } from '@/lib/content'
export type { SiteContent } from '@/lib/site-map'

/** Static content, shaped exactly like the CMS payload — the fallback every consumer gets without a provider. */
export const staticContent: Content = {
  site: staticSite,
  home: staticHome,
  pages: staticPages,
  lists: {
    services: staticHome.services.rows,
    testimonials: staticHome.testimonials.items,
    clients: staticHome.clients.list,
    awards: staticHome.awards.list,
    faqs: staticHome.faq.items,
  },
  works: staticWorks,
  posts: staticBlogs,
  homePosts: staticHomeBlogs,
}

const ContentContext = createContext<Content>(staticContent)
const SetContentContext = createContext<Dispatch<SetStateAction<Content>>>(() => {})

/**
 * Makes the CMS content available to client components (`useContent()` and the per-slice hooks);
 * falls back to the static content when no provider is mounted (tests, isolated renders).
 * The state copy lets the live-preview bridge (`useSetContent`) swap content in without a server round-trip.
 */
export function ContentProvider({ value, children }: { value: Content; children: ReactNode }) {
  const [content, setContent] = useState<Content>(value)
  // Re-sync whenever the server sends fresh content (navigation, router refresh).
  useEffect(() => setContent(value), [value])
  return (
    <SetContentContext.Provider value={setContent}>
      <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
    </SetContentContext.Provider>
  )
}

export const useContent = (): Content => useContext(ContentContext)
export const useSite = (): SiteContent => useContext(ContentContext).site
export const useHome = (): HomeContent => useContext(ContentContext).home
export const usePages = (): PagesContent => useContext(ContentContext).pages
export const useLists = (): Lists => useContext(ContentContext).lists
export const useWorks = () => useContext(ContentContext).works
export const usePosts = () => useContext(ContentContext).posts
export const useHomePosts = () => useContext(ContentContext).homePosts

/** Used by the live-preview bridge (Task 5). */
export const useSetContent = (): Dispatch<SetStateAction<Content>> => useContext(SetContentContext)
