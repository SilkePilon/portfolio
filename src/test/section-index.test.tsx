import { act, render, screen } from '@testing-library/react'
import { SectionIndex } from '@/components/layout/SectionIndex'
import { Section } from '@/components/ui/Section'

function Page({ labels }: { labels: [string, string][] }) {
  return (
    <>
      <main>
        <Section id="hero">no index</Section>
        {labels.map(([id, label]) => (
          <Section key={id} id={id} index={label}>
            {label}
          </Section>
        ))}
        <Section index="Unlinkable">missing id</Section>
      </main>
      <SectionIndex />
    </>
  )
}

test('the index lists the indexed sections of the mounted page in DOM order', () => {
  render(<Page labels={[['about', 'About'], ['works', 'Works'], ['contact', 'Contact']]} />)
  const nav = screen.getByRole('navigation', { name: 'Sections' })
  const links = Array.from(nav.querySelectorAll('a'))
  expect(links.map((a) => a.getAttribute('href'))).toEqual(['#about', '#works', '#contact'])
  expect(nav.textContent).toContain('About')
  expect(nav.textContent).toContain('Works')
  expect(nav.textContent).toContain('Contact')
  // Sections without `index` (hero) or without an `id` (unlinkable) stay out of the list.
  expect(links).toHaveLength(3)
  expect(links.map((a) => a.querySelector('span')?.nextElementSibling?.textContent)).toEqual(['01', '02', '03'])
  expect(links[0]).toHaveAttribute('aria-current', 'true')
})

test('the index hides itself on pages with fewer than two sections', () => {
  render(<Page labels={[['about', 'About']]} />)
  expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull()
})

test('the index picks up sections mounted after the first paint', async () => {
  const { rerender } = render(<Page labels={[['about', 'About']]} />)
  expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull()
  rerender(<Page labels={[['about', 'About'], ['faq', 'FAQ']]} />)
  await act(async () => {
    await new Promise((r) => requestAnimationFrame(() => r(null)))
  })
  const nav = screen.getByRole('navigation', { name: 'Sections' })
  expect(Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'))).toEqual(['#about', '#faq'])
})
