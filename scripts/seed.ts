/**
 * Seeds the CMS with the template's placeholder content (idempotent — skips docs that already exist).
 * Run: npm run seed   (dev server does not need to be running)
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { works } from '../src/content/works'
import { blogs, homeBlogs } from '../src/content/blogs'
import { site } from '../src/content/site'
import { home, pages } from '../src/content/home'
import { blocksToLexical } from '../src/lib/lexical'
import { toMarked } from '../src/lib/marked'
import type { Post } from '../src/payload-types'

const payload = await getPayload({ config })
const mediaIds = new Map<string, number>()

async function media(img: { src: string; alt: string }): Promise<number> {
  const filename = path.basename(img.src)
  const cached = mediaIds.get(filename)
  if (cached) return cached
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  let id = existing.docs[0]?.id as number | undefined
  if (!id) {
    const doc = await payload.create({ collection: 'media', data: { alt: img.alt }, filePath: path.resolve('public' + img.src) })
    id = doc.id as number
    console.log('  media +', filename)
  }
  mediaIds.set(filename, id)
  return id
}

/** "November 18, 2025" → ISO at noon UTC so the day survives any server timezone. */
const iso = (human: string) => {
  const d = new Date(`${human} 12:00:00 UTC`)
  return Number.isNaN(d.getTime()) ? '2025-11-18T12:00:00.000Z' : d.toISOString()
}

let n = 0
for (const w of works) {
  const exists = await payload.find({ collection: 'works', where: { slug: { equals: w.slug } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'works',
    data: {
      title: w.title,
      slug: w.slug,
      date: iso(w.date),
      cover: await media(w.cover),
      hoverCover: await media(w.hoverCover),
      description: w.description,
      overview: w.overview,
      client: w.client,
      industry: w.industry,
      liveUrl: w.liveUrl ?? '',
      services: w.services.map((label) => ({ label })),
      // Sequential, not Promise.all: concurrent media() creates for the same-named
      // files intermittently trip Payload's filename validation on a fresh DB.
      gallery: await (async () => {
        const gallery: { image: number }[] = []
        for (const g of w.gallery) gallery.push({ image: await media(g) })
        return gallery
      })(),
    },
  })
  n++
  console.log('work +', w.slug)
}

const featured = new Set(homeBlogs.map((b) => b.slug))
for (const b of blogs) {
  const exists = await payload.find({ collection: 'posts', where: { slug: { equals: b.slug } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'posts',
    data: {
      title: b.title,
      slug: b.slug,
      featured: featured.has(b.slug),
      date: iso(b.date),
      category: b.category,
      cover: await media(b.cover),
      body: blocksToLexical(b.body) as unknown as Post['body'],
    },
  })
  n++
  console.log('post +', b.slug)
}

for (const s of home.services.rows) {
  const exists = await payload.find({ collection: 'services', where: { title: { equals: s.title } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'services',
    data: { title: s.title, text: s.text, tags: s.tags.map((label) => ({ label })), image: await media(s.image) },
  })
  n++
  console.log('service +', s.title)
}

for (const t of home.testimonials.items) {
  const exists = await payload.find({ collection: 'testimonials', where: { name: { equals: t.name } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'testimonials',
    data: { quote: t.quote, name: t.name, role: t.role, avatar: await media(t.avatar) },
  })
  n++
  console.log('testimonial +', t.name)
}

for (const c of home.clients.list) {
  const exists = await payload.find({ collection: 'clients', where: { name: { equals: c.name } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'clients',
    data: { name: c.name, year: c.year, image: await media(c.image), href: c.href ?? '' },
  })
  n++
  console.log('client +', c.name)
}

for (const a of home.awards.list) {
  const exists = await payload.find({ collection: 'awards', where: { name: { equals: a.name } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({ collection: 'awards', data: { name: a.name, text: a.text } })
  n++
  console.log('award +', a.name)
}

for (const f of home.faq.items) {
  const exists = await payload.find({ collection: 'faqs', where: { question: { equals: f.q } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({ collection: 'faqs', data: { question: f.q, answer: f.a } })
  n++
  console.log('faq +', f.q)
}

const current = await payload.findGlobal({ slug: 'site' })
if (!current.updatedAt) {
  await payload.updateGlobal({
    slug: 'site',
    data: {
      name: site.name,
      wordmarkLine1: site.wordmark[0],
      wordmarkLine2: site.wordmark[1],
      description: site.description,
      ogImage: await media(site.ogImage),
      hero: { image: await media(site.hero.image), nameLine1: site.hero.name[0], nameLine2: site.hero.name[1], badge: site.hero.badge },
      nav: site.nav.map((l) => ({ label: l.label, to: l.to })),
      bookCall: site.bookCall,
      contact: site.contact,
      socials: site.socials,
      profile: { name: site.profile.name, role: site.profile.role, avatar: await media(site.profile.avatar) },
      tagline: toMarked(site.footer.tagline),
      socialsTitle: site.footer.socialsTitle,
      socialsText: site.footer.socialsText,
      createdBy: { label: site.footer.createdBy.label, name: site.footer.createdBy.name, href: site.footer.createdBy.href, avatar: await media(site.footer.createdBy.avatar) },
    },
  })
  n++
  console.log('site settings +')
}

const currentHome = await payload.findGlobal({ slug: 'home' })
if (!currentHome.updatedAt) {
  await payload.updateGlobal({
    slug: 'home',
    data: {
      hero: {
        intro: toMarked(home.hero.intro),
        bio: home.bio.map((b) => ({ label: b.label, value: b.value })),
      },
      about: {
        tag: home.about.tag,
        paragraphs: home.about.paragraphs.map((text) => ({ text })),
        image1: await media(home.about.image1),
        caption: toMarked(home.about.caption),
        image2: await media(home.about.image2),
        resultTag: home.about.resultTag,
        resultHeading: toMarked(home.about.resultHeading),
        metrics: home.metrics.map((m) => ({ end: m.end, suffix: m.suffix, label: m.label, text: m.text })),
      },
      showcase: { appName: home.showcase.appName },
      works: {
        tag: home.works.tag,
        heading: toMarked(home.works.heading),
        text: toMarked(home.works.text),
        outro: toMarked(home.works.outro),
        cta: home.works.cta,
      },
      services: {
        tag: home.services.tag,
        heading: toMarked(home.services.heading),
        text: home.services.text,
        image1: await media(home.services.images[0]),
        image2: await media(home.services.images[1]),
      },
      testimonials: {
        tag: home.testimonials.tag,
        heading: toMarked(home.testimonials.heading),
        prev: home.testimonials.prev,
        next: home.testimonials.next,
      },
      clients: {
        tag: home.clients.tag,
        heading: toMarked(home.clients.heading),
        text: toMarked(home.clients.text),
        sentence: toMarked(home.clients.sentence),
        cta: home.clients.cta,
      },
      approach: {
        tag: home.approach.tag,
        heading: toMarked(home.approach.heading),
        text: home.approach.text,
        image: await media(home.approach.image),
        steps: home.approach.steps.map((s) => ({ title: s.title, text: s.text })),
      },
      awards: {
        tag: home.awards.tag,
        heading: toMarked(home.awards.heading),
        sentence: toMarked(home.awards.sentence),
      },
      blogs: {
        tag: home.blogsPreview.tag,
        heading: toMarked(home.blogsPreview.heading),
        profileText: toMarked(home.blogsPreview.profileText),
        cta: home.blogsPreview.cta,
      },
      faq: {
        tag: home.faq.tag,
        heading: toMarked(home.faq.heading),
        outroHeading: toMarked(home.faq.outroHeading),
        outroText: home.faq.outroText,
        outroCta: home.faq.outroCta,
      },
      contact: {
        tag: home.contact.tag,
        heading: toMarked(home.contact.heading),
        sentence: toMarked(home.contact.sentence),
        connectLabel: home.contact.connectLabel,
        fields: home.contact.fields.map((f) => ({ key: f.key, name: f.name, placeholder: f.placeholder, type: f.type })),
        replyNote: toMarked(home.contact.replyNote),
        submit: home.contact.submit,
        submitting: home.contact.submitting,
        sent: home.contact.sent,
        failed: home.contact.failed,
      },
    },
  })
  n++
  console.log('home page +')
}

const currentPages = await payload.findGlobal({ slug: 'pages' })
if (!currentPages.updatedAt) {
  await payload.updateGlobal({
    slug: 'pages',
    data: {
      notFound: { heading: pages.notFound.heading, text: pages.notFound.text, cta: pages.notFound.cta },
      works: { tag: pages.works.tag, heading: toMarked(pages.works.heading), text: pages.works.text },
      blogs: { tag: pages.blogs.tag, heading: toMarked(pages.blogs.heading), text: pages.blogs.text },
      workLabels: { ...pages.workLabels },
      blogLabels: { ...pages.blogLabels },
    },
  })
  n++
  console.log('other pages +')
}

console.log(n ? `seeded ${n} documents` : 'nothing to seed — content already present')
process.exit(0)
