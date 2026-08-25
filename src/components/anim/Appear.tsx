import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export type AppearPreset = 'fade' | 'up' | 'left' | 'right' | 'scale'

const presets: Record<AppearPreset, { opacity: number; x?: number; y?: number; scale?: number }> = {
  fade: { opacity: 0 },
  up: { opacity: 0, y: 40 },
  left: { opacity: 0, x: -30 },
  right: { opacity: 0, x: 30 },
  scale: { opacity: 0, scale: 1.2 },
}

const tags = { div: motion.div, section: motion.section, span: motion.span, li: motion.li, p: motion.p, header: motion.header } as const

type Props = {
  preset?: AppearPreset
  delay?: number
  duration?: number
  /** Fraction of the element that must be visible before it animates (view trigger). */
  amount?: number
  x?: number
  y?: number
  trigger?: 'view' | 'mount'
  className?: string
  style?: CSSProperties
  children?: ReactNode
  as?: keyof typeof tags
  id?: string
}

/**
 * The template's "appear" effects: spring (bounce 0), fade + offset, once, when the element scrolls into view
 * (or immediately on mount for above-the-fold content). Honours prefers-reduced-motion.
 */
export function Appear({ preset = 'up', delay = 0, duration = 1, amount = 0.15, x, y, trigger = 'view', className, style, children, as = 'div', id }: Props) {
  const reduce = useReducedMotion()
  const M = tags[as]
  const from = { ...presets[preset], ...(x !== undefined && { x }), ...(y !== undefined && { y }) }
  const to = { opacity: 1, x: 0, y: 0, scale: 1 }
  const transition = { type: 'spring' as const, bounce: 0, duration, delay }
  if (reduce) {
    return (
      <M id={id} className={className} style={style}>
        {children}
      </M>
    )
  }
  return trigger === 'mount' ? (
    <M id={id} className={className} style={style} initial={from} animate={to} transition={transition}>
      {children}
    </M>
  ) : (
    <M id={id} className={className} style={style} initial={from} whileInView={to} viewport={{ once: true, amount }} transition={transition}>
      {children}
    </M>
  )
}
