'use client'
/**
 * The four non-interactive sheets of the exploded stack. Each fills its layer (absolute inset-0), draws a
 * hairline sheet frame so the 3D stack reads, and keeps its content in the band that stays clear of the
 * opaque app layer above it (lower sheets are offset further down the screen, so content hangs to the bottom).
 */
import { useLayoutEffect, useState, type RefObject } from 'react'
import { deployRouteLines, deployRoutePath, eventStream } from './code'
import { stateJson, type AppState } from './state'
import { ACCENT } from './ui'

export type LocalRect = { x: number; y: number; w: number; h: number; key: string }

/**
 * Box of `node` relative to `root` in *layout* coordinates. Walking offsetLeft/offsetTop instead of
 * getBoundingClientRect keeps the numbers correct while the stack is rotated and scaled.
 */
function offsetIn(node: HTMLElement, root: HTMLElement): LocalRect {
  let x = 0
  let y = 0
  let n: HTMLElement | null = node
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight, key: node.dataset.ix ?? '' }
}

/** Measure every `selector` match inside `root`; re-runs when `dep` changes (tab switches) and on resize. */
export function useLocalRects(root: RefObject<HTMLElement | null>, selector: string, dep: unknown): LocalRect[] {
  const [rects, setRects] = useState<LocalRect[]>([])
  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setRects(Array.from(el.querySelectorAll<HTMLElement>(selector), (n) => offsetIn(n, el)))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [root, selector, dep])
  return rects
}

/** Every sheet is a bare hairline frame so the ones underneath stay readable; content sits in its own panel. */
const FRAME = 'absolute inset-0 rounded-[8px] border border-white/15 bg-white/[0.012]'
const PANEL = 'flex flex-col overflow-hidden rounded-[6px] border border-white/10 bg-[#080808]'
const MICRO = 'font-mono text-[10px] leading-none tracking-[0.06em] uppercase'

/** `01 backend` — the Route Handler the Deploy button posts to. Bottom-anchored: the top of the sheet is behind the app. */
export function CodeLayer() {
  return (
    <div className="absolute inset-0">
      <div className={FRAME} />
      <div
        className={`${PANEL} absolute top-[57%] right-[3%] bottom-[3%] left-[3%] justify-end p-3 tablet:top-[4%] tablet:right-auto tablet:bottom-[4%] tablet:w-[57%]`}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 pb-2">
          <span className={`${MICRO} rounded-[4px] border border-white/10 px-1.5 py-1 text-gray-400`}>POST</span>
          <span className="font-mono text-[11px] text-gray-300">{deployRoutePath}</span>
        </div>
        <div
          className="mt-2 font-mono text-[9px] leading-[1.45] tablet:text-[11px]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent 0, #000 42px)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 42px)' }}
        >
          {deployRouteLines.map((tokens, i) => (
            <div key={i} className="flex gap-3 whitespace-pre">
              <span className="w-4 shrink-0 text-right text-[#3d3d3d]">{i + 1}</span>
              <span>
                {tokens.map((t, j) => (
                  <span key={j} style={{ color: t.color }}>
                    {t.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${PANEL} absolute right-[3%] bottom-[4%] hidden h-[36%] w-[29%] p-3 tablet:flex`}>
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 pb-2">
          <span className={`${MICRO} rounded-[4px] border border-white/10 px-1.5 py-1`} style={{ color: ACCENT }}>
            200
          </span>
          <span className="font-mono text-[11px] text-gray-300">text/event-stream</span>
        </div>
        <div className="mt-2 font-mono text-[10px] leading-[1.7] text-gray-400">
          {eventStream.map((l) => (
            <div key={l} className="truncate">
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Colour one line of the JSON dump: key grey, string accent, everything else white/grey. */
function JsonLine({ line }: { line: string }) {
  const m = /^(\s*)(?:"([\w]+)":\s*)?(.*)$/.exec(line)
  if (!m) return <div>{line}</div>
  const [, indent, key, rest] = m
  const value = rest ?? ''
  const isString = value.startsWith('"')
  const isPunct = /^[{}[\],]*$/.test(value)
  return (
    <div className="whitespace-pre">
      {indent}
      {key && <span className="text-gray-500">&quot;{key}&quot;</span>}
      {key && <span className="text-[#5f5f5f]">: </span>}
      <span style={{ color: isString ? ACCENT : isPunct ? '#5f5f5f' : '#ffffff' }}>{value}</span>
    </div>
  )
}

/** `02 state` — the live React state, printed. Changing a switch changes this text. */
export function StateLayer({ state }: { state: AppState }) {
  const lines = stateJson(state).split('\n')
  return (
    <div className="absolute inset-0">
      <div className={FRAME} />
      <div
        className={`${PANEL} absolute top-[45%] right-[3%] left-[3%] h-[30%] p-3 tablet:top-auto tablet:bottom-[4%] tablet:left-auto tablet:h-auto tablet:w-[34%]`}
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 pb-2">
          <span className={`${MICRO} rounded-[4px] border border-white/10 px-1.5 py-1 text-gray-400`}>useState</span>
          <span className="font-mono text-[11px] text-gray-300">app.state</span>
        </div>
        <div className="mt-2 font-mono text-[9px] leading-[1.5] text-white tablet:text-[11px]">
          {lines.map((l, i) => (
            <JsonLine key={i} line={l} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** `03 layout` — every `data-skel` box of the real UI, traced as a 1px rectangle. */
export function SkeletonLayer({ rects }: { rects: LocalRect[] }) {
  const sidebar = rects.length && rects[0].h > 200 ? rects[0].w : 0
  return (
    <div className="absolute inset-0">
      <div className={FRAME} />
      {rects.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-[6px] border border-white/40"
          style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
        />
      ))}
      {/* Dimension guide along the bottom edge — the part of this sheet that stays clear of the app */}
      <div className="absolute right-[3%] bottom-[3%] left-[3%]">
        <div className="relative h-px w-full bg-white/30">
          <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-white/45" />
          {sidebar > 0 && <span className="absolute -top-[3px] h-[7px] w-px bg-white/45" style={{ left: sidebar }} />}
          <span className="absolute -top-[3px] right-0 h-[7px] w-px bg-white/45" />
        </div>
        <div className={`${MICRO} mt-1.5 flex justify-between text-gray-500`}>
          <span style={{ width: sidebar || undefined }}>{sidebar ? `${Math.round(sidebar)} px` : 'grid'}</span>
          <span>1 fr</span>
        </div>
      </div>
    </div>
  )
}

/** `05 interaction` — pointer, focus ring and hover outlines over the real controls. Never takes pointer events. */
export function InteractionLayer({ rects }: { rects: LocalRect[] }) {
  const target = rects.find((r) => r.key === 'deploy')
  const hovers = rects.filter((r) => r.key === 'row').slice(0, 2)
  return (
    <div aria-hidden className="absolute inset-0">
      <div className={`${FRAME} border-dashed`} />
      {hovers.map((r, i) => (
        <div key={i} className="absolute rounded-[8px] border border-dashed border-white/25" style={{ left: r.x - 2, top: r.y - 2, width: r.w + 4, height: r.h + 4 }}>
          {i === 0 && (
            <span className={`${MICRO} absolute -top-2 left-2 bg-[#0e0e0e] px-1 text-gray-400`}>:hover</span>
          )}
        </div>
      ))}
      {target && (
        <div className="absolute" style={{ left: target.x, top: target.y, width: target.w, height: target.h }}>
          <span className="absolute -inset-[3px] rounded-[8px] border-2 border-white/45" />
          <span className="lab-ix-ripple absolute -inset-[3px] rounded-[8px] border border-white/60" />
          <span className={`${MICRO} absolute -top-2.5 left-0 bg-[#0e0e0e] px-1 text-white`}>:focus</span>
          <svg viewBox="0 0 12 18" className="lab-ix-cursor absolute h-[18px] w-[12px] drop-shadow-[0_1px_2px_rgba(0,0,0,.8)]" style={{ left: target.w * 0.6, top: target.h * 0.55 }}>
            <path d="M1 1 L1 15 L4.6 11.6 L7 17 L9.4 16 L7 10.8 L11 10.6 Z" fill="#ffffff" stroke="#0e0e0e" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}
