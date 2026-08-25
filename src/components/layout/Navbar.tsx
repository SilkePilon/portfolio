'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSite } from '@/components/layout/SiteProvider'
import { cn } from '@/lib/cn'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { Logo } from '@/components/ui/Logo'
import { SlideText } from '@/components/ui/SlideText'
import { MobileMenu } from './MobileMenu'

/** Static top bar: logo, centred links (desktop) or hamburger (tablet/phone), "Book a Call" cell. */
export function Navbar() {
  const site = useSite()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const overlay = pathname === '/'

  return (
    <>
      <nav
        className={cn(
          'theme-dark z-20 w-full border-b border-rule bg-black px-2.5 text-white tablet:px-5',
          overlay ? 'absolute left-0 top-0' : 'relative',
        )}
        aria-label="Main"
      >
        <div className="relative mx-auto flex w-full max-w-[1600px] items-center border-x border-rule">
          <Corners variant="2-bottom" />
          <div className="flex flex-1 items-center justify-between px-5 py-3.5 desktop:flex-none desktop:py-0 desktop:pr-0">
            <Logo />
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="flex size-10 flex-col items-center justify-center gap-[6px] border border-rule desktop:hidden"
            >
              <span className={cn('block h-px w-5 bg-white transition-transform duration-300', open && 'translate-y-[3.5px] rotate-45')} />
              <span className={cn('block h-px w-5 bg-white transition-transform duration-300', open && '-translate-y-[3.5px] -rotate-45')} />
            </button>
          </div>
          <ul className="hidden flex-[2] items-center justify-center gap-[30px] desktop:flex">
            {site.nav.map((l) => (
              <li key={l.to}>
                <Link href={l.to} className="group block py-[25px] text-nav">
                  <SlideText text={l.label} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="hidden w-[290px] border-l border-rule desktop:block">
            <ArrowButton href={site.bookCall.href}>{site.bookCall.label}</ArrowButton>
          </div>
        </div>
      </nav>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}
