import { existsSync } from 'node:fs'
import { works, getWork, nextWork } from '@/content/works'
import { blogs, getBlog, nextBlogs, homeBlogs } from '@/content/blogs'
import { home } from '@/content/home'
import { site } from '@/content/site'

const img = (src: string) => existsSync('public' + src)

test('works are unique and complete', () => {
  expect(works.map((w) => w.slug)).toEqual(['sienna', 'glidex', 'veon', 'zayla', 'destello'])
  for (const w of works) {
    expect(img(w.cover.src)).toBe(true)
    expect(img(w.hoverCover.src)).toBe(true)
    expect(w.gallery).toHaveLength(4)
    w.gallery.forEach((g) => expect(img(g.src)).toBe(true))
    expect(w.services.length).toBeGreaterThan(0)
    expect(w.overview.length).toBeGreaterThan(50)
    expect(w.date).toMatch(/\d{4}/)
  }
  expect(getWork('zayla')?.title).toBe('Zayla')
  expect(nextWork('destello').slug).toBe('sienna')
})

test('blogs are unique and complete', () => {
  expect(new Set(blogs.map((b) => b.slug)).size).toBe(8)
  for (const b of blogs) {
    expect(img(b.cover.src)).toBe(true)
    expect(b.body.length).toBeGreaterThanOrEqual(7)
    expect(b.body[0].kind).toBe('paragraph')
  }
  expect(getBlog('the-roadmap-behind-great-design')?.category).toBe('Design Strategy')
  expect(nextBlogs('why-framer-development-is-modern-creation').map((b) => b.slug)).toEqual([
    'the-roadmap-behind-great-design',
    'designing-a-brand-that-speaks-without-words',
  ])
  expect(homeBlogs).toHaveLength(3)
  expect(blogs.some((b) => b.body.some((x) => x.kind === 'list'))).toBe(true)
})

test('home content images exist', () => {
  ;[
    site.hero.image,
    home.about.image1,
    home.about.image2,
    home.approach.image,
    ...home.services.images,
    ...home.services.rows.map((s) => s.image),
    ...home.testimonials.items.map((t) => t.avatar),
    ...home.clients.list.map((c) => c.image),
    site.profile.avatar,
    site.footer.createdBy.avatar,
  ].forEach((i) => expect(img(i.src)).toBe(true))
  expect(img(home.reel.video)).toBe(true)
  expect(home.metrics.map((m) => m.end)).toEqual([62, 3, 98, 5])
  expect(home.faq.items).toHaveLength(8)
  expect(site.nav.map((n) => n.label)).toEqual(['Home', 'About', 'Works', 'Blogs', 'Contact'])
})
