import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Testimonials } from '@/components/home/Testimonials'
import { home } from '@/content/home'

// `AnimatePresence mode="wait"` keeps the outgoing quote mounted until its exit transition
// finishes, so assertions on the next quote/name need to wait for that swap (real timers).

test('Testimonials renders the tag, heading and the first quote/author, with all four dots present', () => {
  const { container } = render(<Testimonials />)
  expect(container.querySelector('#testimonials')).not.toBeNull()

  expect(screen.getByText(home.testimonials.tag)).toBeInTheDocument()
  expect(screen.getByText('Words That')).toBeInTheDocument()
  expect(screen.getByText('Carry Weight')).toBeInTheDocument()

  const first = home.testimonials.items[0]
  expect(screen.getByText(first.quote)).toBeInTheDocument()
  expect(screen.getByText(first.name)).toBeInTheDocument()
  expect(screen.getByText(first.role)).toBeInTheDocument()

  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(1)
})

test('clicking Next advances to the next testimonial and wraps back to the first after the last', async () => {
  render(<Testimonials />)
  const { items } = home.testimonials
  const nextButton = screen.getByRole('button', { name: /next/i })

  fireEvent.click(nextButton)
  await waitFor(() => expect(screen.getByText(items[1].quote)).toBeInTheDocument())
  expect(screen.getByText(items[1].name)).toBeInTheDocument()
  await waitFor(() => expect(screen.queryByText(items[0].quote)).not.toBeInTheDocument())

  fireEvent.click(nextButton)
  await waitFor(() => expect(screen.getByText(items[2].quote)).toBeInTheDocument())
  fireEvent.click(nextButton)
  await waitFor(() => expect(screen.getByText(items[3].quote)).toBeInTheDocument())

  fireEvent.click(nextButton)
  await waitFor(() => expect(screen.getByText(items[0].quote)).toBeInTheDocument())
})

test('clicking Prev from the first testimonial wraps to the last one', async () => {
  render(<Testimonials />)
  const { items } = home.testimonials

  fireEvent.click(screen.getByRole('button', { name: /prev/i }))
  await waitFor(() => expect(screen.getByText(items[3].quote)).toBeInTheDocument())
  expect(screen.getByText(items[3].name)).toBeInTheDocument()
})
