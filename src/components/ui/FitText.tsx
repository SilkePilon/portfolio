import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

/**
 * Scales a single line of text so its width equals the container width
 * (the template renders the giant "ELIAN" / "KENT" and footer wordmark this way).
 */
export function FitText({ text, className, lineHeight = 0.8 }: { text: string; className?: string; lineHeight?: number }) {
  const wrap = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState(100)

  useLayoutEffect(() => {
    const w = wrap.current
    const p = probe.current
    if (!w || !p) return
    const fit = () => {
      const natural = p.getBoundingClientRect().width
      if (natural > 0 && w.clientWidth > 0) setSize((w.clientWidth / natural) * 100)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(w)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [text])

  return (
    <div ref={wrap} className={cn('relative w-full', className)} style={{ lineHeight }}>
      <span ref={probe} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap" style={{ fontSize: 100, lineHeight }}>
        {text}
      </span>
      <span className="block whitespace-nowrap" style={{ fontSize: size }}>
        {text}
      </span>
    </div>
  )
}
