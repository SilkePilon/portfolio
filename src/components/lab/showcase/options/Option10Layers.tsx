'use client'
/**
 * Option 10 — "Exploded UI". A real, live trading terminal is split into five sheets that pull apart in 3D:
 *   01 backend      the SSE route the quote stream comes from, and the order endpoint
 *   02 state        the live React state, printed as JSON
 *   03 layout       the grid skeleton traced from the real boxes
 *   04 components   the actual app (the only layer that takes pointer events)
 *   05 interaction  pointer, focus ring and hover outlines
 *
 * p 0.05→0.5 the group tilts and the sheets spread on Z, then it holds with a slow drift to the end of the
 * section. The app keeps ticking, filling orders and firing notifications the whole way through, and is fully
 * usable while flat at the start.
 *
 * Labels are NOT inside the 3D sheets — they are a 2D overlay over the stage. Each sheet carries a 1px anchor
 * on its right edge, placed at a height that stays clear of the opaque app sheet; every frame we read the
 * anchors' screen positions, drop a `+` marker on each one and run an elbow leader to a left-aligned column of
 * labels (phone: a numbered list under the stage instead).
 */
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { LabOption, seg, lerp, easeInOut } from '../LabOption'
import { TradingApp } from './dashboard/Dashboard'
import { CodeLayer, InteractionLayer, SkeletonLayer, StateLayer, useLocalRects } from './dashboard/layers'
import { useTradingApp } from './dashboard/state'

const LAYERS = [
  { n: '01', name: 'backend', desc: 'Route handlers · SSE quotes, orders' },
  { n: '02', name: 'state', desc: 'React state · account, positions, orders' },
  { n: '03', name: 'layout', desc: 'Grid skeleton · sidebar, chart, ticket' },
  { n: '04', name: 'components', desc: 'The live UI · prices tick, orders fill' },
  { n: '05', name: 'interaction', desc: 'Pointer, focus ring, hover states' },
]

/**
 * Where each sheet's leader leaves it, as a fraction of the sheet's own height on its right edge. Sheets 0–2
 * sit *behind* the app and only their lower band is uncovered once the stack is exploded, so their anchors are
 * pushed down; the app and the interaction sheet in front of it are anchored at the middle.
 */
const ANCHOR_TOP = [0.62, 0.72, 0.88, 0.5, 0.5]

/** Explode geometry. `step` is the Z gap between sheets, `scale` how far the group shrinks to stay on screen. */
const DESK = { rx: 52, rz: -16, step: 170, scale: 0.82, tx: -190, ty: -60 }
const PHONE = { rx: 48, rz: -14, step: 130, scale: 0.72, tx: 0, ty: -120 }

const COL_W = 210
const COL_GAP = 316 + 72
/** Minimum vertical gap between two label rows. */
const ROW_H = 62
/** Half-length of the `+` marker arms. */
const MARK = 6

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function Option10Layers() {
  const app = useTradingApp()
  const appLayer = useRef<HTMLDivElement>(null)
  const skeleton = useLocalRects(appLayer, '[data-skel]', app.state.tab)
  const targets = useLocalRects(appLayer, '[data-ix]', app.state.tab)

  const stage = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const sheets = useRef<(HTMLDivElement | null)[]>([])
  const anchors = useRef<(HTMLSpanElement | null)[]>([])
  const labels = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(SVGPolylineElement | null)[]>([])
  const halos = useRef<(SVGPolylineElement | null)[]>([])
  const marks = useRef<(SVGPathElement | null)[]>([])
  const markHalos = useRef<(SVGPathElement | null)[]>([])
  const svg = useRef<SVGSVGElement>(null)
  const list = useRef<HTMLDivElement>(null)

  const apply = (p: number) => {
    const g = group.current
    const st = stage.current
    if (!g || !st) return
    const phone = window.innerWidth < 810
    const cfg = phone ? PHONE : DESK

    // Explode over the first half of the scroll, then hold: the section ends fully exploded.
    const amount = easeInOut(seg(p, 0.05, 0.5))
    const drift = easeInOut(seg(p, 0.5, 1))

    const k = lerp(1, cfg.scale, amount)
    const rz = lerp(cfg.rz, cfg.rz + 7, drift) * amount
    g.style.transform = `translate3d(${cfg.tx * amount}px, ${cfg.ty * amount}px, 0) scale3d(${k}, ${k}, ${k}) rotateX(${cfg.rx * amount}deg) rotateZ(${rz}deg)`

    // Sheets spread on Z around the app (index 3). 1–3 sit behind it, 5 in front.
    const aux = String(Math.min(0.92, amount * 1.7))
    for (let i = 0; i < 5; i++) {
      const el = sheets.current[i]
      if (!el) continue
      el.style.transform = `translateZ(${(i - 3) * cfg.step * amount}px)`
      if (i !== 3) el.style.opacity = aux
    }

    // Labels: hidden until the sheets are far enough apart that a leader has somewhere clear to land.
    const labelA = seg(p, 0.32, 0.5)
    if (list.current) list.current.style.opacity = phone ? String(labelA) : '0'
    if (svg.current) svg.current.style.opacity = phone ? '0' : String(labelA)
    for (const el of labels.current) if (el) el.style.opacity = phone ? '0' : String(labelA)
    if (phone || labelA < 0.004) return

    const sr = st.getBoundingClientRect()
    const pts = anchors.current.map((a) => {
      if (!a) return { x: 0, y: 0 }
      const r = a.getBoundingClientRect()
      return { x: r.left + r.width / 2 - sr.left, y: r.top + r.height / 2 - sr.top }
    })
    const order = [0, 1, 2, 3, 4].sort((a, b) => pts[a].y - pts[b].y)
    const colX = sr.width - COL_GAP

    /**
     * Label rows follow their own anchor instead of sitting on a fixed pitch, so a leader is a short run
     * rather than a long vertical through the other rows. One downward pass enforces the minimum gap, then
     * the block is shifted up if it ran past the bottom of the stage.
     */
    const ys: number[] = []
    let prev = -Infinity
    for (const i of order) {
      const y = Math.max(pts[i].y - 9, prev + ROW_H)
      ys.push(y)
      prev = y
    }
    const overflow = ys[4] + ROW_H - (sr.height - 24)
    if (overflow > 0) {
      const shift = Math.min(overflow, Math.max(0, ys[0] - 24))
      for (let r = 0; r < 5; r++) ys[r] -= shift
    }

    order.forEach((i, row) => {
      const ly = clamp(ys[row], 8, sr.height - 40)
      const el = labels.current[i]
      if (el) el.style.transform = `translate3d(${colX}px, ${ly}px, 0)`

      // Each row gets its own elbow x, stepping outward from the column, so no two verticals ever share one.
      const elbow = colX - 34 - row * 18
      const ax = pts[i].x
      const ay = pts[i].y
      const points = `${ax.toFixed(1)},${ay.toFixed(1)} ${elbow},${ay.toFixed(1)} ${elbow},${(ly + 9).toFixed(1)} ${colX - 12},${(ly + 9).toFixed(1)}`
      lines.current[i]?.setAttribute('points', points)
      halos.current[i]?.setAttribute('points', points)

      // The site's `+` marker, drawn as a 12px cross centred on the anchor.
      const d = `M${(ax - MARK).toFixed(1)},${ay.toFixed(1)}H${(ax + MARK).toFixed(1)}M${ax.toFixed(1)},${(ay - MARK).toFixed(1)}V${(ay + MARK).toFixed(1)}`
      marks.current[i]?.setAttribute('d', d)
      markHalos.current[i]?.setAttribute('d', d)
    })
  }

  useLayoutEffect(() => apply(0), [])

  const sheet = (i: number, children: ReactNode) => (
    <div
      ref={(el) => {
        sheets.current[i] = el
      }}
      aria-hidden={i === 3 ? undefined : true}
      className="absolute inset-0 will-change-transform [backface-visibility:hidden]"
      style={i === 3 ? undefined : { opacity: 0, pointerEvents: 'none' }}
    >
      {children}
      <span
        aria-hidden
        ref={(el) => {
          anchors.current[i] = el
        }}
        className="absolute right-0 block h-px w-px"
        style={{ top: `${ANCHOR_TOP[i] * 100}%` }}
      />
    </div>
  )

  return (
    <LabOption id="layers" heightVh={250} onProgress={apply}>
      <style>{`
        @keyframes lab-ix-ripple { 0% { opacity: .85; transform: scale(1) } 65%, 100% { opacity: 0; transform: scale(1.28) } }
        @keyframes lab-ix-cursor { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(-3px, -4px) } }
        .lab-ix-ripple { animation: lab-ix-ripple 2.4s cubic-bezier(.22,1,.36,1) infinite; }
        .lab-ix-cursor { animation: lab-ix-cursor 2.4s ease-in-out infinite; }
      `}</style>

      <div ref={stage} className="relative h-full w-full">
        {/* 3D stage */}
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ perspective: '2000px' }}>
          <div
            ref={group}
            className="relative h-[66vh] w-[92vw] will-change-transform tablet:h-[min(640px,70vh)] tablet:w-[min(1100px,90vw)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {sheet(0, <CodeLayer />)}
            {sheet(1, <StateLayer state={app.state} />)}
            {sheet(2, <SkeletonLayer rects={skeleton} />)}
            {sheet(
              3,
              <div ref={appLayer} className="absolute inset-0">
                <TradingApp app={app} />
              </div>,
            )}
            {sheet(4, <InteractionLayer rects={targets} />)}
          </div>
        </div>

        {/* Leader lines (desktop) */}
        <svg ref={svg} aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-0">
          <g fill="none" stroke="rgba(0,0,0,.75)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
            {LAYERS.map((l, i) => (
              <polyline
                key={l.n}
                ref={(el) => {
                  halos.current[i] = el
                }}
                points=""
              />
            ))}
            {LAYERS.map((l, i) => (
              <path
                key={`m${l.n}`}
                ref={(el) => {
                  markHalos.current[i] = el
                }}
                d=""
              />
            ))}
          </g>
          <g fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
            {LAYERS.map((l, i) => (
              <polyline
                key={l.n}
                ref={(el) => {
                  lines.current[i] = el
                }}
                points=""
              />
            ))}
          </g>
          <g fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="butt">
            {LAYERS.map((l, i) => (
              <path
                key={l.n}
                ref={(el) => {
                  marks.current[i] = el
                }}
                d=""
              />
            ))}
          </g>
        </svg>

        {/* Label column (desktop) — positioned per frame from the anchors */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden tablet:block">
          {LAYERS.map((l, i) => (
            <div
              key={l.n}
              ref={(el) => {
                labels.current[i] = el
              }}
              className="absolute top-0 left-0 opacity-0 will-change-transform"
              style={{ width: COL_W }}
            >
              <span className="flex items-baseline gap-2 font-mono text-[11px] leading-none tracking-[0.06em] uppercase">
                <span className="text-white">{l.n}</span>
                <span className="text-gray-400">{l.name}</span>
              </span>
              <span className="mt-1.5 block text-[11px] leading-[1.35] text-gray-500">{l.desc}</span>
            </div>
          ))}
        </div>

        {/* Label list (phone) — under the stage, numbered rules */}
        <div ref={list} aria-hidden className="pointer-events-none absolute inset-x-3 bottom-[9vh] z-20 opacity-0 tablet:hidden">
          {LAYERS.slice().reverse().map((l) => (
            <div key={l.n} className="flex items-baseline gap-3 border-t border-white/12 py-[7px]">
              <span className="font-mono text-[11px] leading-none tracking-[0.06em] text-white uppercase">{l.n}</span>
              <span className="font-mono text-[11px] leading-none tracking-[0.06em] text-gray-400 uppercase">{l.name}</span>
              <span className="ml-auto text-[10px] leading-none text-gray-500">{l.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </LabOption>
  )
}
