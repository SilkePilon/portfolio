import { render, screen, within } from '@testing-library/react'
import { BlogDetail } from '@/components/blogs/BlogDetail'
import { BlogsPreview } from '@/components/home/BlogsPreview'
import { ContentProvider, staticContent } from '@/components/layout/ContentProvider'
import { home } from '@/content/home'
import { blogs, homeBlogs } from '@/content/blogs'
import { site } from '@/content/site'

test('BlogsPreview renders the tag, heading and read-more cta', () => {
  const { container } = render(<BlogsPreview />)
  expect(container.querySelector('#blogs')).not.toBeNull()
  expect(screen.getByText(home.blogsPreview.tag)).toBeInTheDocument()
  const heading = screen.getByRole('heading', { level: 2 })
  expect(heading).toHaveTextContent('Stories')
  expect(heading).toHaveTextContent('behind the work')

  const cta = screen.getAllByRole('link').find((a) => a.getAttribute('href') === '/blogs')
  expect(cta).toBeDefined()
  expect(within(cta as HTMLElement).getAllByText(home.blogsPreview.cta).length).toBeGreaterThan(0)
})

test('BlogsPreview renders the profile card with the site profile and the profile text', () => {
  render(<BlogsPreview />)
  expect(screen.getByText(site.profile.name)).toBeInTheDocument()
  expect(screen.getByText(site.profile.role)).toBeInTheDocument()
  for (const part of home.blogsPreview.profileText) if (part.text) expect(screen.getByText(part.text.trim())).toBeInTheDocument()
})

test('BlogsPreview falls back to the static homeBlogs without a provider, linking each card', () => {
  render(<BlogsPreview />)
  for (const post of homeBlogs) {
    expect(screen.getByRole('link', { name: new RegExp(post.title) })).toHaveAttribute('href', `/blogs/${post.slug}`)
  }
})

test('BlogsPreview renders the three CMS posts from the provider instead of the static fallback', () => {
  const posts = [
    { ...homeBlogs[0], slug: 'custom-a', title: 'Custom Post A' },
    { ...homeBlogs[1], slug: 'custom-b', title: 'Custom Post B' },
    { ...homeBlogs[2], slug: 'custom-c', title: 'Custom Post C' },
  ]
  render(
    <ContentProvider value={{ ...staticContent, homePosts: posts }}>
      <BlogsPreview />
    </ContentProvider>,
  )
  for (const post of posts) {
    expect(screen.getByRole('link', { name: new RegExp(post.title) })).toHaveAttribute('href', `/blogs/${post.slug}`)
  }
  expect(screen.queryByText(homeBlogs[0].title)).toBeNull()
})

test('BlogDetail renders the provider copy for its slug, not the server prop (live preview)', () => {
  const [post, ...rest] = blogs
  const edited = { ...post, title: '(cms) Edited While Typing' }
  render(
    <ContentProvider value={{ ...staticContent, posts: [edited, ...rest] }}>
      <BlogDetail post={post} next={rest.slice(0, 2)} />
    </ContentProvider>,
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('(cms) Edited While Typing')
  expect(screen.queryByRole('heading', { level: 1, name: post.title })).toBeNull()
})

test('BlogDetail looks the next cards up in the provider as well', () => {
  const [post, second, third] = blogs
  const editedSecond = { ...second, title: '(cms) Next Story' }
  render(
    <ContentProvider value={{ ...staticContent, posts: [post, editedSecond, third] }}>
      <BlogDetail post={post} next={[second, third]} />
    </ContentProvider>,
  )
  expect(screen.getByRole('link', { name: new RegExp('\\(cms\\) Next Story') })).toBeInTheDocument()
})
