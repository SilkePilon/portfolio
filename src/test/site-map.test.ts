import { mapSite } from '@/lib/site-map'
import { site as staticSite } from '@/content/site'
import type { Site } from '@/payload-types'

const saved: Site = {
  id: 1,
  name: 'Silke Pilon',
  wordmarkLine1: 'Silke',
  wordmarkLine2: 'Pilon',
  description: 'desc',
  nav: [],
  socials: [],
  bookCall: { label: 'Get in contact', href: 'https://cal.com/x' },
  contact: { email: 'a@b.co', phone: '1' },
  profile: { name: 'Silke Pilon', role: 'Dev' },
  updatedAt: '2026-08-26T18:10:41.602Z',
  createdAt: '2026-08-26T18:10:41.602Z',
} as Site

test('a global that was never saved keeps the static content', () => {
  expect(mapSite({ ...saved, updatedAt: undefined, createdAt: undefined })).toBeNull()
})

test('a saved global with no navigation links still replaces the static content', () => {
  const s = mapSite(saved)
  expect(s).not.toBeNull()
  expect(s!.bookCall.href).toBe('https://cal.com/x')
  expect(s!.contact.email).toBe('a@b.co')
  expect(s!.nav).toEqual(staticSite.nav)
})

test('saved navigation links are used as-is', () => {
  const s = mapSite({ ...saved, nav: [{ label: 'Work', to: '/works' }] })
  expect(s!.nav).toEqual([{ label: 'Work', to: '/works' }])
})
