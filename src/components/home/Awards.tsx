'use client'
import { Appear } from '@/components/anim/Appear'
import { useHome, useLists } from '@/components/layout/ContentProvider'
import { Corners } from '@/components/ui/Corners'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { cn } from '@/lib/cn'

/** Awards & Recognitions — dark section: tag/heading/sentence on the left, four numbered award
 * rows (name left, description right on tablet+, stacked on phone) on the right. */
export function Awards() {
  const { tag, heading, sentence } = useHome().awards
  const list = useLists().awards

  return (
    <Section id="awards">
      <Container className="gap-y-[30px] tablet:gap-y-[50px]">
        <Appear preset="left" className="col-span-2 flex flex-col items-start gap-5 px-2.5 tablet:gap-[30px] tablet:px-5">
          <SectionTag>{tag}</SectionTag>
          <h2 className="max-w-[600px] text-h2">
            <RichSpan parts={heading} />
          </h2>
          <p className="max-w-[450px] text-lead">
            <RichSpan parts={sentence} />
          </p>
        </Appear>

        <Appear preset="fade" className="relative col-span-2 flex flex-col">
          <Corners />
          {list.map((award, i) => (
            <div
              key={award.name}
              className={cn(
                'flex flex-col gap-2.5 border-t border-rule p-5 tablet:flex-row tablet:items-center tablet:justify-between',
                i === list.length - 1 && 'border-b',
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-mono">{String(i + 1).padStart(2, '0')}/</span>
                <h4 className="text-lead">{award.name}</h4>
              </div>
              <p className="text-mono text-gray-400 tablet:max-w-[300px] tablet:text-right">{award.text}</p>
            </div>
          ))}
        </Appear>
      </Container>
    </Section>
  )
}
