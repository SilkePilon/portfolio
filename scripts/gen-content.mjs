// One-off generator: builds src/content/works.ts and src/content/blogs.ts from reference/content_pages.json.
// Hand-check the output (services arrays, dates, quotes) after running.
import { readFileSync, writeFileSync } from 'node:fs'

const pages = JSON.parse(readFileSync('reference/content_pages.json', 'utf8'))
const q = (s) => JSON.stringify(s)
const img = (src, alt, w = 1600, h = 1200) => `{ src: ${q(src)}, alt: ${q(alt)}, width: ${w}, height: ${h} }`

const workMeta = {
  sienna: { title: 'Sienna', live: undefined, gallery: ['sienna-1.jpg', 'sienna-2.png', 'sienna-3.png', 'sienna-4.png'], services: ['Web design', 'Branding', 'Framer development'] },
  glidex: { title: 'Glidex', live: undefined, gallery: ['glidex-1.png', 'glidex-2.png', 'glidex-3.png', 'glidex-cover.png'], services: ['Web design', 'Branding', 'SEO'] },
  veon: { title: 'Veon', live: undefined, gallery: ['veon-1.png', 'veon-2.png', 'veon-3.png', 'veon-4.png'], services: ['E-Commerce', 'UIUX Design', 'Shopify', 'Framer Development'] },
  zayla: { title: 'Zayla', live: 'https://zaylamonroe.framer.website/', gallery: ['zayla-1.png', 'zayla-2.png', 'zayla-3.png', 'zayla-4.png'], services: ['Web Development', 'Content Creation'] },
  destello: { title: 'Destello', live: 'https://destello.framer.website/', gallery: ['destello-1.png', 'destello-2.png', 'destello-3.png', 'destello-4.png'], services: ['UIUX Design', 'Branding', 'Framer Development', 'AI Automation'] },
}
const sizes = { 'destello-4.png': [2568, 2962] }

const works = Object.entries(workMeta)
  .map(([slug, m]) => {
    const b = pages[`works_${slug}.html`].blocks
    const val = (label) => {
      const i = b.findIndex((x) => x[1] === label)
      return b[i + 1][1]
    }
    const description = b.find((x) => x[0] === 'p')[1]
    const overview = b.find((x) => x[0] === 'h5')[1]
    const g = (file) => img(`/images/works/${file}`, m.title, ...(sizes[file] ?? [1600, 1200]))
    return `  {
    slug: ${q(slug)},
    title: ${q(m.title)},
    services: ${q(m.services)},
    cover: ${img(`/images/works/${slug}-cover.png`, m.title)},
    hoverCover: ${g(m.gallery[0])},
    description: ${q(description)},
    overview: ${q(overview)},
    date: ${q(val('Date:'))},
    client: ${q(val('Client:'))},
    industry: ${q(val('Industry:'))},${m.live ? `\n    liveUrl: ${q(m.live)},` : ''}
    gallery: [${m.gallery.map(g).join(', ')}],
  },`
  })
  .join('\n')

writeFileSync(
  'src/content/works.ts',
  `import type { Work } from './types'

/** Order = order on the home page and the works page. */
export const works: Work[] = [
${works}
]

export const getWork = (slug: string) => works.find((w) => w.slug === slug)
export const nextWork = (slug: string) => works[(works.findIndex((w) => w.slug === slug) + 1) % works.length]
`,
)

const blogMeta = [
  ['why-framer-development-is-modern-creation', 'Why Framer Development is Modern Creation', 'Framer Development', 'why-framer-development-is-modern-creation.jpg', 2400, 1200],
  ['the-roadmap-behind-great-design', 'The Roadmap Behind Great Design', 'Design Strategy', 'the-roadmap-behind-great-design.png', 448, 640],
  ['designing-a-brand-that-speaks-without-words', 'Turning Ideas Into Experiences', 'Brand Identity', 'designing-a-brand-that-speaks-without-words.png', 480, 640],
  ['building-brand-atmosphere-through-color-typography', 'Building Brand Through Color & Typography', 'Brand Identity', 'building-brand-atmosphere-through-color-typography.png', 640, 427],
  ['from-design-to-fully-functional-websites', 'From Design to Fully Functional Websites', 'Framer Development', 'from-design-to-fully-functional-websites.webp', 1280, 720],
  ['how-visual-hierarchy-shapes-user-decisions', 'How Visual Hierarchy Shapes User Decisions', 'UI Principles', 'how-visual-hierarchy-shapes-user-decisions.png', 640, 640],
  ['why-framer-makes-the-workflow-effortless', 'Why Framer Makes the Workflow Effortless', 'Framer Development', 'why-framer-makes-the-workflow-effortless.png', 1024, 964],
  ['designing-with-intent-why-clarity-beats-complexity', 'Designing With Intent: Why Clarity Beats Complexity', 'Design Strategy', 'designing-with-intent-why-clarity-beats-complexity.png', 1680, 2400],
]

const blogs = blogMeta
  .map(([slug, title, category, file, w, h]) => {
    const b = pages[`blogs_${slug}.html`].blocks
    const date = (b.find((x) => x[0] === 'p' && /\d{4}/.test(x[1])) ?? [null, 'November 18, 2025'])[1]
    const intro = b.find((x) => x[0] === 'h5')[1]
    const sections = []
    for (let i = 0; i < b.length; i++) {
      if (b[i][0] !== 'h3') continue
      const ps = []
      let j = i + 1
      while (j < b.length && b[j][0] === 'h5') ps.push(b[j++][1])
      if (ps.length) sections.push({ heading: b[i][1], paragraphs: ps })
    }
    const secs = sections.map((s) => `      { heading: ${q(s.heading)}, paragraphs: [${s.paragraphs.map(q).join(', ')}] },`).join('\n')
    return `  {
    slug: ${q(slug)},
    title: ${q(title)},
    category: ${q(category)},
    date: ${q(date)},
    cover: ${img(`/images/blogs/${file}`, title, w, h)},
    intro: ${q(intro)},
    sections: [
${secs}
    ],
  },`
  })
  .join('\n')

writeFileSync(
  'src/content/blogs.ts',
  `import type { Blog } from './types'

/** Order = order on the blogs page. */
export const blogs: Blog[] = [
${blogs}
]

export const getBlog = (slug: string) => blogs.find((b) => b.slug === slug)
export const nextBlogs = (slug: string, n = 2) => {
  const i = blogs.findIndex((b) => b.slug === slug)
  return Array.from({ length: n }, (_, k) => blogs[(i + 1 + k) % blogs.length])
}
/** The three posts featured on the home page. */
export const homeBlogs = [
  'designing-with-intent-why-clarity-beats-complexity',
  'why-framer-makes-the-workflow-effortless',
  'how-visual-hierarchy-shapes-user-decisions',
].map((s) => getBlog(s)!)
`,
)
console.log('wrote src/content/works.ts and src/content/blogs.ts')
