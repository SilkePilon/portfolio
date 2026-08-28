'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { Option1Editor } from './options/Option1Editor'
import { Option2Terminal } from './options/Option2Terminal'
import { Option3GitGraph } from './options/Option3GitGraph'
import { Option4Mesh } from './options/Option4Mesh'
import { Option5Network } from './options/Option5Network'
import { Option6Pipeline } from './options/Option6Pipeline'
import { Option7Deck } from './options/Option7Deck'
import { Option8Glyphs } from './options/Option8Glyphs'
import { Option9Iso } from './options/Option9Iso'
import { Option10Layers } from './options/Option10Layers'

export const labOptions = [
  { id: 'editor', name: 'Editor typewriter', note: 'Editor window grows in, TypeScript types itself line by line.', Component: Option1Editor },
  { id: 'terminal', name: 'Terminal deploy', note: 'git push → build → deploy log streams; SHIP / IT slide in.', Component: Option2Terminal },
  { id: 'gitgraph', name: 'Git graph', note: 'Branches draw, merge, commits pop.', Component: Option3GitGraph },
  { id: 'mesh', name: 'Wireframe mesh', note: 'three.js wireframe explodes into points and reforms.', Component: Option4Mesh },
  { id: 'network', name: 'Node network', note: 'Particles link into a graph, pulses travel the edges.', Component: Option5Network },
  { id: 'pipeline', name: 'Request pipeline', note: 'Client → Edge → API → DB, packets in flight, latency ticks.', Component: Option6Pipeline },
  { id: 'deck', name: 'Window deck', note: 'Browser, editor and terminal cards fan out with parallax.', Component: Option7Deck },
  { id: 'glyphs', name: 'Glyph field', note: 'Monospace noise resolves into SHOW / CASE.', Component: Option8Glyphs },
  { id: 'iso', name: 'Isometric build', note: 'Blocks stack into an architecture diagram.', Component: Option9Iso },
  { id: 'layers', name: 'Exploded UI', note: 'A working deploy dashboard (click it) explodes into backend, state, layout, component and interaction layers.', Component: Option10Layers },
]

/** Lab page: every showcase candidate stacked, with a fixed index to jump between them. Temporary — delete after choosing. */
export function ShowcaseLab() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-lab-option]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(els.indexOf(e.target as HTMLElement))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-clip bg-black text-white">
      <header className="flex min-h-[60vh] flex-col justify-end px-2.5 pb-16 tablet:px-5">
        <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-gray-500">Lab · showcase section candidates</p>
        <h1 className="text-h2 mt-4">
          <span className="text-gray-500">Ten ways to</span>
          <br />
          replace the reel
        </h1>
        <p className="mt-6 max-w-[520px] text-[16px] leading-[1.5] text-gray-400">
          Scroll. Each candidate is a sticky stage driven by scroll position, the same mechanism the current video uses. Pick a number, the rest gets deleted.
        </p>
      </header>

      <nav aria-label="Options" className="fixed top-1/2 right-2.5 z-50 hidden -translate-y-1/2 flex-col gap-2 tablet:right-5 tablet:flex">
        {labOptions.map((o, i) => (
          <a
            key={o.id}
            href={`#${o.id}`}
            className={cn(
              'group flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.05em] transition-colors',
              i === active ? 'text-white' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            <span className="opacity-0 transition-opacity group-hover:opacity-100">{o.name}</span>
            <span className="w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
            <span className={cn('h-px w-6 bg-white transition-all', i === active ? 'w-10 opacity-100' : 'opacity-30')} />
          </a>
        ))}
      </nav>

      {labOptions.map((o, i) => (
        <div key={o.id}>
          <div className="flex items-baseline gap-4 border-t border-rule px-2.5 pt-4 pb-10 font-mono text-[13px] uppercase tracking-[0.05em] tablet:px-5">
            <span className="text-white">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-white">{o.name}</span>
            <span className="text-gray-500 normal-case tracking-normal">{o.note}</span>
          </div>
          <o.Component />
        </div>
      ))}

      <footer className="px-2.5 py-24 font-mono text-[13px] text-gray-500 tablet:px-5">End of lab.</footer>
    </div>
  )
}
