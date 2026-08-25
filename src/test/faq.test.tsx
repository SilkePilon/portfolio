import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Faq } from '@/components/home/Faq'
import { home } from '@/content/home'

test('Faq renders the eyebrow, heading and all 8 questions', () => {
  const { container } = render(<Faq />)
  expect(container.querySelector('#faq')).not.toBeNull()
  expect(screen.getByText(home.faq.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  expect(heading).toHaveTextContent('Frequently')
  expect(heading).toHaveTextContent('Asked Questions')

  for (const item of home.faq.items) {
    expect(screen.getByRole('button', { name: new RegExp(item.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })).toBeInTheDocument()
  }
})

test('clicking a question opens it and collapses the previously open one', async () => {
  const user = userEvent.setup()
  render(<Faq />)
  const buttons = home.faq.items.map((item) => screen.getByRole('button', { name: new RegExp(item.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }))

  for (const button of buttons) {
    expect(button).toHaveAttribute('aria-expanded', 'false')
  }

  await user.click(buttons[0])
  expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
  expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')

  await user.click(buttons[1])
  expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
  expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')

  await user.click(buttons[1])
  expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')
})

test('Faq closes with the outro heading, text and CTA', () => {
  render(<Faq />)
  expect(screen.getByText(home.faq.outroText)).toBeInTheDocument()
  const cta = screen.getByRole('link', { name: home.faq.outroCta })
  expect(cta).toHaveAttribute('href', '#contact')
})
