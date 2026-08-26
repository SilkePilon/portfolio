import { describe, expect, it } from 'vitest'
import { parseMarked, toMarked } from '@/lib/marked'
import { home, pages } from '@/content/home'
import { site } from '@/content/site'
import type { Rich } from '@/content/types'

describe('marked text', () => {
  it('parses markers, muted default and line breaks', () => {
    expect(parseMarked('Design\n**that speaks for you**')).toEqual([
      { text: 'Design', muted: true },
      { br: true },
      { text: 'that speaks for you' },
    ])
  })
  it('treats unbalanced ** literally', () => {
    expect(parseMarked('a ** b')).toEqual([{ text: 'a ** b', muted: true }])
  })
  it('empty string → empty array', () => {
    expect(parseMarked('')).toEqual([])
  })
  it('round-trips every Rich in the static content', () => {
    const all: Rich[] = [
      home.hero.intro, home.about.caption, home.about.resultHeading, home.works.heading, home.works.text, home.works.outro,
      home.services.heading, home.testimonials.heading, home.clients.heading, home.clients.text, home.clients.sentence,
      home.approach.heading, home.awards.heading, home.awards.sentence, home.blogsPreview.heading, home.blogsPreview.profileText,
      home.faq.heading, home.faq.outroHeading, home.contact.heading, home.contact.sentence, home.contact.replyNote,
      pages.works.heading, pages.blogs.heading, site.footer.tagline,
    ]
    for (const r of all) expect(parseMarked(toMarked(r))).toEqual(normalise(r))
  })
})

/** Adjacent same-colour parts merge on parse, so compare against the merged form. */
function normalise(r: Rich): Rich {
  const out: Rich = []
  for (const p of r) {
    const last = out[out.length - 1]
    if (p.br) out.push({ br: true })
    else if (last && !last.br && !!last.muted === !!p.muted) last.text = (last.text ?? '') + (p.text ?? '')
    else out.push(p.muted ? { text: p.text ?? '', muted: true } : { text: p.text ?? '' })
  }
  return out
}
