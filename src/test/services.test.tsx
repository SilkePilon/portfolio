import { render, screen } from '@testing-library/react'
import { Services } from '@/components/home/Services'
import { home } from '@/content/home'

test('Services renders the tag, heading, intro text and both lead images', () => {
  const { container } = render(<Services />)
  expect(container.querySelector('#services')).not.toBeNull()

  expect(screen.getByText(home.services.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  expect(heading).toHaveTextContent('Design')
  expect(heading).toHaveTextContent('that speaks for you')
  expect(screen.getByText(home.services.text)).toBeInTheDocument()

  for (const image of home.services.images) {
    expect(screen.getByAltText(image.alt)).toHaveAttribute('src', image.src)
  }
})

test('Services renders all four rows with their number, title, text, tags and thumbnail', () => {
  render(<Services />)

  home.services.rows.forEach((row, i) => {
    expect(screen.getByText(`${String(i + 1).padStart(2, '0')}/`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: row.title })).toBeInTheDocument()
    expect(screen.getByText(row.text)).toBeInTheDocument()
    for (const tag of row.tags) expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
    expect(screen.getByAltText(row.image.alt)).toHaveAttribute('src', row.image.src)
  })
})
