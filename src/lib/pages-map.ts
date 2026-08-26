import { pages as staticPages } from '@/content/home'
import { parseMarked } from '@/lib/marked'
import type { Page as PagesDoc } from '@/payload-types'
import type { PagesContent } from './content'

/**
 * Maps the `pages` global (404 / works / blogs / label copy) onto the static content
 * shape. Returns null when the global was never saved in the admin (Payload then serves
 * field defaults without timestamps), so the static content stays in place.
 */
export function mapPages(d: PagesDoc): PagesContent | null {
  if (!d.updatedAt) return null
  return {
    notFound: {
      heading: d.notFound?.heading ?? staticPages.notFound.heading,
      text: d.notFound?.text ?? staticPages.notFound.text,
      cta: d.notFound?.cta ?? staticPages.notFound.cta,
    },
    works: {
      tag: d.works?.tag ?? staticPages.works.tag,
      heading: d.works?.heading ? parseMarked(d.works.heading) : staticPages.works.heading,
      text: d.works?.text ?? staticPages.works.text,
    },
    blogs: {
      tag: d.blogs?.tag ?? staticPages.blogs.tag,
      heading: d.blogs?.heading ? parseMarked(d.blogs.heading) : staticPages.blogs.heading,
      text: d.blogs?.text ?? staticPages.blogs.text,
    },
    workLabels: {
      overview: d.workLabels?.overview ?? staticPages.workLabels.overview,
      date: d.workLabels?.date ?? staticPages.workLabels.date,
      client: d.workLabels?.client ?? staticPages.workLabels.client,
      industry: d.workLabels?.industry ?? staticPages.workLabels.industry,
      services: d.workLabels?.services ?? staticPages.workLabels.services,
      live: d.workLabels?.live ?? staticPages.workLabels.live,
      next: d.workLabels?.next ?? staticPages.workLabels.next,
      cta: d.workLabels?.cta ?? staticPages.workLabels.cta,
    },
    blogLabels: {
      next: d.blogLabels?.next ?? staticPages.blogLabels.next,
      cta: d.blogLabels?.cta ?? staticPages.blogLabels.cta,
    },
  }
}
