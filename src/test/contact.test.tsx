import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { Contact } from '@/components/home/Contact'
import { ContentProvider, staticContent } from '@/components/layout/ContentProvider'
import { home } from '@/content/home'
import { site } from '@/content/site'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('Contact renders the tag, heading, field labels/placeholders and the CMS contact links', () => {
  const { container } = render(<Contact />)
  expect(container.querySelector('#contact')).not.toBeNull()

  expect(screen.getByText(home.contact.tag)).toBeInTheDocument()
  expect(screen.getByText('Project in Mind?')).toBeInTheDocument()
  expect(screen.getByText(home.contact.connectLabel)).toBeInTheDocument()

  for (const f of home.contact.fields) {
    expect(screen.getByText(f.name)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(f.placeholder)).toBeInTheDocument()
  }

  expect(screen.getByText(site.contact.email)).toHaveAttribute('href', `mailto:${site.contact.email}`)
  expect(screen.getByText(site.contact.phone)).toHaveAttribute('href', `tel:${site.contact.phone}`)
  expect(screen.getByText(site.profile.name)).toBeInTheDocument()

  expect(screen.getByRole('button', { name: home.contact.submit })).toBeInTheDocument()
})

test('submitting with empty fields shows validation errors and never calls fetch', () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)

  render(<Contact />)
  fireEvent.click(screen.getByRole('button', { name: home.contact.submit }))

  expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
  expect(screen.getByText('Enter a valid e-mail')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

test('a valid submit posts through fetch and the button label becomes the "sent" text', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true })
  vi.stubGlobal('fetch', fetchMock)

  render(<Contact />)
  fireEvent.change(screen.getByPlaceholderText('Jane Smith'), { target: { value: 'Jane Smith' } })
  fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'jane@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('+00 0123456789'), { target: { value: '+1 555 0100' } })
  fireEvent.change(screen.getByPlaceholderText('$2000 - $5000'), { target: { value: '$2000 - $5000' } })
  fireEvent.change(screen.getByPlaceholderText('My message is...'), { target: { value: 'Hello there' } })

  fireEvent.click(screen.getByRole('button', { name: home.contact.submit }))

  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
  await waitFor(() => expect(screen.getByRole('button', { name: home.contact.sent })).toBeInTheDocument())

  expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
})

test('relabelled and missing CMS rows never break the form: the labels change, the posted keys do not', () => {
  const fields = home.contact.fields
    .filter((f) => f.key !== 'Phone')
    .map((f) => (f.key === 'Budget' ? { ...f, name: 'Project budget' } : f))
  const value = { ...staticContent, home: { ...home, contact: { ...home.contact, fields } } }

  const { container } = render(
    <ContentProvider value={value}>
      <Contact />
    </ContentProvider>,
  )

  expect(screen.getByText('Project budget')).toBeInTheDocument()
  expect(container.querySelector('input[name="Budget"]')).not.toBeNull()
  // Phone was deleted in the admin — the row still renders with the built-in label and key.
  expect(container.querySelector('input[name="Phone"]')).not.toBeNull()
  expect(screen.getByText('Phone')).toBeInTheDocument()
  expect(container.querySelectorAll('[name]')).toHaveLength(6)
})
