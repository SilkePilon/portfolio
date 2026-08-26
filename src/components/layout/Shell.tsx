'use client'
import type { ReactNode } from 'react'
import type { Content } from '@/lib/content'
import { GridLines } from '@/components/ui/Section'
import { ContentProvider } from './ContentProvider'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Preloader } from './Preloader'
import { ScrollManager } from './ScrollManager'
import { SmoothScroll } from './SmoothScroll'

/** Page shell: preloader (home, first load), navbar, ruled main column, footer. */
export function Shell({ content, children }: { content: Content; children: ReactNode }) {
  return (
    <ContentProvider value={content}>
      <Preloader />
      <SmoothScroll />
      <ScrollManager />
      <Navbar />
      <main className="theme-dark relative flex w-full flex-col items-center gap-[100px] overflow-x-clip bg-black pb-[100px] text-white tablet:gap-[150px] tablet:pb-[150px]">
        <GridLines />
        {children}
      </main>
      <Footer />
    </ContentProvider>
  )
}
