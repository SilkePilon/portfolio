'use client'
/**
 * Option 2 — "Terminal": a centred zsh pane replays the deploy log line by line as you scroll (0.05→0.8),
 * `$` command lines type out char by char under a blinking cursor while the list auto-scrolls so the newest
 * line stays in view. A 1px progress rule and a mono "deploying 00:38" clock tick with p. At 0.8→1 the words
 * SHIP / IT slide in from either side while the terminal shrinks to 0.92 and dims to 0.5 behind them.
 */
import { useLayoutEffect, useRef } from 'react'
import { LabOption, seg, easeOut } from '../LabOption'
import { deployLog } from './code'

const GREEN = '#7dd3a0'
const TOTAL_SECONDS = 38

function lineClass(text: string) {
  if (text.startsWith('$') || text.startsWith('→')) return 'text-white'
  if (text.startsWith('✓')) return 'text-gray-400'
  return 'text-gray-500'
}

export function Option2Terminal() {
  const lineEls = useRef<(HTMLDivElement | null)[]>([])
  const textEls = useRef<(HTMLSpanElement | null)[]>([])
  const cursor = useRef<HTMLSpanElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const terminal = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const wordA = useRef<HTMLSpanElement>(null)
  const wordB = useRef<HTMLSpanElement>(null)
  // Cached layout metrics (line height, viewport height) — measured once, invalidated on resize.
  const metrics = useRef<{ line: number; view: number } | null>(null)

  const update = (p: number) => {
    const len = deployLog.length
    const raw = seg(p, 0.05, 0.8) * len
    const n = Math.min(len, Math.floor(raw))
    const frac = raw - n
    let lastVisible = -1

    for (let i = 0; i < len; i++) {
      const el = lineEls.current[i]
      const txt = textEls.current[i]
      if (!el || !txt) continue
      const full = deployLog[i]
      let shown: string | null = null
      if (i < n) shown = full
      else if (i === n && frac > 0) {
        // Only prompt lines type; output lines land whole.
        shown = full.startsWith('$') ? full.slice(0, Math.max(1, Math.floor(frac * full.length))) : full
      }
      const visible = shown !== null
      el.style.visibility = visible ? 'visible' : 'hidden'
      if (visible) {
        lastVisible = i
        // The ✓ check is a separate accent span; only the remainder is text-sliced.
        txt.textContent = full.startsWith('✓') && shown ? shown.slice(1) : shown
      }
    }

    // Cursor sits after the newest line (or at the prompt when nothing is shown yet).
    const c = cursor.current
    if (c) {
      const host = lastVisible >= 0 ? lineEls.current[lastVisible] : lineEls.current[0]
      if (host && c.parentElement !== host) host.appendChild(c)
      const done = p >= 0.8
      c.style.opacity = done ? '0' : ''
      if (lastVisible < 0 && lineEls.current[0]) lineEls.current[0].style.visibility = 'visible'
    }

    // Auto-scroll: translate the list so the newest line stays inside the fixed-height viewport.
    if (list.current && viewport.current) {
      if (!metrics.current) {
        const first = lineEls.current[0]
        metrics.current = {
          line: first ? first.offsetHeight : 24,
          view: viewport.current.clientHeight,
        }
      }
      const { line, view } = metrics.current
      const bottom = (Math.max(lastVisible, 0) + 1) * line
      const shift = Math.max(0, bottom - view)
      list.current.style.transform = `translate3d(0, ${-shift}px, 0)`
    }

    if (fill.current) fill.current.style.transform = `scaleX(${p})`
    if (clock.current) {
      const s = Math.round(p * TOTAL_SECONDS)
      clock.current.textContent = `deploying 00:${String(s).padStart(2, '0')}`
    }

    // Finale: words slide in, terminal recedes.
    const t = easeOut(seg(p, 0.8, 1))
    if (wordA.current) wordA.current.style.transform = `translate3d(${-800 * (1 - t)}px, 0, 0)`
    if (wordB.current) wordB.current.style.transform = `translate3d(${800 * (1 - t)}px, 0, 0)`
    if (terminal.current) {
      terminal.current.style.transform = `scale(${1 - 0.08 * t})`
      terminal.current.style.opacity = String(1 - 0.5 * t)
    }
  }

  useLayoutEffect(() => {
    update(0)
    const onResize = () => {
      metrics.current = null
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LabOption id="terminal" heightVh={300} onProgress={update}>
      <style>{`@keyframes lab-term-blink{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
      <div className="relative flex w-full flex-col items-center px-5 tablet:px-10">
        {/* Terminal pane */}
        <div
          ref={terminal}
          aria-hidden
          className="w-full max-w-[900px] origin-center overflow-hidden rounded-md border border-rule bg-gray-900 will-change-transform"
        >
          <div className="flex items-center gap-2 border-b border-rule px-4 py-2.5">
            <span className="flex gap-1.5">
              <i className="block h-2.5 w-2.5 rounded-full bg-gray-800" />
              <i className="block h-2.5 w-2.5 rounded-full bg-gray-800" />
              <i className="block h-2.5 w-2.5 rounded-full bg-gray-800" />
            </span>
            <span className="flex-1 truncate text-center font-mono text-[11px] uppercase tracking-[0.05em] text-gray-500">
              silke@portfolio — zsh
            </span>
            <span className="w-[42px]" />
          </div>
          <div ref={viewport} className="h-[60vh] max-h-[560px] overflow-hidden px-4 py-3 tablet:px-6">
            <div ref={list} className="will-change-transform">
              {deployLog.map((line, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    lineEls.current[i] = el
                  }}
                  style={{ visibility: 'hidden' }}
                  className={`whitespace-pre font-mono text-[12px] leading-[1.9] tablet:text-[13px] ${lineClass(line)}`}
                >
                  {line.startsWith('✓') && <span style={{ color: GREEN }}>✓</span>}
                  <span
                    ref={(el) => {
                      textEls.current[i] = el
                    }}
                  >
                    {line.startsWith('✓') ? line.slice(1) : line || ' '}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <span
            ref={cursor}
            className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-white"
            style={{ animation: 'lab-term-blink 1s steps(1) infinite' }}
          />
        </div>

        {/* Progress rule + clock */}
        <div aria-hidden className="mt-4 w-full max-w-[900px]">
          <div className="h-px w-full bg-rule">
            <div ref={fill} className="h-px w-full origin-left bg-white will-change-transform" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[11px] uppercase tracking-[0.05em] text-gray-500">
            <span ref={clock}>deploying 00:00</span>
            <span>main → production</span>
          </div>
        </div>

        {/* Display words */}
        <h2 className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[0.25em] overflow-hidden font-display text-display text-white">
          <span ref={wordA} className="inline-block will-change-transform">
            SHIP
          </span>
          <span ref={wordB} className="inline-block will-change-transform">
            IT
          </span>
        </h2>
      </div>
    </LabOption>
  )
}
