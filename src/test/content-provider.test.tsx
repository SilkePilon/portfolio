import { render, screen } from '@testing-library/react'
import { Faq } from '@/components/home/Faq'
import { ContentProvider, staticContent, useContent } from '@/components/layout/ContentProvider'
import { blogs, homeBlogs } from '@/content/blogs'
import { home, pages } from '@/content/home'
import { site } from '@/content/site'
import { works } from '@/content/works'

/** Dumps the two values the assertions care about so a plain render can read them back. */
function Probe() {
  const content = useContent()
  return (
    <>
      <span data-testid="faq-tag">{content.home.faq.tag}</span>
      <span data-testid="faq-count">{content.lists.faqs.length}</span>
    </>
  )
}

test('without a provider the context is the static content', () => {
  expect(staticContent.site).toBe(site)
  expect(staticContent.home).toBe(home)
  expect(staticContent.pages).toBe(pages)
  expect(staticContent.works).toBe(works)
  expect(staticContent.posts).toBe(blogs)
  expect(staticContent.homePosts).toBe(homeBlogs)
  expect(staticContent.lists).toEqual({
    services: home.services.rows,
    testimonials: home.testimonials.items,
    clients: home.clients.list,
    awards: home.awards.list,
    faqs: home.faq.items,
  })

  render(<Probe />)
  expect(screen.getByTestId('faq-tag')).toHaveTextContent(home.faq.tag)
  expect(screen.getByTestId('faq-count')).toHaveTextContent(String(home.faq.items.length))
})

test('a provider overrides the context for its consumers', () => {
  const value = { ...staticContent, home: { ...home, faq: { ...home.faq, tag: '(cms) Questions' } } }
  render(
    <ContentProvider value={value}>
      <Probe />
    </ContentProvider>,
  )
  expect(screen.getByTestId('faq-tag')).toHaveTextContent('(cms) Questions')
})

test('sections read their copy and their list from the provider, not from the static content', () => {
  const faqs = [{ q: 'Do you take on retainers?', a: 'Yes — monthly design retainers are available.' }]
  const value = {
    ...staticContent,
    home: { ...home, faq: { ...home.faq, tag: '(cms) Questions', outroText: 'Ask away.' } },
    lists: { ...staticContent.lists, faqs },
  }
  render(
    <ContentProvider value={value}>
      <Faq />
    </ContentProvider>,
  )

  expect(screen.getByText('(cms) Questions')).toBeInTheDocument()
  expect(screen.getByText('Ask away.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: new RegExp(faqs[0].q) })).toBeInTheDocument()
  expect(screen.queryByText(home.faq.items[0].q)).toBeNull()
})
