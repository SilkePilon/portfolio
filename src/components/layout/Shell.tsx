'use client'
import type { ReactNode } from 'react'
import { GridLines } from '@/components/ui/Section'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Preloader } from './Preloader'
import { ScrollManager } from './ScrollManager'
import { SiteProvider, type SiteContent } from './SiteProvider'
import { SmoothScroll } from './SmoothScroll'

/** Page shell: preloader (home, first load), navbar, ruled main column, footer. */
export function Shell({ site, children }: { site: SiteContent; children: ReactNode }) {
  return (
    <SiteProvider value={site}>
      <Preloader />
      <SmoothScroll />
      <ScrollManager />
      <Navbar />
      <main className="theme-dark relative flex w-full flex-col items-center gap-[100px] overflow-x-clip bg-black pb-[100px] text-white tablet:gap-[150px] tablet:pb-[150px]">
        <GridLines />
        {children}
      </main>
      <Footer />
    </SiteProvider>
  )
}
