import { render, screen } from '@testing-library/react'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { RichSpan } from '@/components/ui/RichText'
import { Dots } from '@/components/ui/Dots'
import { SlideText } from '@/components/ui/SlideText'
import { Corners } from '@/components/ui/Corners'

test('ArrowButton renders a router link with stacked labels', () => {
  render(
    <>
      <ArrowButton to="/works" bar>
        Explore all works
      </ArrowButton>
    </>,
  )
  const link = screen.getByRole('link')
  expect(link).toHaveAttribute('href', '/works')
  expect(screen.getAllByText('Explore all works')).toHaveLength(2)
})

test('ArrowButton renders external links safely and buttons for actions', () => {
  render(<ArrowButton href="https://example.com">Book</ArrowButton>)
  expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  render(<ArrowButton type="submit">Send</ArrowButton>)
  expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
})

test('RichSpan mutes marked parts and renders breaks', () => {
  const { container } = render(<RichSpan parts={[{ text: 'A', muted: true }, { br: true }, { text: 'B' }]} />)
  expect(screen.getByText('A')).toHaveClass('text-gray-500')
  expect(screen.getByText('B')).not.toHaveClass('text-gray-500')
  expect(container.querySelector('br')).not.toBeNull()
})

test('Dots marks the first N dots active', () => {
  const { container } = render(<Dots active={2} />)
  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(2)
  expect(container.querySelectorAll('[data-active="false"]')).toHaveLength(2)
})

test('SlideText renders every character twice', () => {
  render(<SlideText text="Home" />)
  expect(screen.getByLabelText('Home')).toBeInTheDocument()
  expect(screen.getAllByText('H')).toHaveLength(2)
})

test('Corners renders 4 or 2 markers', () => {
  const four = render(<Corners />).container
  expect(four.querySelectorAll('svg')).toHaveLength(4)
  const two = render(<Corners variant="2-bottom" />).container
  expect(two.querySelectorAll('svg')).toHaveLength(2)
})
