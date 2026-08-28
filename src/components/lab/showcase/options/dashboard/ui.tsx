'use client'
/**
 * Hand-built shadcn/ui look-alikes (zinc dark) for the lab's deploy dashboard — no extra dependency.
 * Cards `#141414` on a `#0e0e0e` shell, 1px `white/10` rules, 8/6px radii, `white/40` focus ring,
 * Inter for UI copy and IBM Plex Mono for values. One accent only: `--accent` (#7dd3a0) for "healthy".
 */
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export const ACCENT = '#7dd3a0'

const FOCUS = 'outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' }

/** Small button: solid white (primary), hairline (outline) or bare (ghost). */
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[12px] leading-none font-medium whitespace-nowrap transition-colors',
        FOCUS,
        variant === 'primary' && 'bg-white text-[#0e0e0e] hover:bg-white/85',
        variant === 'outline' && 'border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.09]',
        variant === 'ghost' && 'text-gray-400 hover:bg-white/[0.06] hover:text-white',
        className,
      )}
      {...rest}
    />
  )
}

/** Track + thumb switch. Controlled; `onToggle` fires on click and on keyboard activation. */
export function Switch({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn('relative h-[18px] w-[32px] shrink-0 rounded-full transition-colors', FOCUS, checked ? 'bg-white' : 'bg-white/15')}
    >
      <span
        className={cn(
          'absolute top-[3px] left-[3px] h-3 w-3 rounded-full transition-transform duration-150',
          checked ? 'translate-x-[14px] bg-[#0e0e0e]' : 'bg-[#8a8a8a]',
        )}
      />
    </button>
  )
}

/** Pill label. `dot` draws a leading status dot in the tone colour. */
export function Badge({
  tone = 'muted',
  dot = false,
  children,
  className,
}: {
  tone?: 'muted' | 'success' | 'danger' | 'solid'
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  const color = tone === 'success' ? ACCENT : tone === 'danger' ? '#e08b8b' : '#999999'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[10px] leading-none tracking-[0.06em] uppercase',
        tone === 'solid' ? 'border-white/15 bg-white/[0.06] text-white' : 'border-white/10 bg-white/[0.03]',
        className,
      )}
      style={tone === 'solid' ? undefined : { color }}
    >
      {dot && <span className="h-[5px] w-[5px] rounded-full" style={{ background: color }} />}
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

/** Determinate bar, `value` is 0..1. */
export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  )
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
  items: { value: T; label: string }[]
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
            'h-7 rounded-[6px] px-2 text-left text-[12px] leading-none transition-colors',
            FOCUS,
            orientation === 'horizontal' && 'flex-1 text-center',
            value === it.value ? 'bg-white/[0.08] text-white' : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300',
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  )
}

/** Inline sparkline drawn from a fixed series; scales to the box, no axes. */
export function Sparkline({ data, className, color = '#8f8f8f' }: { data: number[]; className?: string; color?: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24 - 2}`)
    .join(' ')
  return (
    <svg aria-hidden viewBox="0 0 100 28" preserveAspectRatio="none" className={cn('h-7 w-full', className)}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.25" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

/** Rotating quarter-arc used inside the Deploy button while the pipeline runs. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={cn('h-3 w-3 animate-spin', className)}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
