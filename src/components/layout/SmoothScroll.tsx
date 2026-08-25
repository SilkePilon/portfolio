'use client'
import { useEffect } from 'react'
import { createLenis } from '@/lib/lenis'

/** Mounts the Lenis smooth-scroll instance for the whole app. */
export function SmoothScroll() {
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = createLenis()
    return () => lenis.destroy()
  }, [])
  return null
}
