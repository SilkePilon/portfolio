'use client'
// Option 5 — "Network": ~90 canvas nodes scattered at random drift into five clustered groups (web, api,
// auth, db, queue) hugging the stage edges, edges knit between near neighbours plus a backbone between hubs;
// then pulses run along the backbone, hubs earn a ring and a mono label, and CONNECT / SYSTEMS fade in
// through the empty centre band. Canvas 2D, redrawn only when progress changes (plus a gentle idle float).
import { useEffect, useLayoutEffect, useRef } from 'react'
import { LabOption, seg, lerp, easeInOut } from '../LabOption'

type Node = { sx: number; sy: number; gx: number; gy: number; hub: boolean; cluster: number; phase: number }

const CLUSTERS = [
  { name: 'web', x: 0.14, y: 0.2 },
  { name: 'api', x: 0.5, y: 0.13 },
  { name: 'auth', x: 0.86, y: 0.22 },
  { name: 'db', x: 0.18, y: 0.82 },
  { name: 'queue', x: 0.84, y: 0.8 },
]
const BACKBONE: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [2, 4],
  [3, 4],
  [1, 3],
  [1, 4],
]
const COUNT = 90
const LINK_DIST = 0.11

/** Deterministic LCG so server and client agree on the layout. */
function lcg(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

function buildNodes(): Node[] {
  const rnd = lcg(5)
  const nodes: Node[] = []
  for (let i = 0; i < COUNT; i++) {
    const cluster = i % CLUSTERS.length
    const c = CLUSTERS[cluster]
    const hub = i < CLUSTERS.length
    const a = rnd() * Math.PI * 2
    const r = hub ? 0 : 0.035 + rnd() * 0.085
    nodes.push({
      sx: 0.05 + rnd() * 0.9,
      sy: 0.05 + rnd() * 0.9,
      gx: c.x + Math.cos(a) * r * 1.3,
      gy: c.y + Math.sin(a) * r,
      hub,
      cluster,
      phase: rnd() * Math.PI * 2,
    })
  }
  return nodes
}

export function Option5Network() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const words = useRef<HTMLDivElement>(null)
  const state = useRef({ p: 0, nodes: [] as Node[], w: 0, h: 0, dpr: 1, visible: false, raf: 0, t: 0 })

  const draw = (time: number) => {
    const el = canvas.current
    const s = state.current
    if (!el || !s.w) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const { p, w, h, dpr, nodes } = s
    const isMobile = w < 810
    const t1 = easeInOut(seg(p, 0, 0.45))
    const t2 = seg(p, 0.45, 1)
    const float = (n: Node) => (time ? Math.sin(time / 1400 + n.phase) * 2.5 * t1 : 0)
    const pos = nodes.map((n) => {
      // Keep clusters off the centre band on narrow screens by pushing them harder to the edges.
      const gx = isMobile ? 0.5 + (n.gx - 0.5) * 1.1 : n.gx
      return [lerp(n.sx, gx, t1) * w, lerp(n.sy, n.gy, t1) * h + float(n)] as const
    })

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    // Neighbour edges (appear as nodes settle).
    ctx.lineWidth = 1
    ctx.strokeStyle = `rgba(255,255,255,${0.15 * t1})`
    ctx.beginPath()
    const limit = LINK_DIST * Math.min(w, h) * 1.2
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].cluster !== nodes[j].cluster) continue
        const dx = pos[i][0] - pos[j][0]
        const dy = pos[i][1] - pos[j][1]
        if (dx * dx + dy * dy < limit * limit) {
          ctx.moveTo(pos[i][0], pos[i][1])
          ctx.lineTo(pos[j][0], pos[j][1])
        }
      }
    }
    ctx.stroke()

    // Backbone between hubs.
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * t1})`
    ctx.beginPath()
    for (const [a, b] of BACKBONE) {
      ctx.moveTo(pos[a][0], pos[a][1])
      ctx.lineTo(pos[b][0], pos[b][1])
    }
    ctx.stroke()

    // Nodes.
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      const [x, y] = pos[i]
      ctx.beginPath()
      ctx.fillStyle = n.hub ? '#ffffff' : '#c4c4c4'
      ctx.arc(x, y, n.hub ? 5 : 2 + (i % 2), 0, Math.PI * 2)
      ctx.fill()
    }

    // Phase 2: pulses, hub rings, labels.
    if (t2 > 0) {
      ctx.fillStyle = `rgba(255,255,255,${t2})`
      BACKBONE.forEach(([a, b], k) => {
        const f = (p * 3 + k / BACKBONE.length) % 1
        ctx.beginPath()
        ctx.arc(lerp(pos[a][0], pos[b][0], f), lerp(pos[a][1], pos[b][1], f), 2.5, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * t2})`
      ctx.fillStyle = `rgba(153,153,153,${t2})`
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      CLUSTERS.forEach((c, i) => {
        const [x, y] = pos[i]
        ctx.beginPath()
        ctx.arc(x, y, 5 + 7 * easeInOut(t2), 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillText(c.name.toUpperCase(), x, y + 18)
      })
    }
  }

  const apply = (p: number) => {
    state.current.p = p
    if (words.current) words.current.style.opacity = String(0.9 * easeInOut(seg(p, 0.7, 1)))
    draw(state.current.t)
  }

  useLayoutEffect(() => {
    state.current.nodes = buildNodes()
    if (import.meta.env.MODE === 'test') return
    const el = canvas.current
    if (!el) return
    const resize = () => {
      const s = state.current
      const rect = el.getBoundingClientRect()
      s.w = rect.width
      s.h = rect.height
      s.dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = Math.round(s.w * s.dpr)
      el.height = Math.round(s.h * s.dpr)
      draw(s.t)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Idle float loop: only while the section is on screen.
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    const el = canvas.current
    if (!el) return
    const s = state.current
    const loop = (time: number) => {
      s.t = time
      draw(time)
      s.raf = s.visible ? requestAnimationFrame(loop) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      s.visible = e.isIntersecting
      if (s.visible && !s.raf) s.raf = requestAnimationFrame(loop)
      if (!s.visible && s.raf) {
        cancelAnimationFrame(s.raf)
        s.raf = 0
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      if (s.raf) cancelAnimationFrame(s.raf)
      s.raf = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LabOption id="network" heightVh={300} onProgress={apply}>
      <div className="relative h-full w-full">
        <div
          ref={words}
          style={{ opacity: 0 }}
          className="text-display absolute inset-0 flex flex-col items-center justify-center text-center leading-[0.95] text-white"
        >
          <span>Connect</span>
          <span>Systems</span>
        </div>
        <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
      </div>
    </LabOption>
  )
}
