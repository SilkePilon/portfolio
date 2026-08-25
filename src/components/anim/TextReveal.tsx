'use client'
import { createElement, useLayoutEffect, useRef } from 'react'
import { gsap, SplitText } from '@/lib/gsap'

type Props = { children: string; className?: string; as?: 'p' | 'h2' | 'h3' | 'div' }

/**
 * Scroll-scrubbed character reveal (the About paragraphs): characters start at 40% opacity and
 * brighten one after another as the block moves from 90% to 70% of the viewport.
 */
export function TextReveal({ children, className, as = 'p' }: Props) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || import.meta.env.MODE === 'test') return
    const ctx = gsap.context(() => {
      SplitText.create(el, {
        type: 'words,chars',
        wordsClass: 'inline-block whitespace-nowrap',
        autoSplit: true,
        onSplit: (self) =>
          gsap.fromTo(
            self.chars,
            { opacity: 0.4 },
            { opacity: 1, duration: 1, stagger: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 70%', scrub: true } },
          ),
      })
    }, el)
    return () => ctx.revert()
  }, [children])

  return createElement(as, { ref, className }, children)
}
