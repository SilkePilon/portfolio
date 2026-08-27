import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { ContentProvider, staticContent, useContent } from '@/components/layout/ContentProvider'
import { LivePreviewBridge } from '@/components/layout/LivePreviewBridge'
import { home } from '@/content/home'

function Probe() {
  return <span data-testid="faq-tag">{useContent().home.faq.tag}</span>
}

/** Pretends the page is framed by the admin (the bridge is a no-op in a top-level window). */
function framePage() {
  const postMessage = vi.fn()
  Object.defineProperty(window, 'parent', { value: { postMessage }, configurable: true })
  return postMessage
}

/** The populated document Payload answers `mergeData`'s POST with. */
function mockPayload(doc: Record<string, unknown>) {
  const fetchMock = vi.fn().mockResolvedValue({ json: async () => doc })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const sendMessage = (data: Record<string, unknown>) =>
  window.dispatchEvent(new MessageEvent('message', { data, origin: window.location.origin }))

afterEach(() => {
  Object.defineProperty(window, 'parent', { value: window, configurable: true })
  vi.unstubAllGlobals()
})

test('a message from the admin populates the document and patches the content', async () => {
  framePage()
  const fetchMock = mockPayload({ updatedAt: 'x', faq: { tag: '(preview) Questions' } })

  render(
    <ContentProvider value={staticContent}>
      <LivePreviewBridge />
      <Probe />
    </ContentProvider>,
  )
  sendMessage({ type: 'payload-live-preview', globalSlug: 'home', data: { faq: { tag: '(preview) Questions' } } })

  await waitFor(() => expect(screen.getByTestId('faq-tag')).toHaveTextContent('(preview) Questions'))
  expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/globals/home', expect.objectContaining({ method: 'POST' }))
})

test('the bridge announces itself to the admin window and ignores foreign messages', async () => {
  const postMessage = framePage()
  mockPayload({ updatedAt: 'x', faq: { tag: 'should not be applied' } })

  render(
    <ContentProvider value={staticContent}>
      <LivePreviewBridge />
      <Probe />
    </ContentProvider>,
  )
  expect(postMessage).toHaveBeenCalledWith({ type: 'payload-live-preview', ready: true }, 'http://localhost:3000')

  window.dispatchEvent(new MessageEvent('message', { data: { type: 'payload-live-preview', globalSlug: 'home', data: {} }, origin: 'https://evil.test' }))
  sendMessage({ type: 'something-else', globalSlug: 'home', data: {} })

  await waitFor(() => expect(screen.getByTestId('faq-tag')).toHaveTextContent(home.faq.tag))
  expect(fetch).not.toHaveBeenCalled()
})

test('outside an iframe the bridge does nothing', () => {
  const fetchMock = mockPayload({ updatedAt: 'x' })
  render(
    <ContentProvider value={staticContent}>
      <LivePreviewBridge />
      <Probe />
    </ContentProvider>,
  )
  sendMessage({ type: 'payload-live-preview', globalSlug: 'home', data: { faq: { tag: 'nope' } } })
  expect(fetchMock).not.toHaveBeenCalled()
  expect(screen.getByTestId('faq-tag')).toHaveTextContent(home.faq.tag)
})
