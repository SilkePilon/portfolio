export type Img = { src: string; alt: string; width: number; height: number }

export type Work = {
  slug: string
  title: string
  services: string[]
  description: string
  overview: string
  date: string
  client: string
  industry: string
  liveUrl?: string
  cover: Img
  hover: Img
  gallery: Img[]
}

export type BlogSection = { heading: string; paragraphs: string[] }

export type Blog = {
  slug: string
  title: string
  category: string
  date: string
  cover: Img
  intro: string
  sections: BlogSection[]
}

export type Metric = { end: number; suffix: string; label: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Service = { n: string; title: string; text: string; tags: string[]; image: Img }
export type Testimonial = { quote: string; name: string; role: string; avatar: Img }
export type Client = { name: string; year: string; image: Img }
export type Step = { n: string; title: string; text: string; dots: 1 | 2 | 3 | 4 }
export type Award = { n: string; name: string; text: string }
export type Faq = { q: string; a: string }
export type NavLink = { label: string; to: string }
export type Social = { label: string; href: string }
