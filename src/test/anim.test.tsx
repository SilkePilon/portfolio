import { act, render, screen } from '@testing-library/react'
import { Appear } from '@/components/anim/Appear'
import { Counter } from '@/components/anim/Counter'
import { Preloader } from '@/components/layout/Preloader'
import { site } from '@/content/site'

test('Counter starts at zero with prefix/suffix', () => {
  render(<Counter end={62} suffix="+" />)
  expect(screen.getByText('0+')).toBeInTheDocument()
})

test('Appear renders its children', () => {
  render(
    <Appear preset="left" as="section">
      <p>hello</p>
    </Appear>,
  )
  expect(screen.getByText('hello')).toBeInTheDocument()
})

test('Preloader shows four panels and the brand name, then unmounts', () => {
  vi.useFakeTimers()
  render(
    <>
      <Preloader />
    </>,
  )
  const overlay = screen.getByTestId('preloader')
  expect(overlay.querySelectorAll('.bg-white')).toHaveLength(4)
  expect(screen.getAllByText(site.name[0]).length).toBeGreaterThanOrEqual(1)
  act(() => {
    vi.advanceTimersByTime(2500)
  })
  expect(screen.queryByTestId('preloader')).toBeNull()
  vi.useRealTimers()
})
