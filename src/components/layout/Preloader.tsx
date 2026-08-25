import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useLocation } from 'react-router-dom'
import { site } from '@/content/site'
import { getLenis } from '@/lib/lenis'

let played = false
/** True once the intro overlay has run during this page load (Hero uses it to keep its delays in sync). */
export const wasPreloaderShown = () => played

const EASE = [0.79, 0.04, 0.16, 1] as const
const HOLD_MS = 1000
const TOTAL_MS = 2400

/**
 * "Panels Intro" from the template: four white panels with the brand name; after 1s the name drops out
 * and the panels collapse downward one after another. Only on the first load of the home page.
 */
export function Preloader() {
  const { pathname } = useLocation()
  // Decided during render (not in an effect) so siblings rendered in the same commit — the Hero — already see `wasPreloaderShown()`.
  const [visible, setVisible] = useState(() => {
    const show = !played && pathname === '/'
    if (show) played = true
    return show
  })
  const [exit, setExit] = useState(false)

  useEffect(() => {
    if (!visible) return
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()
    const t1 = window.setTimeout(() => setExit(true), HOLD_MS)
    const t2 = window.setTimeout(() => {
      setVisible(false)
      document.body.style.overflow = ''
      getLenis()?.start()
    }, TOTAL_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      document.body.style.overflow = ''
      getLenis()?.start()
    }
  }, [visible])

  if (!visible) return null
  const chars = Array.from(site.name)
  return (
    <div data-testid="preloader" className="pointer-events-none fixed inset-0 z-[100] flex" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="relative flex-1">
          <motion.div
            className="absolute left-[-1.5%] top-0 h-full w-[103%] bg-white"
            style={{ transformOrigin: 'bottom' }}
            initial={{ scaleY: 1 }}
            animate={exit ? { scaleY: 0 } : { scaleY: 1 }}
            transition={{ duration: 1, ease: EASE, delay: exit ? 0.12 * i : 0 }}
          />
        </div>
      ))}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-h4 text-black"
        initial={{ y: 0 }}
        animate={exit ? { y: 260 } : { y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {chars.map((c, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 1, delay: 0.05 * i }}
          >
            {c === ' ' ? ' ' : c}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
