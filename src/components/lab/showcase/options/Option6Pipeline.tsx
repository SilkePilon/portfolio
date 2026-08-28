'use client'
/**
 * Option 6 — "Pipeline". A request travels Client → Edge → API → SQLite. Scroll raises the four nodes in
 * sequence and draws the connectors between them (p 0→0.5); from p 0.3 white request packets stream along the
 * connectors and gray response packets stream back, the latency metric counts up to 38 ms, and the status flips
 * to a soft-green `200 OK`. REQUEST / RESPONSE watermarks slide in behind. Layout is a flex row that becomes a
 * column on phone — packets follow whichever axis the connector happens to be on.
 */
import { useEffect, useRef } from 'react'
import { LabOption, seg, lerp, easeOut } from '../LabOption'

const NODES = [
  { label: 'Client', metric: '38 ms' },
  { label: 'Edge (CDN)', metric: 'cache HIT' },
  { label: 'API (Next.js)', metric: '200 OK' },
  { label: 'SQLite', metric: '1 query' },
] as const

const TAIL = 3 // trailing dots per packet
const TAIL_GAP = 0.07 // spacing along the connector (0..1)
const GREEN = '#7dd3a0'

const fract = (x: number) => x - Math.floor(x)

export function Option6Pipeline() {
  const boxes = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(HTMLDivElement | null)[]>([])
  const arrows = useRef<(HTMLDivElement | null)[]>([])
  const conns = useRef<(HTMLDivElement | null)[]>([])
  const dots = useRef<(HTMLSpanElement | null)[][]>([[], [], []]) // per connector: [req×4, res×4]
  const ms = useRef<HTMLSpanElement>(null)
  const status = useRef<HTMLSpanElement>(null)
  const wmTop = useRef<HTMLSpanElement>(null)
  const wmBottom = useRef<HTMLSpanElement>(null)
  const layout = useRef({ horizontal: true, length: 96 })
  const last = useRef(1)

  const render = (p: number) => {
    last.current = p
    const { horizontal, length } = layout.current
    const axis = (d: number) => (horizontal ? `translate(${d}px, -50%)` : `translate(-50%, ${d}px)`)

    boxes.current.forEach((el, i) => {
      if (!el) return
      const t = easeOut(seg(p, i * 0.11, i * 0.11 + 0.14))
      el.style.opacity = String(t)
      el.style.transform = `translateY(${lerp(20, 0, t)}px)`
    })

    conns.current.forEach((conn, i) => {
      if (!conn) return
      const draw = easeOut(seg(p, i * 0.11 + 0.08, i * 0.11 + 0.22))
      const line = lines.current[i]
      if (line) line.style.transform = horizontal ? `scaleX(${draw})` : `scaleY(${draw})`
      const arrow = arrows.current[i]
      if (arrow) arrow.style.opacity = String(seg(draw, 0.9, 1))
      const show = seg(p, 0.3, 0.45) * draw
      const spans = dots.current[i]
      for (let s = 0; s < 2; s++) {
        const head = fract(p * 4 + i * 0.27 + s * 0.5)
        for (let k = 0; k <= TAIL; k++) {
          const el = spans[s * (TAIL + 1) + k]
          if (!el) continue
          let t = fract(head - k * TAIL_GAP)
          if (s === 1) t = 1 - t // response travels back
          const fade = k === 0 ? 1 : 0.45 - k * 0.12
          el.style.transform = axis(t * length)
          el.style.opacity = String(show * fade * (s === 1 ? 0.7 : 1))
        }
      }
    })

    if (ms.current) ms.current.textContent = `${Math.round(lerp(0, 38, easeOut(seg(p, 0.5, 0.9))))} ms`
    if (status.current) {
      const ok = p >= 0.85
      status.current.textContent = ok ? '200 OK' : '···'
      status.current.style.color = ok ? GREEN : ''
    }

    const w = easeOut(seg(p, 0.6, 1))
    if (wmTop.current) {
      wmTop.current.style.opacity = String(0.12 * w)
      wmTop.current.style.transform = `translateX(${lerp(-12, 0, w)}%)`
    }
    if (wmBottom.current) {
      wmBottom.current.style.opacity = String(0.12 * w)
      wmBottom.current.style.transform = `translateX(${lerp(12, 0, w)}%)`
    }
  }

  // Measure the connector axis/length once per resize (never per frame) and repaint the last progress.
  useEffect(() => {
    const measure = () => {
      const c = conns.current[0]
      if (!c) return
      const w = c.offsetWidth
      const h = c.offsetHeight
      layout.current = { horizontal: w >= h, length: Math.max(w, h) }
      render(last.current)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setDot = (c: number, idx: number) => (el: HTMLSpanElement | null) => {
    dots.current[c][idx] = el
  }

  return (
    <LabOption id="pipeline" heightVh={300} onProgress={render}>
      <div className="relative flex w-[92vw] max-w-[1200px] flex-col items-center justify-center gap-6 tablet:gap-10">
        <span
          ref={wmTop}
          className="text-display pointer-events-none self-start whitespace-nowrap text-white opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          Request
        </span>

        <div
          className="flex flex-col items-center tablet:flex-row tablet:items-stretch"
          role="img"
          aria-label="Request pipeline: Client to Edge CDN to Next.js API to SQLite, 38 ms, 200 OK"
        >
          {NODES.map((n, i) => (
            <div key={n.label} className="contents">
              <div
                ref={(el) => {
                  boxes.current[i] = el
                }}
                className="flex w-[220px] flex-col items-center gap-2 border border-rule px-6 py-5 opacity-0 tablet:w-auto tablet:min-w-[160px] desktop:min-w-[200px]"
                style={{ willChange: 'transform, opacity' }}
              >
                <span className="font-mono text-[12px] uppercase tracking-[0.05em] text-white">{n.label}</span>
                <span className="font-mono text-[11px] tracking-[0.05em] text-gray-500">
                  {i === 0 ? <span ref={ms}>{n.metric}</span> : i === 2 ? <span ref={status}>{n.metric}</span> : n.metric}
                </span>
              </div>

              {i < NODES.length - 1 && (
                <div
                  aria-hidden
                  ref={(el) => {
                    conns.current[i] = el
                  }}
                  className="relative h-14 w-px shrink-0 self-center tablet:h-px tablet:w-16 desktop:w-28"
                >
                  <div
                    ref={(el) => {
                      lines.current[i] = el
                    }}
                    className="absolute inset-0 origin-top tablet:origin-left"
                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', willChange: 'transform' }}
                  />
                  <div
                    ref={(el) => {
                      arrows.current[i] = el
                    }}
                    className="absolute bottom-0 left-1/2 h-[6px] w-[6px] -translate-x-1/2 rotate-[135deg] border-t border-l border-white/40 tablet:top-1/2 tablet:right-0 tablet:bottom-auto tablet:left-auto tablet:translate-x-0 tablet:-translate-y-1/2 tablet:rotate-45 tablet:border-t tablet:border-r tablet:border-l-0"
                    style={{ opacity: 0 }}
                  />
                  {[0, 1].map((s) =>
                    Array.from({ length: TAIL + 1 }, (_, k) => (
                      <span
                        key={`${s}-${k}`}
                        ref={setDot(i, s * (TAIL + 1) + k)}
                        className="absolute top-0 left-1/2 block h-[4px] w-[4px] rounded-full opacity-0 tablet:top-1/2 tablet:left-0"
                        style={{
                          backgroundColor: s === 0 ? '#fff' : '#999',
                          willChange: 'transform, opacity',
                        }}
                      />
                    )),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <span
          ref={wmBottom}
          className="text-display pointer-events-none self-end whitespace-nowrap text-white opacity-0"
          style={{ willChange: 'transform, opacity' }}
        >
          Response
        </span>
      </div>
    </LabOption>
  )
}
