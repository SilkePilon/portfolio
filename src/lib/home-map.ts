import { home as staticHome } from '@/content/home'
import type { FormField } from '@/content/types'
import { parseMarked } from '@/lib/marked'
import type { Home as HomeDoc, Media } from '@/payload-types'
import type { HomeContent } from './content'
import { img } from './site-map'

/** `.url` of a populated media relation, or undefined when unpopulated / unset. */
function mediaUrl(m: number | Media | null | undefined): string | null | undefined {
  return m && typeof m === 'object' ? m.url : undefined
}

/**
 * Maps the `home` global onto the static content shape. Returns null when the global
 * was never saved in the admin (Payload then serves field defaults without timestamps),
 * so the static content stays in place.
 *
 * List fields (service rows, testimonial/client/award cards, FAQ items) are owned by
 * their own collections, not this global — see lists-map.ts / getLists — so they always
 * keep the static shape here; callers combine them separately.
 */
export function mapHome(d: HomeDoc): HomeContent | null {
  if (!d.updatedAt) return null
  return {
    hero: {
      intro: d.hero?.intro ? parseMarked(d.hero.intro) : staticHome.hero.intro,
    },
    bio: d.hero?.bio?.length ? d.hero.bio.map((b) => ({ label: b.label, value: b.value })) : staticHome.bio,
    about: {
      tag: d.about?.tag ?? staticHome.about.tag,
      paragraphs: d.about?.paragraphs?.length ? d.about.paragraphs.map((p) => p.text) : staticHome.about.paragraphs,
      image1: img(d.about?.image1, staticHome.about.image1),
      caption: d.about?.caption ? parseMarked(d.about.caption) : staticHome.about.caption,
      image2: img(d.about?.image2, staticHome.about.image2),
      resultTag: d.about?.resultTag ?? staticHome.about.resultTag,
      resultHeading: d.about?.resultHeading ? parseMarked(d.about.resultHeading) : staticHome.about.resultHeading,
    },
    metrics: d.about?.metrics?.length
      ? d.about.metrics.map((m, i) => ({
          end: m.end,
          suffix: m.suffix ?? '',
          label: m.label,
          text: m.text ?? '',
          dots: (i + 1) as 1 | 2 | 3 | 4,
        }))
      : staticHome.metrics,
    reel: {
      words: [
        d.showcase?.reelWord1 || staticHome.reel.words[0],
        d.showcase?.reelWord2 || staticHome.reel.words[1],
      ] as HomeContent['reel']['words'],
      video: mediaUrl(d.showcase?.video) ?? staticHome.reel.video,
    },
    works: {
      tag: d.works?.tag ?? staticHome.works.tag,
      heading: d.works?.heading ? parseMarked(d.works.heading) : staticHome.works.heading,
      text: d.works?.text ? parseMarked(d.works.text) : staticHome.works.text,
      outro: d.works?.outro ? parseMarked(d.works.outro) : staticHome.works.outro,
      cta: d.works?.cta ?? staticHome.works.cta,
    },
    services: {
      tag: d.services?.tag ?? staticHome.services.tag,
      heading: d.services?.heading ? parseMarked(d.services.heading) : staticHome.services.heading,
      text: d.services?.text ?? staticHome.services.text,
      images: [img(d.services?.image1, staticHome.services.images[0]), img(d.services?.image2, staticHome.services.images[1])],
      rows: staticHome.services.rows,
    },
    testimonials: {
      tag: d.testimonials?.tag ?? staticHome.testimonials.tag,
      heading: d.testimonials?.heading ? parseMarked(d.testimonials.heading) : staticHome.testimonials.heading,
      prev: d.testimonials?.prev ?? staticHome.testimonials.prev,
      next: d.testimonials?.next ?? staticHome.testimonials.next,
      items: staticHome.testimonials.items,
    },
    clients: {
      tag: d.clients?.tag ?? staticHome.clients.tag,
      heading: d.clients?.heading ? parseMarked(d.clients.heading) : staticHome.clients.heading,
      text: d.clients?.text ? parseMarked(d.clients.text) : staticHome.clients.text,
      sentence: d.clients?.sentence ? parseMarked(d.clients.sentence) : staticHome.clients.sentence,
      cta: d.clients?.cta ?? staticHome.clients.cta,
      list: staticHome.clients.list,
    },
    approach: {
      tag: d.approach?.tag ?? staticHome.approach.tag,
      heading: d.approach?.heading ? parseMarked(d.approach.heading) : staticHome.approach.heading,
      text: d.approach?.text ?? staticHome.approach.text,
      image: img(d.approach?.image, staticHome.approach.image),
      steps: d.approach?.steps?.length
        ? d.approach.steps.map((s, i) => ({ title: s.title, text: s.text, dots: (i + 1) as 1 | 2 | 3 | 4 }))
        : staticHome.approach.steps,
    },
    awards: {
      tag: d.awards?.tag ?? staticHome.awards.tag,
      heading: d.awards?.heading ? parseMarked(d.awards.heading) : staticHome.awards.heading,
      sentence: d.awards?.sentence ? parseMarked(d.awards.sentence) : staticHome.awards.sentence,
      list: staticHome.awards.list,
    },
    blogsPreview: {
      tag: d.blogs?.tag ?? staticHome.blogsPreview.tag,
      heading: d.blogs?.heading ? parseMarked(d.blogs.heading) : staticHome.blogsPreview.heading,
      cta: d.blogs?.cta ?? staticHome.blogsPreview.cta,
      profileText: d.blogs?.profileText ? parseMarked(d.blogs.profileText) : staticHome.blogsPreview.profileText,
    },
    faq: {
      tag: d.faq?.tag ?? staticHome.faq.tag,
      heading: d.faq?.heading ? parseMarked(d.faq.heading) : staticHome.faq.heading,
      items: staticHome.faq.items,
      outroHeading: d.faq?.outroHeading ? parseMarked(d.faq.outroHeading) : staticHome.faq.outroHeading,
      outroText: d.faq?.outroText ?? staticHome.faq.outroText,
      outroCta: d.faq?.outroCta ?? staticHome.faq.outroCta,
    },
    contact: {
      tag: d.contact?.tag ?? staticHome.contact.tag,
      heading: d.contact?.heading ? parseMarked(d.contact.heading) : staticHome.contact.heading,
      sentence: d.contact?.sentence ? parseMarked(d.contact.sentence) : staticHome.contact.sentence,
      connectLabel: d.contact?.connectLabel ?? staticHome.contact.connectLabel,
      fields: d.contact?.fields?.length
        ? d.contact.fields.map((f) => ({ name: f.name, placeholder: f.placeholder ?? '', type: (f.type ?? 'text') as FormField['type'] }))
        : staticHome.contact.fields,
      replyNote: d.contact?.replyNote ? parseMarked(d.contact.replyNote) : staticHome.contact.replyNote,
      submit: d.contact?.submit ?? staticHome.contact.submit,
      submitting: d.contact?.submitting ?? staticHome.contact.submitting,
      sent: d.contact?.sent ?? staticHome.contact.sent,
      failed: d.contact?.failed ?? staticHome.contact.failed,
    },
  }
}
