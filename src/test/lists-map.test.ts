import { mapAward, mapClient, mapFaq, mapService, mapTestimonial } from '@/lib/lists-map'
import type { Award, Client, Faq, Service, Testimonial } from '@/payload-types'

test('mapFaq maps question/answer to q/a', () => {
  expect(mapFaq({ id: 1, question: 'Q', answer: 'A', updatedAt: '', createdAt: '' } as Faq)).toEqual({ q: 'Q', a: 'A' })
})

test('mapService falls back to the og placeholder image when the upload is not populated', () => {
  const d = { id: 1, title: 'Website Design', text: 'desc', tags: [{ label: 'Figma' }], image: 5, updatedAt: '', createdAt: '' } as unknown as Service
  const s = mapService(d)
  expect(s.image).toEqual({ src: '/images/og.png', alt: 'Website Design', width: 1200, height: 630 })
  expect(s.tags).toEqual(['Figma'])
  expect(s.text).toBe('desc')
})

test('mapClient turns an empty href into undefined', () => {
  const d = { id: 1, name: 'Acme', year: '2025', href: '', updatedAt: '', createdAt: '' } as Client
  expect(mapClient(d).href).toBeUndefined()
})

test('mapClient keeps a populated href', () => {
  const d = { id: 1, name: 'Acme', year: '2025', href: 'https://acme.test', updatedAt: '', createdAt: '' } as Client
  expect(mapClient(d).href).toBe('https://acme.test')
})

test('mapTestimonial and mapAward map their fields', () => {
  const t = mapTestimonial({ id: 1, quote: 'Great', name: 'Jane', role: 'CEO', updatedAt: '', createdAt: '' } as Testimonial)
  expect(t).toEqual({ quote: 'Great', name: 'Jane', role: 'CEO', avatar: { src: '/images/og.png', alt: 'Jane', width: 1200, height: 630 } })

  const a = mapAward({ id: 1, name: 'Award', text: 'text', updatedAt: '', createdAt: '' } as Award)
  expect(a).toEqual({ name: 'Award', text: 'text' })
})
