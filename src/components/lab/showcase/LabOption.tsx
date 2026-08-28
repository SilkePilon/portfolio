'use client'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { cn } from '@/lib/cn'

export type ProgressFn = (p: number) => void

/**
 * Shared frame for a lab option: a sticky 100vh stage over a `heightVh` spacer. One ScrollTrigger scrubs the
 * spacer and reports progress (0..1) through `onProgress` — kept in a ref so children never re-render per frame.
 * Reduced motion / test mode: reports 1 once so the end state renders.
 */
export function LabOption({
  id,
  heightVh = 300,
  onProgress,
  className,
  children,
}: {
  id: string
  heightVh?: number
  onProgress: ProgressFn
  className?: string
  children: ReactNode
}) {
  const root = useRef<HTMLElement>(null)
  const cb = useRef(onProgress)
  cb.current = onProgress

  useLayoutEffect(() => {
    const section = root.current
    if (!section) return
    // Deferred: this layout effect runs before the parent option's own init effect, which would otherwise
    // overwrite the reported progress with its p=0 defaults.
    let live = true
    if (import.meta.env.MODE === 'test' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      queueMicrotask(() => live && cb.current(1))
      return () => {
        live = false
      }
    }
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => cb.current(self.progress),
    })
    queueMicrotask(() => live && cb.current(st.progress))
    document.fonts.ready.then(() => live && ScrollTrigger.refresh())
    return () => {
      live = false
      st.kill()
    }
  }, [])

  return (
    <section ref={root} id={id} data-lab-option className={cn('relative w-full', className)}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-clip">{children}</div>
      <div aria-hidden style={{ height: `${heightVh}vh` }} className="w-full" />
    </section>
  )
}

/** Clamp `p` into a sub-range [a, b] of the scroll, returning 0..1. */
export const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))
/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Ease-out expo, matches `--ease-out-expo` feel. */
export const easeOut = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
/** Ease in-out, close to `--ease-framer`. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
