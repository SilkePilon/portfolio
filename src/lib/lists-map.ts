import type { Award, Client, Faq, Service, Testimonial } from '@/content/types'
import type {
  Award as AwardDoc,
  Client as ClientDoc,
  Faq as FaqDoc,
  Service as ServiceDoc,
  Testimonial as TestimonialDoc,
} from '@/payload-types'
import { img, placeholder } from './site-map'

export function mapService(d: ServiceDoc): Service {
  return {
    title: d.title,
    text: d.text ?? '',
    tags: (d.tags ?? []).map((t) => t.label),
    image: img(d.image, placeholder(d.title)),
  }
}

export function mapTestimonial(d: TestimonialDoc): Testimonial {
  return {
    quote: d.quote,
    name: d.name,
    role: d.role ?? '',
    avatar: img(d.avatar, placeholder(d.name)),
  }
}

export function mapClient(d: ClientDoc): Client {
  return {
    name: d.name,
    year: d.year ?? '',
    image: img(d.image, placeholder(d.name)),
    href: d.href || undefined,
  }
}

export function mapAward(d: AwardDoc): Award {
  return { name: d.name, text: d.text ?? '' }
}

export function mapFaq(d: FaqDoc): Faq {
  return { q: d.question, a: d.answer }
}
