import { Hero } from '@/components/home/Hero'
import { BioStrip } from '@/components/home/BioStrip'
import { About } from '@/components/home/About'
import { Metrics } from '@/components/home/Metrics'
import { ShowcaseReel } from '@/components/home/ShowcaseReel'
import { WorksGrid } from '@/components/home/WorksGrid'
import { Services } from '@/components/home/Services'
import { Testimonials } from '@/components/home/Testimonials'
import { Clients } from '@/components/home/Clients'
import { Approach } from '@/components/home/Approach'
import { Awards } from '@/components/home/Awards'
import { BlogsPreview } from '@/components/home/BlogsPreview'
import { Faq } from '@/components/home/Faq'
import { Contact } from '@/components/home/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <BioStrip />
      <div className="flex w-full flex-col items-center gap-[70px]">
        <About />
        <Metrics />
      </div>
      <ShowcaseReel />
      <WorksGrid />
      <Services />
      <Testimonials />
      <Clients />
      <Approach />
      <Awards />
      <BlogsPreview />
      <Faq />
      <Contact />
    </>
  )
}
