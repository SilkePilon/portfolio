import { render, screen } from '@testing-library/react'
import { Shell } from '@/components/layout/Shell'
import { NotFoundView } from '@/components/pages/NotFoundView'
import { site } from '@/content/site'

test('shell renders navbar, footer and children', () => {
  render(
    <Shell site={site}>
      <p>page content</p>
    </Shell>,
  )
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  for (const label of ['Home', 'About', 'Works', 'Blogs', 'Contact']) expect(screen.getAllByLabelText(label).length).toBeGreaterThan(0)
  expect(screen.getAllByText('Book a Call').length).toBeGreaterThan(0)
  expect(screen.getByText('Follow on')).toBeInTheDocument()
  expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
  expect(screen.getByText('page content')).toBeInTheDocument()
})

test('shell uses the site content it is given', () => {
  render(
    <Shell site={{ ...site, name: 'Acme Studio', socials: [{ label: 'Mastodon', href: 'https://example.com' }] }}>
      <p>x</p>
    </Shell>,
  )
  expect(screen.getByLabelText('Mastodon')).toBeInTheDocument()
})

test('not-found view renders the 404 copy', () => {
  render(<NotFoundView />)
  expect(screen.getByText('404')).toBeInTheDocument()
  expect(screen.getAllByText('Back to Home').length).toBeGreaterThan(0)
})
