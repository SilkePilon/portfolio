import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { site } from '@/content/site'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { ArrowIcon } from '@/components/ui/Icons'
import { Logo } from '@/components/ui/Logo'
import { getLenis } from '@/lib/lenis'

/** Full-screen navigation overlay for tablet/phone. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      getLenis()?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="theme-dark fixed inset-0 z-[90] flex flex-col bg-black px-2.5 text-white tablet:px-5 desktop:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between border-b border-rule px-5 py-3.5">
            <Logo />
            <button type="button" aria-label="Close menu" onClick={onClose} className="flex size-10 items-center justify-center border border-rule">
              <span className="relative block size-5">
                <span className="absolute left-0 top-1/2 block h-px w-5 rotate-45 bg-white" />
                <span className="absolute left-0 top-1/2 block h-px w-5 -rotate-45 bg-white" />
              </span>
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto" aria-label="Mobile">
            <ul className="flex flex-col">
              {site.nav.map((l, i) => (
                <motion.li
                  key={l.to}
                  className="border-b border-rule"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.05 * i }}
                >
                  <Link to={l.to} onClick={onClose} className="flex items-center justify-between px-5 py-6 font-display text-[32px] font-normal uppercase leading-none tracking-[-0.02em]">
                    <span>{l.label}</span>
                    <ArrowIcon className="size-4" />
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="mt-auto border-t border-rule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.8, delay: 0.3 }}
            >
              <ArrowButton href={site.bookCall.href} bar>
                {site.bookCall.label}
              </ArrowButton>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
