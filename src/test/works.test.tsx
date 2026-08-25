import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LiquidImage } from '@/components/anim/LiquidImage'
import { WorksGrid } from '@/components/home/WorksGrid'
import { WorkCard } from '@/components/works/WorkCard'
import { home } from '@/content/home'
import { works } from '@/content/works'

const renderSection = () =>
  render(
    <MemoryRouter>
      <WorksGrid />
    </MemoryRouter>,
  )

test('WorksGrid renders the eyebrow and the section heading', () => {
  const { container } = renderSection()
  expect(container.querySelector('#works')).not.toBeNull()
  expect(screen.getByText(home.works.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  expect(heading).toHaveTextContent('A collection')
  expect(heading).toHaveTextContent('refined digital experiences')
  expect(screen.getByText(/Every project here was shaped with intention/)).toBeInTheDocument()
})

test('WorksGrid links all five work cards to their detail pages, in content order', () => {
  renderSection()
  const cards = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/works/'))
  expect(cards).toHaveLength(5)
  expect(cards.map((a) => a.getAttribute('href'))).toEqual(['/works/sienna', '/works/glidex', '/works/veon', '/works/zayla', '/works/destello'])
  for (const work of works) {
    expect(screen.getByRole('heading', { level: 3, name: work.title })).toBeInTheDocument()
  }
})

test('WorksGrid closes with the outro sentence and the explore-all-works cta', () => {
  renderSection()
  expect(screen.getByText(/These selected projects reflect/)).toBeInTheDocument()
  const cta = screen.getAllByRole('link').find((a) => a.getAttribute('href') === '/works')
  expect(cta).toBeDefined()
  expect(within(cta as HTMLElement).getAllByText(home.works.cta).length).toBeGreaterThan(0)
})

test('WorkCard renders its cover, title and every service', () => {
  const work = works[0]
  const { container } = render(
    <MemoryRouter>
      <WorkCard work={work} />
    </MemoryRouter>,
  )
  expect(screen.getByRole('link')).toHaveAttribute('href', '/works/sienna')
  expect(screen.getByRole('heading', { level: 3, name: work.title })).toBeInTheDocument()
  expect(screen.getByAltText(work.cover.alt)).toHaveAttribute('src', work.cover.src)
  // The services are one paragraph with a line break per item, like the template.
  const services = container.querySelector('p')
  expect(services?.querySelectorAll('br')).toHaveLength(work.services.length - 1)
  for (const service of work.services) expect(services).toHaveTextContent(service)
})

test('LiquidImage renders the plain images and never a WebGL context under jsdom', () => {
  const work = works[1]
  const { container } = render(<LiquidImage base={work.cover} hover={work.hoverCover} />)
  const img = screen.getByAltText(work.cover.alt)
  expect(img).toHaveAttribute('src', work.cover.src)
  expect(container.querySelectorAll('img')).toHaveLength(2)
  expect(container.querySelector('canvas')).toBeNull()
})
