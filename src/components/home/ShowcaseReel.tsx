'use client'
import { useLayoutEffect, useRef } from 'react'
import { Video } from '@/components/ui/Video'
import { home } from '@/content/home'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const [firstWord, secondWord] = home.reel.words

/**
 * Scroll-driven showcase reel: a sticky 100vh frame sitting over a 300vh spacer (400vh in total).
 * Scrubbed across that spacer the video window grows from 0.2 to full bleed while its content
 * un-zooms from 1.8 to 1, and the two words slide in from ±1200px to meet in the middle.
 */
export function ShowcaseReel() {
  const root = useRef<HTMLElement>(null)
  const holder = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLDivElement>(null)
  const second = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = root.current
    if (!section || import.meta.env.MODE === 'test') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let live = true
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 1 } })
      tl.fromTo(holder.current, { scale: 0.2 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(inner.current, { scale: 1.8 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(first.current, { x: -1200 }, { x: 0, ease: 'none' }, 0)
        .fromTo(second.current, { x: 1200 }, { x: 0, ease: 'none' }, 0)
    }, section)

    // Webfonts change the height of the sections above, which moves this trigger's start.
    document.fonts.ready.then(() => live && ScrollTrigger.refresh())

    return () => {
      live = false
      ctx.revert()
    }
  }, [])

  return (
    <section ref={root} id="reel" className="relative z-[2] flex w-full flex-col items-center justify-center overflow-clip">
      <div className="pointer-events-none sticky top-0 z-[1] flex h-screen w-full flex-col items-center justify-center overflow-clip tablet:flex-row">
        <div ref={holder} className="absolute top-0 left-0 z-[1] flex h-full w-full items-center justify-center overflow-clip will-change-transform">
          <div ref={inner} className="relative h-full w-full brightness-[0.6] will-change-transform">
            <Video src={home.reel.video} className="bg-black" />
          </div>
        </div>
        <div ref={first} className="relative z-[2] whitespace-pre text-display will-change-transform">
          {firstWord}
        </div>
        <div ref={second} className="relative z-[2] whitespace-pre text-display will-change-transform">
          {secondWord}
        </div>
      </div>
      <div id="text-trigger" className="relative h-[300vh] w-full" />
    </section>
  )
}
