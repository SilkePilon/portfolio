'use client'
import { useEffect, useRef } from 'react'
import { LabOption, seg, easeOut } from '../LabOption'

/**
 * Glyph grid. A full-stage grid of dim mono characters. "SHOW / CASE" is rasterised once offscreen (Host Grotesk
 * bold) and sampled per cell into a mask. On scroll a diagonal wave activates cells: inside the mask they light up
 * as bright random chars, then resolve to solid blocks so the words read as glyph-built type; outside cells stay
 * faint noise. Last stretch: mask steps to pure white and a mono caption fades in underneath.
 */

const POOL = '{}[]()<>/=;:.+*#'
const WORDS = ['SHOW', 'CASE']
const CAPTION = 'software · design · systems'

type Grid = {
  cols: number
  rows: number
  cell: number
  font: number
  mask: Uint8Array
  phase: Float32Array
  fixed: Uint8Array
  width: number
  height: number
  dpr: number
}

/** Deterministic LCG in 0..1. */
function lcg(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Visible slice of the stage (CSS px, stage-relative). The stage can be wider than the viewport, so the words are
 * fitted and centred on what is actually on screen rather than on the element box. Each axis falls back to the
 * full box on its own: the stage is usually built while it is still below the fold (empty y overlap). */
function visibleBox(r: DOMRect) {
  const x0 = Math.max(0, -r.left)
  const x1 = Math.min(r.width, window.innerWidth - r.left)
  const y0 = Math.max(0, -r.top)
  const y1 = Math.min(r.height, window.innerHeight - r.top)
  return {
    x0: x1 > x0 ? x0 : 0,
    x1: x1 > x0 ? x1 : r.width,
    y0: y1 > y0 ? y0 : 0,
    y1: y1 > y0 ? y1 : r.height,
  }
}

function buildGrid(canvas: HTMLCanvasElement, rect: DOMRect): Grid | null {
  const width = rect.width
  const height = rect.height
  const vis = visibleBox(rect)
  const visWidth = vis.x1 - vis.x0
  const cell = visWidth < 810 ? 14 : 18
  const font = visWidth < 810 ? 12 : 13
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const cols = Math.max(1, Math.floor(width / cell))
  const rows = Math.max(1, Math.floor(height / cell))
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  // Rasterise the words once at grid resolution (one pixel per cell) and read coverage back.
  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const octx = off.getContext('2d', { willReadFrequently: true })
  if (!octx) return null
  // Fit the words to the visible slice of the stage, in cell units: widest word spans ~80 % of the visible columns,
  // and both lines plus the gap stay inside ~70 % of the visible rows. Measured with the real font (the caller
  // rebuilds once `document.fonts.ready` resolves), then scaled down to whichever limit is tighter.
  const visCols = visWidth / cell
  const visRows = (vis.y1 - vis.y0) / cell
  const family = '"Host Grotesk Variable", "Host Grotesk", sans-serif'
  const probe = 100
  octx.font = `700 ${probe}px ${family}`
  const widest = Math.max(...WORDS.map((w) => octx.measureText(w).width)) / probe // em units
  const gapEm = 0.18
  let size = (visCols * 0.8) / widest
  size = Math.min(size, (visRows * 0.7) / (2 + gapEm))
  octx.font = `700 ${size}px ${family}`
  octx.fillStyle = '#fff'
  octx.textAlign = 'center'
  octx.textBaseline = 'middle'
  const lineGap = size * (1 + gapEm)
  const cx = (vis.x0 + vis.x1) / 2 / cell
  const cy = (vis.y0 + vis.y1) / 2 / cell
  octx.fillText(WORDS[0], cx, cy - lineGap / 2)
  octx.fillText(WORDS[1], cx, cy + lineGap / 2)
  const px = octx.getImageData(0, 0, cols, rows).data
  const n = cols * rows
  const mask = new Uint8Array(n)
  const phase = new Float32Array(n)
  const fixed = new Uint8Array(n)
  const rnd = lcg(0x5eed)
  for (let i = 0; i < n; i++) {
    mask[i] = px[i * 4 + 3] > 110 ? 1 : 0
    phase[i] = rnd()
    fixed[i] = Math.floor(rnd() * POOL.length)
  }
  return { cols, rows, cell, font, mask, phase, fixed, width, height, dpr }
}

function draw(ctx: CanvasRenderingContext2D, g: Grid, p: number) {
  const { cols, rows, cell, mask, phase, fixed, dpr } = g
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, g.width, g.height)
  ctx.font = `${g.font}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const sweep = seg(p, 0, 0.5) * 1.3 // slight overshoot so phase jitter can't leave stragglers
  const resolve = easeOut(seg(p, 0.5, 0.85))
  const glow = seg(p, 0.85, 1)
  const tick = Math.floor(p / 0.06) // char cycle every ~6 % of progress
  const ox = (g.width - cols * cell) / 2 + cell / 2
  const oy = (g.height - rows * cell) / 2 + cell / 2
  const inv = 1 / (cols + rows)
  let last = ''
  const fill = (c: string) => {
    if (c !== last) {
      ctx.fillStyle = c
      last = c
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x
      const ph = phase[i]
      const active = (x + y) * inv + ph * 0.15 < sweep
      const inside = mask[i] === 1
      const cycled = POOL[(fixed[i] + tick + x * 7 + y * 13) % POOL.length]
      let ch: string
      if (!active) {
        ch = cycled
        fill('rgba(255,255,255,0.08)')
      } else if (!inside) {
        ch = cycled
        fill('rgba(255,255,255,0.04)')
      } else if (ph < resolve) {
        // Resolved: solid block, brightening to pure white in the last stretch.
        ch = '█'
        fill(glow > 0 ? `rgba(255,255,255,${(0.9 + 0.1 * glow).toFixed(3)})` : 'rgba(255,255,255,0.9)')
      } else {
        // Lit but not yet resolved: settle from cycling noise to this cell's fixed char.
        ch = resolve > 0 ? POOL[fixed[i]] : cycled
        fill('rgba(255,255,255,0.85)')
      }
      ctx.fillText(ch, ox + x * cell, oy + y * cell)
    }
  }
}

export function Option8Glyphs() {
  const stage = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const caption = useRef<HTMLParagraphElement>(null)
  const grid = useRef<Grid | null>(null)
  const progress = useRef(0)

  const render = (p: number) => {
    progress.current = p
    if (caption.current) {
      const t = easeOut(seg(p, 0.85, 1))
      caption.current.style.opacity = String(t)
      caption.current.style.transform = `translateY(${(1 - t) * 8}px)`
    }
    const canvas = canvasRef.current
    const g = grid.current
    if (!canvas || !g) return
    const ctx = canvas.getContext('2d')
    if (ctx) draw(ctx, g, p)
  }

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    const el = stage.current
    const canvas = canvasRef.current
    if (!el || !canvas) return
    let live = true
    const rebuild = () => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      grid.current = buildGrid(canvas, r)
      render(progress.current)
    }
    rebuild()
    // Host Grotesk may still be loading on first build; rebuild the mask once fonts are in.
    document.fonts.ready.then(() => live && rebuild())
    const ro = new ResizeObserver(rebuild)
    ro.observe(el)
    // The stage box may not change when the viewport does (it can be wider than the window), so also refit on resize.
    window.addEventListener('resize', rebuild)
    return () => {
      live = false
      ro.disconnect()
      window.removeEventListener('resize', rebuild)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <LabOption id="glyphs" heightVh={300} onProgress={render}>
      <div ref={stage} className="relative h-full w-full">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 block" />
        <h2 className="sr-only">
          {WORDS[0]} {WORDS[1]}
        </h2>
        <p
          ref={caption}
          className="absolute inset-x-0 bottom-[14vh] text-center font-mono text-[11px] tracking-[0.05em] text-gray-500 uppercase"
          style={{ opacity: 0 }}
        >
          {CAPTION}
        </p>
      </div>
    </LabOption>
  )
}
