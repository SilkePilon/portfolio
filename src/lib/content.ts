import type { home, pages } from '@/content/home'
import type { SiteContent } from '@/lib/site-map'
import type { Award, Blog, Client, Faq, Service, Testimonial, Work } from '@/content/types'

/** Shape every home-page component consumes (same as the static `home` content). */
export type HomeContent = typeof home
/** Shape every other-page component consumes (same as the static `pages` content). */
export type PagesContent = typeof pages

/** The five home-page lists, each owned by its own collection. */
export type Lists = {
  services: Service[]
  testimonials: Testimonial[]
  clients: Client[]
  awards: Award[]
  faqs: Faq[]
}

/** Everything a page needs to render, combined from the CMS with static fallbacks. */
export type Content = {
  site: SiteContent
  home: HomeContent
  pages: PagesContent
  lists: Lists
  works: Work[]
  posts: Blog[]
  homePosts: Blog[]
}
