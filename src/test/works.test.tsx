import { render, screen, within } from '@testing-library/react'
import { LiquidImage } from '@/components/anim/LiquidImage'
import { WorksGrid } from '@/components/home/WorksGrid'
import { ContentProvider, staticContent } from '@/components/layout/ContentProvider'
import { WorkCard } from '@/components/works/WorkCard'
import { WorkDetail } from '@/components/works/WorkDetail'
import { WorksIndex } from '@/components/works/WorksIndex'
import { home } from '@/content/home'
import { works } from '@/content/works'

const renderSection = () =>
  render(
    <>
      <WorksGrid />
    </>,
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
    <>
      <WorkCard work={work} />
    </>,
  )
  expect(screen.getByRole('link')).toHaveAttribute('href', '/works/sienna')
  expect(screen.getByRole('heading', { level: 3, name: work.title })).toBeInTheDocument()
  expect(screen.getByAltText(work.cover.alt)).toHaveAttribute('src', work.cover.src)
  // The services are one paragraph with a line break per item, like the template.
  const services = container.querySelector('p')
  expect(services?.querySelectorAll('br')).toHaveLength(work.services.length - 1)
  for (const service of work.services) expect(services).toHaveTextContent(service)
})

test('WorkDetail renders the provider copy for its slug, not the server prop (live preview)', () => {
  const [work, next] = works
  const edited = { ...work, title: '(cms) Sienna Studio', overview: '(cms) overview paragraph' }
  render(
    <ContentProvider value={{ ...staticContent, works: [edited, ...works.slice(1)] }}>
      <WorkDetail work={work} next={next} />
    </ContentProvider>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(cms) Sienna Studio')
  expect(screen.getByText('(cms) overview paragraph')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 1, name: work.title })).toBeNull()
})

test('WorkDetail picks the next card up from the provider too', () => {
  const [work, next] = works
  const editedNext = { ...next, title: '(cms) Next Project' }
  render(
    <ContentProvider value={{ ...staticContent, works: [works[0], editedNext, ...works.slice(2)] }}>
      <WorkDetail work={work} next={next} />
    </ContentProvider>,
  )
  expect(screen.getByRole('heading', { level: 3, name: '(cms) Next Project' })).toBeInTheDocument()
})

test('WorksIndex renders the works in the order the provider gives them', () => {
  const reversed = [...works].reverse()
  render(
    <ContentProvider value={{ ...staticContent, works: reversed }}>
      <WorksIndex />
    </ContentProvider>,
  )
  const cards = screen.getAllByRole('link').filter((a) => a.getAttribute('href')?.startsWith('/works/'))
  expect(cards.map((a) => a.getAttribute('href'))).toEqual(reversed.map((w) => `/works/${w.slug}`))
})

test('LiquidImage renders the plain images and never a WebGL context under jsdom', () => {
  const work = works[1]
  const { container } = render(<LiquidImage base={work.cover} hover={work.hoverCover} />)
  const img = screen.getByAltText(work.cover.alt)
  expect(img).toHaveAttribute('src', work.cover.src)
  expect(container.querySelectorAll('img')).toHaveLength(2)
  expect(container.querySelector('canvas')).toBeNull()
})
