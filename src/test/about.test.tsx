import { render, screen } from '@testing-library/react'
import { About } from '@/components/home/About'
import { BioStrip } from '@/components/home/BioStrip'
import { Metrics } from '@/components/home/Metrics'
import { home } from '@/content/home'

test('BioStrip renders every label/value pair with four corner markers', () => {
  const { container } = render(<BioStrip />)
  expect(container.querySelector('#bio')).not.toBeNull()
  for (const item of home.bio) {
    expect(screen.getByText(item.label)).toBeInTheDocument()
    expect(screen.getByText(item.value)).toBeInTheDocument()
  }
  // Corners variant={4} renders one <svg> per marker.
  expect(container.querySelectorAll('svg')).toHaveLength(4)
})

test('About renders the tag, both TextReveal paragraphs, both images, the caption and the driven-result heading', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).not.toBeNull()

  expect(screen.getByText(home.about.tag)).toBeInTheDocument()
  for (const paragraph of home.about.paragraphs) {
    expect(screen.getByText(paragraph)).toBeInTheDocument()
  }

  const portraits = screen.getAllByAltText(home.about.image1.alt)
  const srcs = portraits.map((img) => img.getAttribute('src'))
  expect(srcs).toContain(home.about.image1.src)
  expect(srcs).toContain(home.about.image2.src)

  for (const part of home.about.caption) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()

  expect(screen.getByText(home.about.resultTag)).toBeInTheDocument()
  for (const part of home.about.resultHeading) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()

  // Corners variant={4} on both the image1 and image2 boxes: 2 * 4 markers.
  expect(container.querySelectorAll('svg')).toHaveLength(8)
})

test('Metrics renders four counters (starting at 0 under jsdom), their labels, text and dots', () => {
  const { container } = render(<Metrics />)
  expect(container.querySelector('#metrics')).not.toBeNull()

  for (const metric of home.metrics) {
    expect(screen.getByText(metric.label)).toBeInTheDocument()
    expect(screen.getByText(metric.text)).toBeInTheDocument()
  }

  const bySuffix = new Map<string, number>()
  for (const m of home.metrics) bySuffix.set(m.suffix, (bySuffix.get(m.suffix) ?? 0) + 1)
  for (const [suffix, count] of bySuffix) expect(screen.getAllByText(`0${suffix}`)).toHaveLength(count)

  const totalActiveDots = home.metrics.reduce((sum, m) => sum + m.dots, 0)
  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(totalActiveDots)
})
