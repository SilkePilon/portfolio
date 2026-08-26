import { mapHome } from '@/lib/home-map'
import { home as staticHome } from '@/content/home'
import type { Home } from '@/payload-types'

const base: Home = { id: 1, updatedAt: '2026-08-26T00:00:00.000Z', createdAt: '2026-08-26T00:00:00.000Z' } as Home

test('a global that was never saved keeps the static content', () => {
  expect(mapHome({} as Home)).toBeNull()
})

test('services heading maps marked text and tag; missing fields fall back to static', () => {
  const h = mapHome({ ...base, services: { heading: 'Design\n**that speaks**', tag: 'Services(04)' } })
  expect(h).not.toBeNull()
  expect(h!.services.heading).toEqual([{ text: 'Design', muted: true }, { br: true }, { text: 'that speaks' }])
  expect(h!.services.tag).toBe('Services(04)')
  expect(h!.services.text).toBe(staticHome.services.text)
  expect(h!.about.image1).toEqual(staticHome.about.image1)
})

test('empty metrics array falls back to static metrics', () => {
  const h = mapHome({ ...base, about: { metrics: [] } })
  expect(h!.metrics).toEqual(staticHome.metrics)
})

test('saved metrics get sequential dots by position', () => {
  const h = mapHome({
    ...base,
    about: {
      metrics: [
        { end: 10, suffix: '+', label: 'A', text: 'a' },
        { end: 20, suffix: '+', label: 'B', text: 'b' },
      ],
    },
  })
  expect(h!.metrics.map((m) => m.dots)).toEqual([1, 2])
  expect(h!.metrics.map((m) => m.end)).toEqual([10, 20])
})

test('reel words map with per-word fallback and video falls back to static when unset', () => {
  const h = mapHome({ ...base, showcase: { reelWord1: 'Open', reelWord2: 'Work' } })
  expect(h!.reel.words).toEqual(['Open', 'Work'])
  expect(h!.reel.video).toBe(staticHome.reel.video)
})

test('contact form fields are used as-is when saved, and fall back to static when empty', () => {
  const h = mapHome({ ...base, contact: { fields: [{ name: 'Name', placeholder: 'Jane', type: 'text' }] } })
  expect(h!.contact.fields).toEqual([{ name: 'Name', placeholder: 'Jane', type: 'text' }])

  const h2 = mapHome({ ...base, contact: { fields: [] } })
  expect(h2!.contact.fields).toEqual(staticHome.contact.fields)
})

test('list-owned fields (rows/items/list) always keep the static shape from the home global', () => {
  const h = mapHome(base)
  expect(h!.services.rows).toEqual(staticHome.services.rows)
  expect(h!.testimonials.items).toEqual(staticHome.testimonials.items)
  expect(h!.clients.list).toEqual(staticHome.clients.list)
  expect(h!.awards.list).toEqual(staticHome.awards.list)
  expect(h!.faq.items).toEqual(staticHome.faq.items)
})
