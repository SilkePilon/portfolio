'use client'
import { Appear } from '@/components/anim/Appear'
import { TextReveal } from '@/components/anim/TextReveal'
import { useHome } from '@/components/layout/ContentProvider'
import { Corners } from '@/components/ui/Corners'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'

/** Portrait crop with its corner markers: column-stacked on phone/desktop, side-by-side only at tablet width. */
function Portrait() {
  const { image1, caption } = useHome().about
  return (
    <Appear
      preset="fade"
      className="col-span-2 flex flex-col items-end gap-[14px] px-2.5 tablet:flex-row tablet:gap-0 tablet:px-5 desktop:col-span-1 desktop:col-start-4 desktop:flex-col desktop:gap-[30px] desktop:px-5"
    >
      <div className="relative w-full border-y border-rule p-2.5 tablet:w-auto tablet:flex-1 tablet:p-5 desktop:w-full desktop:flex-none">
        <Corners />
        <img
          src={image1.src}
          alt={image1.alt}
          width={image1.width}
          height={image1.height}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
        />
      </div>
      <p className="max-w-[280px] pr-2.5 text-right text-mono tablet:flex-1 tablet:pr-5 desktop:pr-0">
        <RichSpan parts={caption} />
      </p>
    </Appear>
  )
}

/** About-section copy + portrait, then the outcome photo and the "driven result" line — mirrors Section - About / Container - metrices title. */
export function About() {
  const { tag, paragraphs, image2, resultTag, resultHeading } = useHome().about
  return (
    <Section id="about">
      <div className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <Container>
          <Appear preset="up" className="col-span-2 flex flex-col gap-5 px-2.5 tablet:gap-[30px] tablet:px-5">
            <SectionTag>{tag}</SectionTag>
            <div className="flex flex-col gap-[29px] tablet:gap-[36px] desktop:gap-[45px]">
              <TextReveal key={paragraphs.join('|')} className="flex flex-col gap-10" paragraphClassName="text-h3">
                {paragraphs}
              </TextReveal>
            </div>
          </Appear>

          <Portrait />
        </Container>

        <Container>
          <Appear preset="fade" className="relative col-span-2 border border-rule bg-black p-2.5 tablet:p-5">
            <Corners />
            <img
              src={image2.src}
              alt={image2.alt}
              width={image2.width}
              height={image2.height}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </Appear>

          <Appear preset="left" className="col-span-2 flex flex-col justify-end gap-5 px-2.5 tablet:gap-[30px] tablet:px-5 desktop:py-5">
            <SectionTag>{resultTag}</SectionTag>
            <h3 className="max-w-[700px] text-h3">
              <RichSpan parts={resultHeading} />
            </h3>
          </Appear>
        </Container>
      </div>
    </Section>
  )
}
