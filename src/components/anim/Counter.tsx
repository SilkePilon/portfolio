'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { cn } from '@/lib/cn'

type Props = { end: number; suffix?: string; prefix?: string; duration?: number; className?: string }

/** Counts from 0 to `end` (ease-out) the first time it scrolls into view. */
export function Counter({ end, suffix = '', prefix = '', duration = 2, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * end))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, end, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
