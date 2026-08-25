import { render, screen } from '@testing-library/react'
import { Approach } from '@/components/home/Approach'
import { Awards } from '@/components/home/Awards'
import { home } from '@/content/home'

test('Approach renders the tag, heading, lead text, image and all four numbered steps with dots', () => {
  const { container } = render(<Approach />)
  expect(container.querySelector('#approach')).not.toBeNull()

  expect(screen.getByText(home.approach.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  for (const part of home.approach.heading) if (part.text) expect(heading).toHaveTextContent(part.text)

  expect(screen.getByText(home.approach.text)).toBeInTheDocument()

  const image = screen.getByAltText(home.approach.image.alt)
  expect(image).toHaveAttribute('src', home.approach.image.src)

  home.approach.steps.forEach((step, i) => {
    expect(screen.getByText(`${String(i + 1).padStart(2, '0')}/`)).toBeInTheDocument()
    expect(screen.getByText(step.title)).toBeInTheDocument()
    expect(screen.getByText(step.text)).toBeInTheDocument()
  })

  // Corners variant={4} on the image box + each of the 4 step cells: 5 * 4 markers.
  expect(container.querySelectorAll('svg')).toHaveLength(20)

  // Dots: 1 + 2 + 3 + 4 active dots across the four steps.
  const totalActiveDots = home.approach.steps.reduce((sum, s) => sum + s.dots, 0)
  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(totalActiveDots)
})

test('Awards renders the tag, heading, sentence and all four award rows with numbering', () => {
  const { container } = render(<Awards />)
  expect(container.querySelector('#awards')).not.toBeNull()

  expect(screen.getByText(home.awards.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  for (const part of home.awards.heading) if (part.text) expect(heading).toHaveTextContent(part.text)
  for (const part of home.awards.sentence) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()

  home.awards.list.forEach((award, i) => {
    expect(screen.getByText(`${String(i + 1).padStart(2, '0')}/`)).toBeInTheDocument()
    expect(screen.getByText(award.name)).toBeInTheDocument()
    expect(screen.getByText(award.text)).toBeInTheDocument()
  })

  // A single Corners variant={4} wraps the whole award list.
  expect(container.querySelectorAll('svg')).toHaveLength(4)
})
