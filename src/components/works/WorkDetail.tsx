'use client'
import type { Work } from '@/content/types'
import { Appear } from '@/components/anim/Appear'
import { usePages, useWorks } from '@/components/layout/ContentProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { WorkCard } from './WorkCard'

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-5 border-t border-rule py-2.5 text-mono">
      <span className="text-gray-500">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  )
}

/**
 * The server hands in the work it rendered; both it and the "next" card are looked up again by slug
 * in the client content so live-preview edits in the admin show up without a server round-trip.
 */
export function WorkDetail({ work: propWork, next: propNext }: { work: Work; next: Work }) {
  const pages = usePages()
  const all = useWorks()
  const work = all.find((w) => w.slug === propWork.slug) ?? propWork
  const next = all.find((w) => w.slug === propNext.slug) ?? propNext
  const L = pages.workLabels
  return (
    <>
      <Section as="header" className="pt-[100px] tablet:pt-[150px]">
        <Container className="gap-y-[60px]">
          <Appear preset="left" trigger="mount" className="col-span-2 flex flex-col gap-[30px] px-5 desktop:col-span-3">
            <SectionTag>{pages.works.tag}</SectionTag>
            <h1 className="text-h2">{work.title}</h1>
          </Appear>
          <Appear preset="right" trigger="mount" delay={0.2} className="col-span-2 flex items-end px-5 desktop:col-span-1">
            <p className="text-mono text-gray-500 tablet:text-right">{work.description}</p>
          </Appear>
          <Appear preset="fade" trigger="mount" delay={0.3} className="relative col-span-2 border-y border-rule p-2.5 tablet:p-5 desktop:col-span-4">
            <Corners />
            <img src={work.cover.src} alt={work.cover.alt} width={work.cover.width} height={work.cover.height} className="aspect-[16/9] w-full object-cover" />
          </Appear>
        </Container>
      </Section>

      <Section>
        <Container className="gap-y-[60px]">
          <Appear preset="left" className="col-span-2 px-5 desktop:col-span-1">
            <SectionTag>{L.overview}</SectionTag>
          </Appear>
          <Appear preset="up" className="col-span-2 flex flex-col gap-10 px-5 desktop:col-start-3">
            <p className="max-w-[560px] text-body-lg">{work.overview}</p>
            <div className="flex flex-col">
              <MetaRow label={L.date}>{work.date}</MetaRow>
              <MetaRow label={L.client}>{work.client}</MetaRow>
              <MetaRow label={L.industry}>{work.industry}</MetaRow>
              <MetaRow label={L.services}>
                {work.services.map((s) => (
                  <span key={s} className="block">
                    {s}
                  </span>
                ))}
              </MetaRow>
              {work.liveUrl && (
                <MetaRow label={L.live}>
                  <a href={work.liveUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-gray-300">
                    {work.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                </MetaRow>
              )}
            </div>
          </Appear>
          <div className="col-span-2 grid grid-cols-1 tablet:grid-cols-2 desktop:col-span-4 desktop:grid-cols-4">
            {work.gallery.map((g, i) => (
              <Appear key={g.src + i} preset="up" delay={0.1 * (i % 2)} className="relative border-y border-rule p-2.5 tablet:p-5 desktop:col-span-2 desktop:[&:nth-child(odd)]:col-start-1">
                <Corners />
                <img src={g.src} alt={g.alt} width={g.width} height={g.height} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              </Appear>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="gap-y-[30px]">
          <Appear preset="left" className="col-span-2 px-5 desktop:col-span-1">
            <SectionTag>{L.next}</SectionTag>
          </Appear>
          <Appear preset="up" className="col-span-2 flex flex-col gap-5 desktop:col-start-3">
            <div className="aspect-[580/450]">
              <WorkCard work={next} />
            </div>
            <div className="relative border-y border-rule">
              <Corners variant="2-bottom" />
              <ArrowButton to="/works" bar>
                {L.cta}
              </ArrowButton>
            </div>
          </Appear>
        </Container>
      </Section>
    </>
  )
}
