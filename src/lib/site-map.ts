import type { Img } from '@/content/types'
import { site as staticSite } from '@/content/site'
import type { Media, Site as SiteDoc } from '@/payload-types'

/** Shape every layout component consumes (same as the static `site` content). */
export type SiteContent = typeof staticSite

type MediaRef = Media | number | string | null | undefined

export function img(m: MediaRef, fallback: Img): Img {
  if (m && typeof m === 'object' && m.url) {
    return { src: m.url, alt: m.alt || fallback.alt, width: m.width ?? fallback.width, height: m.height ?? fallback.height }
  }
  return fallback
}

/**
 * Maps the `site` global onto the static content shape. Returns null when the global
 * was never saved in the admin (Payload then serves field defaults without timestamps),
 * so the static content stays in place. Empty arrays fall back per field — an empty
 * navigation must not discard the rest of the settings.
 */
export function mapSite(d: SiteDoc): SiteContent | null {
  if (!d.updatedAt) return null
  return {
    name: d.name,
    wordmark: [d.wordmarkLine1, d.wordmarkLine2] as unknown as SiteContent['wordmark'],
    description: d.description,
    nav: d.nav?.length ? d.nav.map((l) => ({ label: l.label, to: l.to })) : staticSite.nav,
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
    hero: {
      image: img(d.hero?.image, staticSite.hero.image),
      name: [d.hero?.nameLine1 || staticSite.hero.name[0], d.hero?.nameLine2 || staticSite.hero.name[1]],
      badge: d.hero?.badge || staticSite.hero.badge,
    },
  }
}
