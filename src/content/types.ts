export type Img = { src: string; alt: string; width: number; height: number }

/** Mixed-colour inline text: `muted` parts render grey, `br` inserts a line break. */
export type Rich = Array<{ text?: string; muted?: boolean; br?: boolean }>

export type NavLink = { label: string; to: string }
export type Social = { label: string; href: string }

export type Work = {
  slug: string
  title: string
  services: string[]
  cover: Img
  hoverCover: Img
  description: string
  overview: string
  date: string
  client: string
  industry: string
  liveUrl?: string
  gallery: Img[]
}

export type BlogBlock = { kind: 'heading' | 'paragraph'; text: string } | { kind: 'list'; items: string[] }
export type Blog = {
  slug: string
  title: string
  category: string
  date: string
  cover: Img
  /** Article body in reading order: uppercase h3 headings, paragraphs, bullet lists. */
  body: BlogBlock[]
}

export type Metric = { end: number; suffix: string; label: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Service = { title: string; text: string; tags: string[]; image: Img }
export type Testimonial = { quote: string; name: string; role: string; avatar: Img }
export type Client = { name: string; year: string; image: Img; href?: string }
export type Step = { title: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Award = { name: string; text: string }
export type Faq = { q: string; a: string }
export type FormField = { name: string; placeholder: string; type: 'text' | 'email' | 'tel' | 'textarea' }
