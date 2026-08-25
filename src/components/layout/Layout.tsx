import { Outlet } from 'react-router-dom'
import { GridLines } from '@/components/ui/Section'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Preloader } from './Preloader'
import { ScrollManager } from './ScrollManager'
import { SmoothScroll } from './SmoothScroll'

/** Page shell: preloader (home, first load), navbar, ruled main column, footer. */
export function Layout() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <ScrollManager />
      <Navbar />
      <main className="theme-dark relative z-[1] flex w-full flex-col items-center gap-[100px] overflow-x-clip bg-black pb-[100px] text-white tablet:gap-[150px] tablet:pb-[150px]">
        <GridLines />
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
