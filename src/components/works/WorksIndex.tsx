'use client'
import { Appear } from '@/components/anim/Appear'
import { usePages, useWorks } from '@/components/layout/ContentProvider'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { WorkCard } from './WorkCard'
import { cn } from '@/lib/cn'

/** Desktop placement of the five cards on the 4-column grid (original works page). */
const placement: Record<string, string> = {
  glidex: 'desktop:col-start-1 desktop:col-span-1 desktop:row-start-1',
  veon: 'desktop:col-start-3 desktop:col-span-2 desktop:row-start-1',
  sienna: 'desktop:col-start-2 desktop:col-span-2 desktop:row-start-2',
  zayla: 'desktop:col-start-1 desktop:col-span-2 desktop:row-start-3',
  destello: 'desktop:col-start-2 desktop:col-span-2 desktop:row-start-4',
}
const order = ['glidex', 'veon', 'sienna', 'zayla', 'destello']

export function WorksIndex() {
  const pages = usePages()
  const works = useWorks()
  const sorted = [...works].sort((a, b) => (order.indexOf(a.slug) + 1 || 99) - (order.indexOf(b.slug) + 1 || 99))
  return (
    <Section as="header" className="pt-[100px] tablet:pt-[150px]">
      <Container className="gap-y-[70px]">
        <Appear preset="left" trigger="mount" className="col-span-2 flex flex-col gap-[30px] px-5 desktop:col-span-3">
          <SectionTag>{pages.works.tag}</SectionTag>
          <h1 className="text-h2">
            <RichSpan parts={pages.works.heading} />
          </h1>
        </Appear>
        <Appear preset="right" trigger="mount" delay={0.2} className="col-span-2 flex items-end px-5 desktop:col-span-1">
          <p className="text-mono text-gray-500 tablet:text-right">{pages.works.text}</p>
        </Appear>
        <div className="col-span-2 grid grid-cols-1 gap-y-[60px] tablet:grid-cols-2 desktop:col-span-4 desktop:grid-cols-4 desktop:gap-y-[100px]">
          {sorted.map((w, i) => (
            <Appear key={w.slug} preset="up" delay={0.1 * (i % 2)} className={cn('aspect-[580/450]', placement[w.slug] ?? 'desktop:col-span-2')}>
              <WorkCard work={w} />
            </Appear>
          ))}
        </div>
      </Container>
    </Section>
  )
}
