/**
 * Seeds the CMS with the template's placeholder content (idempotent — skips docs that already exist).
 * Run: npm run seed   (dev server does not need to be running)
 */
import path from 'path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import type { Img } from '../src/content/types'
import { works } from '../src/content/works'
import { blogs, homeBlogs } from '../src/content/blogs'
import { site } from '../src/content/site'
import { blocksToLexical } from '../src/lib/lexical'
import type { Post } from '../src/payload-types'

const payload = await getPayload({ config })
const mediaIds = new Map<string, number>()

async function media(img: Img): Promise<number> {
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
for (const [i, w] of works.entries()) {
  const exists = await payload.find({ collection: 'works', where: { slug: { equals: w.slug } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'works',
    data: {
      title: w.title,
      slug: w.slug,
      order: i + 1,
      date: iso(w.date),
      cover: await media(w.cover),
      hoverCover: await media(w.hoverCover),
      description: w.description,
      overview: w.overview,
      client: w.client,
      industry: w.industry,
      liveUrl: w.liveUrl ?? '',
      services: w.services.map((label) => ({ label })),
      gallery: await Promise.all(w.gallery.map(async (g) => ({ image: await media(g) }))),
    },
  })
  n++
  console.log('work +', w.slug)
}

const featured = new Set(homeBlogs.map((b) => b.slug))
for (const [i, b] of blogs.entries()) {
  const exists = await payload.find({ collection: 'posts', where: { slug: { equals: b.slug } }, limit: 1 })
  if (exists.docs.length) continue
  await payload.create({
    collection: 'posts',
    data: {
      title: b.title,
      slug: b.slug,
      order: i + 1,
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

const current = await payload.findGlobal({ slug: 'site' })
if (!current.nav?.length) {
  await payload.updateGlobal({
    slug: 'site',
    data: {
      name: site.name,
      wordmarkLine1: site.wordmark[0],
      wordmarkLine2: site.wordmark[1],
      description: site.description,
      ogImage: await media(site.ogImage),
      nav: site.nav.map((l) => ({ label: l.label, to: l.to })),
      bookCall: site.bookCall,
      contact: site.contact,
      socials: site.socials,
      profile: { name: site.profile.name, role: site.profile.role, avatar: await media(site.profile.avatar) },
      taglineMuted: site.footer.tagline[0].text,
      taglineStrong: site.footer.tagline[1].text,
      socialsTitle: site.footer.socialsTitle,
      socialsText: site.footer.socialsText,
      createdBy: { label: site.footer.createdBy.label, name: site.footer.createdBy.name, href: site.footer.createdBy.href, avatar: await media(site.footer.createdBy.avatar) },
    },
  })
  n++
  console.log('site settings +')
}

console.log(n ? `seeded ${n} documents` : 'nothing to seed — content already present')
process.exit(0)
