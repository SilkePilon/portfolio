import { render, screen } from '@testing-library/react'
import { ShowcaseReel } from '@/components/home/ShowcaseReel'
import { home } from '@/content/home'

test('ShowcaseReel renders both reel words', () => {
  render(<ShowcaseReel />)
  for (const word of home.reel.words) expect(screen.getByText(word)).toBeInTheDocument()
})

test('ShowcaseReel plays the showcase video muted, looping and inline', () => {
  const { container } = render(<ShowcaseReel />)
  const video = container.querySelector('video')
  expect(video).toHaveAttribute('src', home.reel.video)
  expect(video).toHaveAttribute('loop')
  expect(video).toHaveAttribute('autoplay')
  expect(video).toHaveAttribute('playsinline')
  expect(video?.muted).toBe(true)
})

test('ShowcaseReel is a sticky frame over a 300vh scroll spacer', () => {
  const { container } = render(<ShowcaseReel />)
  const section = container.querySelector('#reel')
  expect(section).toBeInTheDocument()
  const frame = section?.querySelector('.sticky')
  expect(frame).toHaveClass('h-screen')
  expect(section?.querySelector('#text-trigger')).toHaveClass('h-[300vh]')
})

test('ShowcaseReel renders the resting state in the test environment', () => {
  const { container } = render(<ShowcaseReel />)
  expect(container.querySelectorAll('[style*="transform"]')).toHaveLength(0)
})
