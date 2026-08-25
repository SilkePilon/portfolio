'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getLenis } from '@/lib/lenis'

function scrollTo(target: number | HTMLElement, immediate: boolean) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(target, { immediate, offset: 0 })
  else if (typeof target === 'number') window.scrollTo(0, target)
  else target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.slice(1))
  let tries = 0
  let raf = 0
  const look = () => {
    const el = document.getElementById(id)
    if (el) scrollTo(el, false)
    else if (tries++ < 60) raf = requestAnimationFrame(look)
  }
  look()
  return () => cancelAnimationFrame(raf)
}

/** Scrolls to the top on route changes and to `#section` targets (also when arriving from another route). */
export function ScrollManager() {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) {
      scrollTo(0, true)
      return
    }
    return scrollToHash(hash)
  }, [pathname])

  useEffect(() => {
    let cancel: (() => void) | undefined
    const onHash = () => {
      cancel?.()
      if (window.location.hash) cancel = scrollToHash(window.location.hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('hashchange', onHash)
      cancel?.()
    }
  }, [])

  return null
}
