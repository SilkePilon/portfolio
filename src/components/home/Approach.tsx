'use client'
import { Appear } from '@/components/anim/Appear'
import { useHome } from '@/components/layout/ContentProvider'
import { Corners } from '@/components/ui/Corners'
import { Dots } from '@/components/ui/Dots'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { cn } from '@/lib/cn'

/** Approach(04) — light section: heading row (tag + h2, lead paragraph pinned right on desktop), then a
 * 4:3 photo beside a 2×2 grid of numbered process steps with dot progress markers. */
export function Approach() {
  const { tag, heading, text, image, steps } = useHome().approach

  return (
    <Section id="approach" tone="light">
      <Container grid={false} className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <div className="flex w-full flex-col items-start gap-3.5 px-2.5 tablet:gap-5 tablet:px-5 desktop:flex-row desktop:items-end desktop:justify-between desktop:gap-0">
          <Appear preset="left" className="flex w-full flex-col items-start gap-5 tablet:gap-[30px] desktop:flex-1">
            <SectionTag>{tag}</SectionTag>
            <h2 className="text-h2">
              <RichSpan parts={heading} />
            </h2>
          </Appear>
          <Appear as="p" preset="right" className="w-full text-mono desktop:max-w-[280px] desktop:text-right">
            {text}
          </Appear>
        </div>

        <div className="grid w-full grid-cols-2">
          <Appear preset="fade" className="relative col-span-2 border border-rule p-2.5 desktop:col-span-1 desktop:p-5">
            <Corners />
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </Appear>

          <Appear preset="fade" className="col-span-2 grid grid-cols-1 tablet:grid-cols-2 desktop:col-span-1">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={cn(
                  'relative flex min-h-[200px] flex-col justify-between gap-5 border-t border-rule p-5',
                  i >= steps.length - 2 && 'border-b',
                )}
              >
                <Corners />
                <div className="flex items-center justify-between">
                  <span className="text-mono">{String(i + 1).padStart(2, '0')}/</span>
                  <Dots active={step.dots} />
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-h5">{step.title}</h3>
                  <p className="text-mono">{step.text}</p>
                </div>
              </div>
            ))}
          </Appear>
        </div>
      </Container>
    </Section>
  )
}
