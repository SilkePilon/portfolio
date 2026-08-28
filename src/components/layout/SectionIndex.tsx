'use client'
import type { MouseEvent } from 'react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { getLenis } from '@/lib/lenis'

type Item = { id: string; label: string }

/** Sections of the page currently in the DOM, in document order. A section needs an `id` to be linkable. */
function readSections(): Item[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-index]'))
    .filter((el) => el.id)
    .map((el) => ({ id: el.id, label: el.dataset.index ?? '' }))
}

const keyOf = (items: Item[]) => items.map((i) => `${i.id}:${i.label}`).join('|')

/**
 * Fixed right-hand section index: `01 ——`, `02 ——` … with the active row white and longer, the
 * section name on hover. The rows are derived from `[data-index]` elements in the DOM (see the
 * `index` prop of `Section`), so every route gets its own list without a hardcoded map; the list
 * re-reads on route changes and on DOM mutations (late-mounted sections, live-preview edits).
 * Renders nothing until the client effect has run, and nothing for pages with fewer than 2 sections.
 */
export function SectionIndex() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState(0)
  const [light, setLight] = useState(false)
  const [overFooter, setOverFooter] = useState(false)

  useEffect(() => {
    let raf = 0
    const sync = () => {
      const next = readSections()
      setItems((prev) => (keyOf(prev) === keyOf(next) ? prev : next))
    }
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(sync)
    }
    setActive(0)
    setLight(false)
    sync()
    const main = document.querySelector('main')
    const mo = main ? new MutationObserver(schedule) : null
    if (main && mo) mo.observe(main, { childList: true, subtree: true })
    return () => {
      cancelAnimationFrame(raf)
      mo?.disconnect()
    }
  }, [pathname])

  useEffect(() => {
    if (items.length < 2) return
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => !!el)
    // The row lights up for the section crossing the 45% viewport line, the same rule the lab index used.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    // A short last section may never reach the line; at the bottom of the page it is always the one.
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) setActive(items.length - 1)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [items])

  // The rows sit on top of the page, so they take the colours of whatever is behind them: white on the
  // dark sections, black on the #ededed ones. Read from the point the nav covers, not from the active
  // section — the two differ inside sections that carry no index. The nav also steps aside for the
  // footer, which fills the right column with its own text.
  useEffect(() => {
    if (items.length < 2) return
    let raf = 0
    const read = () => {
      raf = 0
      const at = document.elementsFromPoint?.(window.innerWidth - 40, window.innerHeight / 2) ?? []
      const behind = at.find((el) => !el.closest('nav[aria-label="Sections"]'))
      setLight(!!behind?.closest('.theme-light'))
      const footer = document.querySelector('footer')
      setOverFooter(!!footer && footer.getBoundingClientRect().top < window.innerHeight / 2 + 120)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [items.length])

  if (items.length < 2) return null

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: -70 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Sections"
      className={cn(
        'fixed top-1/2 right-5 z-20 hidden -translate-y-1/2 flex-col gap-2 transition-opacity duration-300 desktop:flex',
        overFooter && 'pointer-events-none opacity-0',
      )}
    >
      {items.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          onClick={(e) => go(e, item.id)}
          aria-current={i === active ? 'true' : undefined}
          className={cn(
            'group flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors',
            i === active ? (light ? 'text-black' : 'text-white') : light ? 'text-gray-500 hover:text-gray-800' : 'text-gray-500 hover:text-gray-300',
          )}
        >
          <span className="opacity-0 transition-opacity group-hover:opacity-100">{item.label}</span>
          <span className="w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
          <span className={cn('h-px w-6 transition-all', light ? 'bg-black' : 'bg-white', i === active ? 'w-10 opacity-100' : 'opacity-30')} />
        </a>
      ))}
    </nav>
  )
}
