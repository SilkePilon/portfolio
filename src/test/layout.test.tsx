import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from '@/App'

const at = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

test('navbar and footer render on the home route', async () => {
  at('/')
  expect(await screen.findByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  for (const label of ['Home', 'About', 'Works', 'Blogs', 'Contact']) expect(screen.getAllByLabelText(label).length).toBeGreaterThan(0)
  expect(screen.getAllByText('Book a Call').length).toBeGreaterThan(0)
  expect(screen.getByText('Follow on')).toBeInTheDocument()
  expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
})

test('unknown routes render the 404 page', async () => {
  at('/nope')
  expect(await screen.findByText('404')).toBeInTheDocument()
  expect(screen.getAllByText('Back to Home').length).toBeGreaterThan(0)
})

test('work detail renders the work title', async () => {
  at('/works/zayla')
  expect(await screen.findByRole('heading', { name: 'Zayla' })).toBeInTheDocument()
})
