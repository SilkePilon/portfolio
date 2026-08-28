'use client'
/**
 * Option 7 — "Deck". Three app windows (browser / editor / terminal) rise from below as one stack (p 0→0.35),
 * fan out in 3D — outer cards swing back and sideways, the editor holds centre (p 0.35→0.75) — then settle
 * into a tidy 24px cascade while DESIGN / BUILD slide in from the sides (p 0.75→1).
 *
 * Desktop: the words sit top-left / bottom-right, 320px behind the cards, sliding in from ±700px.
 * Phone (<810px): the words are centred above / below the stack (clear of the 24px cascade), at z 0 so the
 * perspective can't shove them off-screen, and they slide in from ±100vw so the resting translateX is 0 —
 * the desktop offsets assumed a wide viewport and left only a sliver of DESIGN visible at 390px.
 */
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { LabOption, seg, lerp, easeOut, easeInOut } from '../LabOption'
import { hookSnippet, deployLog } from './code'

const KEYWORDS = new Set(['export', 'function', 'const', 'return', 'true'])
const ACCENT = '#7dd3a0'

/** Keywords white, calls in the single accent, punctuation dim, everything else grey. */
function colourLine(line: string, key: number) {
  const re = /([A-Za-z_$][\w$]*)(?=\()|([A-Za-z_$][\w$]*)|(\s+)|(.)/g
  const parts: ReactNode[] = []
  for (const m of line.matchAll(re)) {
    const t = m[0]
    const color = m[1] ? ACCENT : m[2] ? (KEYWORDS.has(t) ? '#ffffff' : '#c4c4c4') : m[3] ? undefined : '#7a7a7a'
    parts.push(
      <span key={`${key}-${m.index}`} style={{ color }}>
        {t}
      </span>,
    )
  }
  return parts
}

function Window({ title, cardRef, children }: { title: string; cardRef: React.Ref<HTMLDivElement>; children: ReactNode }) {
  return (
    <div
      ref={cardRef}
      aria-hidden
      className="absolute flex flex-col overflow-hidden rounded-[8px] border border-rule bg-gray-900"
      style={{ width: 'min(760px, 88vw)', aspectRatio: '16 / 10', willChange: 'transform', backfaceVisibility: 'hidden' }}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-rule px-3 py-2">
        <span className="size-2 rounded-full bg-gray-500/60" />
        <span className="size-2 rounded-full bg-gray-500/60" />
        <span className="size-2 rounded-full bg-gray-500/60" />
        <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.05em] text-gray-500">{title}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  )
}

export function Option7Deck() {
  const cards = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const left = useRef<HTMLSpanElement>(null)
  const right = useRef<HTMLSpanElement>(null)
  const phone = useRef(false)

  const apply = (p: number) => {
    const enter = easeOut(seg(p, 0, 0.35))
    const fan = easeInOut(seg(p, 0.35, 0.75))
    const stack = easeInOut(seg(p, 0.75, 1))
    const fanX = phone.current ? 18 : 28
    const fanZ = phone.current ? -140 : -220
    // Cascade levels: terminal front, editor middle, browser back.
    const level = [2, 1, 0]

    cards.current.forEach((el, i) => {
      if (!el) return
      const side = i === 0 ? -1 : i === 2 ? 1 : 0
      // Fan targets (outer cards swing out, centre card grows a touch).
      const fx = side * fanX * fan
      const fz = side ? fanZ * fan : 0
      const ry = side * 14 * fan
      const fs = side ? 1 : 1 + 0.02 * fan
      // Cascade targets, centred on the middle level.
      const l = level[i]!
      const cx = (1 - l) * 24
      const cy = (1 - l) * 24
      const cz = -60 * l
      const x = `calc(${lerp(fx, 0, stack)}% + ${lerp(0, cx, stack)}px)`
      const y = lerp(60, 0, enter) + 'vh'
      const yPx = lerp(0, cy, stack)
      const z = lerp(fz, cz, stack) - i * 0.5
      el.style.transform =
        `translate3d(${x}, calc(${y} + ${yPx}px), ${z}px) rotateX(${12 * (1 - enter)}deg) ` +
        `rotateY(${lerp(ry, 0, stack)}deg) scale(${lerp(fs, 1, stack)})`
    })

    const l = left.current
    const r = right.current
    if (l && r) {
      const dist = phone.current ? window.innerWidth : 700
      const depth = phone.current ? 0 : -320
      l.style.transform = `translate3d(${-dist * (1 - stack)}px, 0, ${depth}px)`
      r.style.transform = `translate3d(${dist * (1 - stack)}px, 0, ${depth}px)`
      l.style.opacity = r.style.opacity = String(stack)
    }
  }

  useLayoutEffect(() => {
    const mq = window.matchMedia('(max-width: 809px)')
    const sync = () => {
      phone.current = mq.matches
    }
    sync()
    mq.addEventListener('change', sync)
    apply(0)
    return () => mq.removeEventListener('change', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setCard = (i: number) => (el: HTMLDivElement | null) => {
    cards.current[i] = el
  }
  const lines = hookSnippet.split('\n')
  const log = deployLog.slice(-6)

  return (
    <LabOption id="deck" heightVh={350} onProgress={apply}>
      <div className="relative flex h-full w-full items-center justify-center" style={{ perspective: '1400px' }}>
        <div className="relative flex h-full w-full items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
          <span
            ref={left}
            className="text-display absolute inset-x-0 bottom-[calc(50%+27.5vw+40px)] whitespace-nowrap text-center text-white will-change-transform tablet:inset-x-auto tablet:bottom-auto tablet:left-[4vw] tablet:top-[6vh] tablet:text-left"
          >
            Design
          </span>
          <span
            ref={right}
            className="text-display absolute inset-x-0 top-[calc(50%+27.5vw+40px)] whitespace-nowrap text-center text-white will-change-transform tablet:inset-x-auto tablet:top-auto tablet:bottom-[6vh] tablet:right-[4vw] tablet:text-right"
          >
            Build
          </span>

          <Window title="silkepilon.dev" cardRef={setCard(0)}>
            <div
              className="absolute inset-0 bg-black"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
                backgroundSize: '25% 25%',
              }}
            >
              <div className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.05em] text-gray-500">
                Elian Kent — Portfolio
              </div>
              <div className="font-display absolute bottom-4 left-4 text-[clamp(56px,12vw,150px)] font-medium uppercase leading-none tracking-[-0.03em] text-white">
                Elian
              </div>
            </div>
          </Window>

          <Window title="use-scrub.ts" cardRef={setCard(1)}>
            <pre className="absolute inset-0 overflow-hidden p-4 font-mono text-[11px] leading-[1.7] tablet:text-[13px]">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-7 shrink-0 select-none text-right pr-3 text-gray-500">{i + 1}</span>
                  <span>{colourLine(line, i)}</span>
                </div>
              ))}
            </pre>
          </Window>

          <Window title="zsh — deploy" cardRef={setCard(2)}>
            <pre className="absolute inset-0 overflow-hidden p-4 font-mono text-[11px] leading-[1.8] text-gray-400 tablet:text-[13px]">
              {log.map((line, i) => (
                <div key={i} className={line.startsWith('$') ? 'text-white' : undefined}>
                  {line.startsWith('→') ? <span style={{ color: ACCENT }}>{line}</span> : line || ' '}
                </div>
              ))}
              <div className="mt-1 inline-block h-[1.1em] w-[0.6em] translate-y-[2px] bg-white/80" />
            </pre>
          </Window>
        </div>
      </div>
    </LabOption>
  )
}
