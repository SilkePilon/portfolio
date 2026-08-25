import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '@/lib/lenis'

function scrollTo(target: number | HTMLElement, immediate: boolean) {
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(target, { immediate, offset: 0 })
  else if (typeof target === 'number') window.scrollTo(0, target)
  else target.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' })
}

/** Scrolls to the top on route changes and to `#section` targets (also from other routes). */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      scrollTo(0, true)
      return
    }
    const id = hash.slice(1)
    let tries = 0
    let raf = 0
    const look = () => {
      const el = document.getElementById(id)
      if (el) scrollTo(el, false)
      else if (tries++ < 60) raf = requestAnimationFrame(look)
    }
    look()
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash, key])

  return null
}
