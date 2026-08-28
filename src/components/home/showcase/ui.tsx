'use client'
/**
 * Hand-built shadcn/ui look-alikes (zinc dark) for the showcase trading dashboard — no extra dependency.
 * Cards `#191919` on a `#121212` shell, 1px `white/10` rules, 8/6px radii, `white/40` focus ring,
 * Inter for UI copy and IBM Plex Mono for every number.
 *
 * Two accents, and only two: `UP` (#7dd3a0) and `DOWN` (#e5625e). A market UI that cannot say green or red
 * is not a market UI; everything else on the sheet stays white / grey.
 */
import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { Timeframe, Tone } from './state'

export const UP = '#7dd3a0'
export const DOWN = '#e5625e'
export const MUTED = '#8f8f8f'

/** Green up, red down, grey flat — the single place the tone → colour mapping lives. */
export const toneColor = (tone: Tone) => (tone === 'up' ? UP : tone === 'down' ? DOWN : MUTED)

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0'

/**
 * Every keyframe the app uses, mounted once by `TradingApp`. Kept next to the components that reference the
 * class names rather than in the global sheet — it keeps the section self-contained.
 */
export function AppStyles() {
  return (
    <style>{`
      @keyframes sc-flash-up { from { background-color: rgba(125,211,160,.26) } to { background-color: rgba(125,211,160,0) } }
      @keyframes sc-flash-down { from { background-color: rgba(229,98,94,.26) } to { background-color: rgba(229,98,94,0) } }
      @keyframes sc-toast-in { from { opacity: 0; transform: translateY(-14px) scale(.97) } to { opacity: 1; transform: none } }
      @keyframes sc-row-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
      @keyframes sc-pulse { 0% { opacity: .55; transform: scale(1) } 70%, 100% { opacity: 0; transform: scale(2.6) } }
      .sc-flash-up { animation: sc-flash-up .9s cubic-bezier(.22,1,.36,1) forwards }
      .sc-flash-down { animation: sc-flash-down .9s cubic-bezier(.22,1,.36,1) forwards }
      .sc-toast { animation: sc-toast-in .42s cubic-bezier(.22,1,.36,1) both }
      .sc-row-in { animation: sc-row-in .32s cubic-bezier(.22,1,.36,1) both }
      .sc-pulse { animation: sc-pulse 1.9s cubic-bezier(.22,1,.36,1) infinite }
      @media (prefers-reduced-motion: reduce) {
        .sc-flash-up, .sc-flash-down, .sc-toast, .sc-row-in, .sc-pulse { animation: none }
      }
    `}</style>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }

/** Small button: solid white (primary), hairline (outline) or bare (ghost). */
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[12px] leading-none font-medium whitespace-nowrap transition-colors',
        FOCUS,
        variant === 'primary' && 'bg-white text-[#0e0e0e] hover:brightness-95',
        variant === 'outline' && 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09]',
        variant === 'ghost' && 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
        className,
      )}
      {...rest}
    />
  )
}

/** Pill label. `dot` draws a leading status dot in the tone colour; `pulse` gives it a breathing ring. */
export function Badge({
  tone = 'muted',
  dot = false,
  pulse = false,
  children,
  className,
}: {
  tone?: 'muted' | 'up' | 'down' | 'solid'
  dot?: boolean
  pulse?: boolean
  children: ReactNode
  className?: string
}) {
  const color = tone === 'up' ? UP : tone === 'down' ? DOWN : MUTED
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[10px] leading-none tracking-[0.06em] whitespace-nowrap uppercase',
        tone === 'solid' ? 'border-white/15 bg-white/[0.06] text-white' : 'border-white/10 bg-white/[0.03]',
        className,
      )}
      style={tone === 'solid' ? undefined : { color }}
    >
      {dot && (
        <span className="relative flex h-[5px] w-[5px] shrink-0">
          <span className="absolute inset-0 rounded-full" style={{ background: color }} />
          {pulse && <span className="sc-pulse absolute inset-0 rounded-full" style={{ background: color }} />}
        </span>
      )}
      {children}
    </span>
  )
}

/** Panel surface. */
export function Card({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-[8px] border border-white/10 bg-[#191919]', className)} {...rest}>
      {children}
    </div>
  )
}

/** 1px rule. */
export function Separator({ className, vertical = false }: { className?: string; vertical?: boolean }) {
  return <div aria-hidden className={cn('shrink-0 bg-white/10', vertical ? 'h-full w-px' : 'h-px w-full', className)} />
}

/** Button row / column that switches a value. Vertical in the sidebar, horizontal on phone. */
export function Tabs<T extends string>({
  value,
  onValueChange,
  items,
  orientation = 'vertical',
  className,
}: {
  value: T
  onValueChange: (v: T) => void
  items: { value: T; label: string; badge?: number }[]
  orientation?: 'vertical' | 'horizontal'
  className?: string
}) {
  return (
    <div role="tablist" className={cn('flex gap-1', orientation === 'vertical' ? 'flex-col' : 'flex-row', className)}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={value === it.value}
          onClick={() => onValueChange(it.value)}
          className={cn(
            'flex h-7 items-center gap-2 rounded-[6px] px-2 text-left text-[12px] leading-none transition-colors',
            FOCUS,
            orientation === 'horizontal' && 'flex-1 justify-center',
            value === it.value ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300',
          )}
        >
          {it.label}
          {!!it.badge && (
            <span className="ml-auto grid h-[15px] min-w-[15px] place-items-center rounded-full px-1 font-mono text-[9px] leading-none text-[#0e0e0e]" style={{ background: UP }}>
              {it.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

/** Pill group for the chart timeframe. */
export function Segmented({
  value,
  items,
  onChange,
  label,
}: {
  value: Timeframe
  items: readonly Timeframe[]
  onChange: (v: Timeframe) => void
  label: string
}) {
  return (
    <span role="group" aria-label={label} className="inline-flex items-center gap-[2px] rounded-full border border-white/10 bg-white/[0.03] p-[2px]">
      {items.map((it) => (
        <button
          key={it}
          type="button"
          aria-pressed={value === it}
          onClick={() => onChange(it)}
          className={cn(
            'rounded-full px-2 py-[3px] font-mono text-[10px] leading-none tracking-[0.06em] transition-colors',
            FOCUS,
            value === it ? 'bg-white text-[#0e0e0e]' : 'text-gray-500 hover:text-white',
          )}
        >
          {it}
        </button>
      ))}
    </span>
  )
}

/** − / value / + quantity control. */
export function Stepper({ value, onStep, label }: { value: number; onStep: (d: number) => void; label: string }) {
  const btn = cn(
    'grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[5px] border border-white/10 bg-white/[0.04] text-[13px] leading-none text-white transition-colors hover:bg-white/[0.1]',
    FOCUS,
  )
  return (
    <span className="inline-flex items-center gap-1.5">
      <button type="button" aria-label={`Decrease ${label}`} className={btn} onClick={() => onStep(-1)}>
        −
      </button>
      <output aria-label={label} className="min-w-[38px] text-center font-mono text-[13px] leading-none text-white">
        {value}
      </output>
      <button type="button" aria-label={`Increase ${label}`} className={btn} onClick={() => onStep(1)}>
        +
      </button>
    </span>
  )
}

/** Rotating quarter-arc, shown inside the order button while a fill is pending. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={cn('h-3 w-3 animate-spin', className)}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Notification bell with an unread count. */
export function Bell({ count }: { count: number }) {
  return (
    <span className="relative grid h-8 w-8 place-items-center rounded-[6px] border border-white/10 bg-white/[0.04]">
      <svg aria-hidden viewBox="0 0 16 16" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 6.6a4 4 0 1 1 8 0c0 2.4.7 3.4 1.2 3.9H2.8C3.3 10 4 9 4 6.6Z" strokeLinejoin="round" />
        <path d="M6.6 12.5a1.5 1.5 0 0 0 2.8 0" strokeLinecap="round" />
      </svg>
      <span className="sr-only">{count} unread notifications</span>
      {count > 0 && (
        <span
          data-testid="bell-count"
          className="absolute -top-[5px] -right-[5px] grid h-[15px] min-w-[15px] place-items-center rounded-full px-1 font-mono text-[9px] leading-none text-[#0e0e0e]"
          style={{ background: UP }}
        >
          {count}
        </span>
      )}
    </span>
  )
}

/**
 * Wrap a value that changes on a tick. The caller passes `key={rev}` so React remounts the span and the
 * keyframe re-runs — the cheapest way to retrigger a CSS animation without touching the DOM by hand.
 */
export function Flash({ dir, children, className }: { dir: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('-mx-1 rounded-[3px] px-1', dir === 'up' && 'sc-flash-up', dir === 'down' && 'sc-flash-down', className)}>
      {children}
    </span>
  )
}

/**
 * A number that tweens to its new value over `ms` instead of jumping. The rAF loop lives inside this leaf
 * component, so a 60 fps tween never re-renders the app around it. Test mode snaps straight to the value.
 */
export function AnimatedNumber({
  value,
  format,
  ms = 400,
  className,
  style,
}: {
  value: number
  format: (n: number) => string
  ms?: number
  className?: string
  style?: React.CSSProperties
}) {
  const [shown, setShown] = useState(value)
  const current = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      current.current = value
      setShown(value)
      return
    }
    const from = current.current
    if (from === value) return
    const t0 = performance.now()
    cancelAnimationFrame(raf.current)
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms)
      const eased = 1 - Math.pow(1 - k, 3)
      current.current = from + (value - from) * eased
      setShown(current.current)
      if (k < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value, ms])

  return (
    <span className={cn('tabular-nums', className)} style={style}>
      {format(shown)}
    </span>
  )
}

/** Inline sparkline drawn from a series; scales to the box, no axes. */
export function Sparkline({ data, className, color = MUTED }: { data: number[]; className?: string; color?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / span) * 22}`).join(' ')
  return (
    <svg aria-hidden viewBox="0 0 100 28" preserveAspectRatio="none" className={cn('h-7 w-full', className)}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

const PAD_TOP = 10
const PAD_BOTTOM = 16

/**
 * The main price chart: line + area over a hairline grid, with the last price riding the right edge.
 *
 * The series is one point longer than the visible window, and on every new intraday series the group is
 * snapped back one step and transitioned to zero — so the line *scrolls* continuously at the tick rate
 * instead of stuttering once per update. All of that is a single style write on a ref, no re-render.
 */
export function PriceChart({
  data,
  tone,
  slide,
  tag,
  className,
}: {
  data: number[]
  tone: Tone
  slide: boolean
  tag: string
  className?: string
}) {
  const scroller = useRef<SVGGElement>(null)
  const color = toneColor(tone)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = 100 / (data.length - 2)
  const y = (v: number) => PAD_TOP + (1 - (v - min) / span) * (100 - PAD_TOP - PAD_BOTTOM)
  const pts = data.map((v, i) => [(i - 1) * step, y(v)] as const)
  const line = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${yy.toFixed(2)}`).join('')
  const area = `${line}L100,100L${(-step).toFixed(2)},100Z`
  const lastY = pts[pts.length - 1][1]
  const id = `sc-chart-${tone}`

  useLayoutEffect(() => {
    const g = scroller.current
    if (!g) return
    if (!slide) {
      g.style.transition = 'none'
      g.style.transform = 'none'
      return
    }
    g.style.transition = 'none'
    g.style.transform = `translateX(${step}px)`
    void g.getBoundingClientRect()
    g.style.transition = 'transform 800ms linear'
    g.style.transform = 'translateX(0px)'
  }, [data, slide, step])

  return (
    <div className={cn('relative min-h-0 w-full flex-1', className)}>
      {/* Grid */}
      <div aria-hidden className="absolute inset-0">
        {[25, 50, 75].map((v) => (
          <span key={`h${v}`} className="absolute right-0 left-0 h-px bg-white/[0.055]" style={{ top: `${v}%` }} />
        ))}
        {[25, 50, 75].map((v) => (
          <span key={`v${v}`} className="absolute top-0 bottom-0 w-px bg-white/[0.055]" style={{ left: `${v}%` }} />
        ))}
      </div>
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <g ref={scroller}>
          <path d={area} fill={`url(#${id})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
        </g>
      </svg>
      {/* Last price tag, riding the line at the right edge */}
      <span
        aria-hidden
        className="absolute right-0 -translate-y-1/2 rounded-[4px] px-1.5 py-[3px] font-mono text-[10px] leading-none text-[#0e0e0e]"
        style={{ top: `${lastY}%`, background: color, transition: 'top 800ms linear' }}
      >
        {tag}
      </span>
      <span aria-hidden className="absolute right-0 h-px" style={{ top: `${lastY}%`, left: 0, background: `${color}44`, transition: 'top 800ms linear' }} />
    </div>
  )
}

/** One floating notification. Slides in from the top-right; the reducer drops it after ~4 s. */
export function Toast({ title, body, tone, onClose }: { title: string; body: string; tone: Tone; onClose: () => void }) {
  const color = toneColor(tone)
  return (
    <div
      role="status"
      className="sc-toast pointer-events-auto flex w-[248px] items-start gap-2 rounded-[8px] border border-white/12 bg-[#1d1d1d]/95 p-2.5 shadow-[0_18px_40px_rgba(0,0,0,.55)] backdrop-blur-sm"
    >
      <span className="mt-[3px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: color }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] leading-tight font-medium text-white">{title}</span>
        <span className="mt-[3px] block text-[11px] leading-tight text-gray-400">{body}</span>
      </span>
      <button
        type="button"
        aria-label={`Dismiss ${title}`}
        onClick={onClose}
        className={cn('-mt-0.5 -mr-0.5 shrink-0 rounded-[4px] p-1 text-gray-500 transition-colors hover:text-white', FOCUS)}
      >
        <svg viewBox="0 0 10 10" className="h-2 w-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M1 1 9 9M9 1 1 9" />
        </svg>
      </button>
    </div>
  )
}
