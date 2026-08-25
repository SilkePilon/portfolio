import { render, screen } from '@testing-library/react'
import { Hero } from '@/components/home/Hero'
import { home } from '@/content/home'

const { badge, image, intro, name } = home.hero

test('hero renders the wordmarks, portrait, intro copy and badge', () => {
  render(<Hero />)

  // FitText renders an aria-hidden measuring probe next to the visible text, so each wordmark
  // shows up twice in the DOM but exposes a single accessible name.
  for (const word of name) {
    expect(screen.getAllByText(word)).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 1, name: word })).toBeInTheDocument()
  }

  expect(screen.getByAltText(image.alt)).toHaveAttribute('src', image.src)

  for (const part of intro) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()

  expect(screen.getByText(badge)).toBeInTheDocument()
})

test('hero is a full-viewport header section', () => {
  const { container } = render(<Hero />)

  const section = container.querySelector('#hero')
  expect(section?.tagName).toBe('HEADER')
  expect(section?.className).toMatch(/100svh/)
})
