import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let instance: Lenis | null = null

/** Creates the app-wide Lenis instance (smooth scroll) synced to GSAP's ticker. */
export function createLenis(): Lenis {
  if (instance) return instance
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  instance = lenis
  ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis // used by the screenshot scripts
  const destroy = lenis.destroy.bind(lenis)
  lenis.destroy = () => {
    gsap.ticker.remove(tick)
    destroy()
    if (instance === lenis) instance = null
  }
  return lenis
}

export function getLenis(): Lenis | null {
  return instance
}
