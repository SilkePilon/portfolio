'use client'
/**
 * Option 10 — "Layers". A page is built from five stacked cards (background, grid, media, content, chrome).
 * p 0→0.4 the stack tilts into an exploded isometric view with each layer lifted along Z and a mono side label;
 * p 0.55→0.85 it holds with a slow drift; p 0.85→1 it flattens back into the assembled page while the display
 * words LAYER / BY LAYER slide in from above and below.
 */
import { useLayoutEffect, useRef } from 'react'
import { LabOption, seg, lerp, easeOut, easeInOut } from '../LabOption'

const LABELS = ['01 background', '02 grid', '03 media', '04 content', '05 chrome']
const CARD = { width: 'min(900px, 90vw)', height: 'min(560px, 56vh)' } as const

/** Diagonal placeholder line for a media block. */
function Diag({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 100 100" preserveAspectRatio="none" data-diag>
      <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,.25)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Option10Layers() {
  const group = useRef<HTMLDivElement>(null)
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const diags = useRef<HTMLDivElement>(null)
  const top = useRef<HTMLSpanElement>(null)
  const bottom = useRef<HTMLSpanElement>(null)

  const apply = (p: number) => {
    const g = group.current
    if (!g) return
    const explode = easeInOut(seg(p, 0, 0.4))
    const flatten = easeInOut(seg(p, 0.85, 1))
    const amount = explode * (1 - flatten)
    const step = typeof window !== 'undefined' && window.innerWidth < 810 ? 70 : 110
    const rz = lerp(-35, -25, seg(p, 0.55, 0.85))
    g.style.transform = `rotateX(${55 * amount}deg) rotateZ(${rz * amount}deg)`

    const labelA = seg(p, 0.35, 0.55) * (1 - seg(p, 0.85, 0.95))
    layers.current.forEach((el, i) => {
      if (el) el.style.transform = `translateZ(${i * step * amount}px)`
      const lb = labels.current[i]
      if (lb) lb.style.opacity = String(labelA)
    })
    if (diags.current) diags.current.style.opacity = String(1 - 0.6 * flatten)

    const w = easeOut(seg(p, 0.85, 1))
    const t = top.current
    const b = bottom.current
    if (t && b) {
      t.style.transform = `translateY(${-700 * (1 - w)}px)`
      b.style.transform = `translateY(${700 * (1 - w)}px)`
      t.style.opacity = b.style.opacity = String(w)
    }
  }

  useLayoutEffect(() => apply(0), [])

  const layerBase = 'absolute inset-0 rounded-[6px] will-change-transform [backface-visibility:hidden]'
  const label = (i: number) => (
    <div
      ref={(el) => {
        labels.current[i] = el
      }}
      aria-hidden
      className="absolute top-1/2 left-full flex -translate-y-1/2 items-center gap-3 whitespace-nowrap font-mono text-[11px] tracking-[0.05em] text-gray-500 uppercase opacity-0"
    >
      <span className="block h-px w-10 bg-white/25 tablet:w-16" />
      {LABELS[i]}
    </div>
  )

  return (
    <LabOption id="layers" heightVh={350} onProgress={apply}>
      <div className="relative" style={{ perspective: '1600px', ...CARD }}>
        <span
          ref={top}
          className="text-display pointer-events-none absolute bottom-full left-0 mb-4 whitespace-nowrap opacity-0 will-change-transform tablet:mb-6"
        >
          Layer
        </span>
        <span
          ref={bottom}
          className="text-display pointer-events-none absolute top-full right-0 mt-4 whitespace-nowrap opacity-0 will-change-transform tablet:mt-6"
        >
          By layer
        </span>

        <div ref={group} aria-hidden className="absolute inset-0 will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
          {/* L1 background */}
          <div ref={(el) => { layers.current[0] = el }} className={`${layerBase} border border-rule bg-gray-900`}>
            {label(0)}
          </div>

          {/* L2 grid */}
          <div ref={(el) => { layers.current[1] = el }} className={`${layerBase} overflow-visible`}>
            <div className="absolute inset-0 overflow-hidden rounded-[6px]">
              {[20, 40, 60, 80].map((x) => (
                <span key={x} className="absolute top-0 bottom-0 w-px bg-rule" style={{ left: `${x}%` }} />
              ))}
              {[33, 66].map((y) => (
                <span key={y} className="absolute right-0 left-0 h-px bg-rule" style={{ top: `${y}%` }} />
              ))}
            </div>
            {label(1)}
          </div>

          {/* L3 media */}
          <div ref={(el) => { layers.current[2] = el }} className={layerBase}>
            <div ref={diags} className="absolute inset-0">
              <div className="absolute top-[38%] right-[6%] h-[28%] w-[34%] overflow-hidden rounded-[4px] bg-gray-800">
                <Diag className="absolute inset-0 h-full w-full" />
              </div>
              <div className="absolute bottom-[10%] left-[6%] h-[22%] w-[26%] overflow-hidden rounded-[4px] bg-gray-800">
                <Diag className="absolute inset-0 h-full w-full" />
              </div>
            </div>
            {label(2)}
          </div>

          {/* L4 content */}
          <div ref={(el) => { layers.current[3] = el }} className={layerBase}>
            <div className="absolute top-[22%] left-[6%] flex w-[40%] flex-col gap-4">
              <span className="font-display text-[36px] leading-none font-medium tracking-[-0.02em] text-white uppercase tablet:text-[48px]">
                Elian
              </span>
              <div className="flex flex-col gap-2">
                <span className="block h-2 w-full rounded-full bg-gray-500/60" />
                <span className="block h-2 w-[82%] rounded-full bg-gray-500/60" />
                <span className="block h-2 w-[58%] rounded-full bg-gray-500/60" />
              </div>
              <span className="font-mono text-[11px] tracking-[0.05em] text-gray-500 uppercase">
                Portfolio &mdash; 2026
              </span>
            </div>
            {label(3)}
          </div>

          {/* L5 chrome */}
          <div ref={(el) => { layers.current[4] = el }} className={layerBase}>
            <div className="absolute top-[6%] right-[6%] left-[6%] flex items-center justify-between font-mono text-[11px] tracking-[0.05em] text-gray-400 uppercase">
              <span className="text-white">EK</span>
              <span className="hidden gap-6 tablet:flex">
                <span>Works</span>
                <span>About</span>
                <span>Journal</span>
              </span>
              <span className="rounded-full border border-white/30 px-3 py-1 text-white">Contact</span>
            </div>
            {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos) => (
              <span key={pos} className={`absolute ${pos} font-mono text-[12px] leading-none text-gray-500`}>
                +
              </span>
            ))}
            {label(4)}
          </div>
        </div>
      </div>
    </LabOption>
  )
}
