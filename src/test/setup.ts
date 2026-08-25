import '@testing-library/jest-dom/vitest'

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
  root = null
  rootMargin = ''
  thresholds = []
}

globalThis.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver
globalThis.IntersectionObserver = ObserverStub as unknown as typeof IntersectionObserver

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })) as typeof window.matchMedia
}

window.scrollTo = (() => {}) as typeof window.scrollTo
Object.defineProperty(HTMLMediaElement.prototype, 'play', { configurable: true, value: () => Promise.resolve() })
Object.defineProperty(HTMLMediaElement.prototype, 'pause', { configurable: true, value: () => {} })
