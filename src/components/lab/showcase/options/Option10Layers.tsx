'use client'
/**
 * Option 10 — "Exploded UI". A real, interactive deploy dashboard is split into five sheets that pull apart in
 * 3D and come back together:
 *   01 backend      the Route Handler the Deploy button posts to
 *   02 state        the live React state, printed as JSON
 *   03 layout       the grid skeleton traced from the real boxes
 *   04 components   the actual app (the only layer that takes pointer events)
 *   05 interaction  pointer, focus ring and hover outlines
 *
 * p 0→0.35 the group tilts and the sheets spread on Z; 0.4→0.75 it holds with a slow drift; 0.8→1 it flattens
 * back to the plain dashboard while LAYER / BY LAYER slide in. The app is fully usable flat at either end.
 *
 * Labels are NOT inside the 3D sheets — they are a 2D overlay over the stage. Each sheet carries a 1px anchor
 * at its right edge; every frame we read the anchors' screen positions and draw an elbow leader from each one
 * to a single aligned column of labels (phone: a numbered list under the stage instead).
 */
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { LabOption, seg, lerp, easeOut, easeInOut } from '../LabOption'
import { DashboardApp } from './dashboard/Dashboard'
import { CodeLayer, InteractionLayer, SkeletonLayer, StateLayer, useLocalRects } from './dashboard/layers'
import { useDeployApp } from './dashboard/state'

const LAYERS = [
  { n: '01', name: 'backend', desc: 'Route handler · streams stages' },
  { n: '02', name: 'state', desc: 'React state · flags, deploy, version' },
  { n: '03', name: 'layout', desc: 'Grid skeleton · sidebar, main, cards' },
  { n: '04', name: 'components', desc: 'The live UI · tabs, switches, deploy' },
  { n: '05', name: 'interaction', desc: 'Pointer, focus ring, hover states' },
]

/** Explode geometry. `step` is the Z gap between sheets, `scale` how far the group shrinks to stay on screen. */
const DESK = { rx: 52, rz: -16, step: 175, scale: 0.74, tx: -140, ty: -102 }
const PHONE = { rx: 48, rz: -14, step: 130, scale: 0.62, tx: 0, ty: -128 }

const COL_W = 210
const COL_GAP = 316 + 72
const ROW_H = 62

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function Option10Layers() {
  const app = useDeployApp()
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
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const svg = useRef<SVGSVGElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const wordTop = useRef<HTMLSpanElement>(null)
  const wordBottom = useRef<HTMLSpanElement>(null)

  const apply = (p: number) => {
    const g = group.current
    const st = stage.current
    if (!g || !st) return
    const phone = window.innerWidth < 810
    const cfg = phone ? PHONE : DESK

    const explode = easeInOut(seg(p, 0, 0.35))
    const flatten = easeInOut(seg(p, 0.8, 1))
    const amount = explode * (1 - flatten)
    const drift = easeInOut(seg(p, 0.4, 0.75))

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

    // Display words.
    const w = easeOut(seg(p, 0.85, 1))
    const t = wordTop.current
    const b = wordBottom.current
    if (t && b) {
      t.style.transform = `translateY(${-60 * (1 - w)}vh)`
      b.style.transform = `translateY(${60 * (1 - w)}vh)`
      t.style.opacity = b.style.opacity = String(w)
    }

    // Labels: hidden while the stack is flat at either end.
    const labelA = seg(p, 0.12, 0.32) * (1 - seg(p, 0.86, 0.96))
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
    const elbow = colX - 34
    const mid = pts.reduce((sum, q) => sum + q.y, 0) / pts.length
    const startY = clamp(mid - (ROW_H * 5) / 2, 32, Math.max(32, sr.height - ROW_H * 5 - 32))

    order.forEach((i, row) => {
      const ly = startY + row * ROW_H
      const el = labels.current[i]
      if (el) el.style.transform = `translate3d(${colX}px, ${ly}px, 0)`
      const points = `${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${elbow},${pts[i].y.toFixed(1)} ${elbow},${ly + 9} ${colX - 12},${ly + 9}`
      lines.current[i]?.setAttribute('points', points)
      halos.current[i]?.setAttribute('points', points)
      const dot = dots.current[i]
      if (dot) {
        dot.setAttribute('cx', pts[i].x.toFixed(1))
        dot.setAttribute('cy', pts[i].y.toFixed(1))
      }
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
        className="absolute top-1/2 right-0 block h-px w-px"
      />
    </div>
  )

  return (
    <LabOption id="layers" heightVh={400} onProgress={apply}>
      <style>{`
        @keyframes lab-ix-ripple { 0% { opacity: .85; transform: scale(1) } 65%, 100% { opacity: 0; transform: scale(1.28) } }
        @keyframes lab-ix-cursor { 0%, 100% { transform: translate(0, 0) } 50% { transform: translate(-3px, -4px) } }
        .lab-ix-ripple { animation: lab-ix-ripple 2.4s cubic-bezier(.22,1,.36,1) infinite; }
        .lab-ix-cursor { animation: lab-ix-cursor 2.4s ease-in-out infinite; }
      `}</style>

      <div ref={stage} className="relative h-full w-full">
        {/* Display words, behind the stack */}
        <span
          ref={wordTop}
          aria-hidden
          className="text-display pointer-events-none absolute top-[80px] left-[3vw] z-0 whitespace-nowrap opacity-0 will-change-transform tablet:left-[4vw]"
        >
          Layer
        </span>
        <span
          ref={wordBottom}
          aria-hidden
          className="text-display pointer-events-none absolute right-[3vw] bottom-[5vh] z-0 whitespace-nowrap opacity-0 will-change-transform tablet:right-[4vw]"
        >
          By layer
        </span>

        {/* 3D stage */}
        <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ perspective: '2000px' }}>
          <div
            ref={group}
            className="relative h-[66vh] w-[92vw] will-change-transform tablet:h-[min(560px,60vh)] tablet:w-[min(960px,92vw)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {sheet(0, <CodeLayer />)}
            {sheet(1, <StateLayer state={app.state} />)}
            {sheet(2, <SkeletonLayer rects={skeleton} />)}
            {sheet(
              3,
              <div ref={appLayer} className="absolute inset-0 shadow-[0_40px_120px_rgba(0,0,0,.6)]">
                <DashboardApp app={app} />
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
          {LAYERS.map((l, i) => (
            <circle
              key={l.n}
              ref={(el) => {
                dots.current[i] = el
              }}
              r="3"
              cx="-10"
              cy="-10"
              fill="#ffffff"
            />
          ))}
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
