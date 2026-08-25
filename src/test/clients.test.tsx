import { fireEvent, render, screen } from '@testing-library/react'
import { Clients } from '@/components/home/Clients'
import { home } from '@/content/home'
import { site } from '@/content/site'

test('Clients renders the tag, heading, sentence and all 8 client names/years', () => {
  const { container } = render(<Clients />)
  expect(container.querySelector('#clients')).not.toBeNull()

  expect(screen.getByText(home.clients.tag)).toBeInTheDocument()
  for (const part of home.clients.heading) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()
  for (const part of home.clients.sentence) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()

  expect(home.clients.list).toHaveLength(8)
  for (const client of home.clients.list) {
    const row = screen.getByText(client.name).closest('a')
    expect(row).not.toBeNull()
    expect(row).toHaveTextContent(client.year)
  }
})

test('Clients shows the profile row and the Book a call cta', () => {
  render(<Clients />)
  expect(screen.getByText(site.profile.name)).toBeInTheDocument()
  expect(screen.getByText(site.profile.role)).toBeInTheDocument()
  expect(screen.getAllByText(home.clients.cta).length).toBeGreaterThan(0)
})

test('hovering a client row reveals that client image (nothing shown at rest)', () => {
  render(<Clients />)
  for (const client of home.clients.list) expect(screen.queryByAltText(client.image.alt)).toBeNull()

  const target = home.clients.list[2]
  const row = screen.getByText(target.name).closest('a')
  expect(row).not.toBeNull()

  fireEvent.mouseEnter(row as HTMLElement)
  expect(screen.getByAltText(target.image.alt)).toBeInTheDocument()

  fireEvent.mouseLeave(row as HTMLElement)
  expect(screen.queryByAltText(target.image.alt)).toBeNull()
})
