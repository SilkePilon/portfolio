'use client'
import { Appear } from '@/components/anim/Appear'
import { Chip } from '@/components/ui/Chip'
import { Corners } from '@/components/ui/Corners'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { home } from '@/content/home'
import { cn } from '@/lib/cn'

/** Services(04) — light section: heading, two lead photos, then the four-row service list. */
export function Services() {
  const { tag, heading, text, images, rows } = home.services
  const [image1, image2] = images

  return (
    <Section id="services" tone="light">
      <Container grid={false} className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <div className="flex w-full flex-col items-start gap-3.5 px-2.5 tablet:gap-5 tablet:px-5 desktop:flex-row desktop:items-end desktop:gap-0">
          <div className="flex w-full flex-col items-start gap-5 tablet:gap-[30px] desktop:flex-1">
            <Appear preset="left">
              <SectionTag>{tag}</SectionTag>
            </Appear>
            <Appear preset="left" className="w-full">
              <h2 className="max-w-[500px] text-h2">
                <RichSpan parts={heading} />
              </h2>
            </Appear>
          </div>
          <Appear as="p" preset="right" className="w-full max-w-[300px] text-mono desktop:text-right">
            {text}
          </Appear>
        </div>

        <div className="flex w-full flex-col tablet:flex-row">
          <Appear preset="fade" className="relative w-full border border-rule p-2.5 tablet:flex-1 tablet:p-5">
            <Corners />
            <img
              src={image1.src}
              alt={image1.alt}
              width={image1.width}
              height={image1.height}
              loading="lazy"
              className="aspect-[1.16] w-full object-cover"
            />
          </Appear>
          <Appear
            preset="fade"
            className="relative w-full border border-rule border-t-0 p-2.5 tablet:flex-1 tablet:border-t tablet:border-l-0 tablet:p-5"
          >
            <Corners />
            <img
              src={image2.src}
              alt={image2.alt}
              width={image2.width}
              height={image2.height}
              loading="lazy"
              className="aspect-[1.65714] w-full object-cover"
            />
          </Appear>
        </div>

        <div className="flex w-full flex-col">
          {rows.map((row, i) => (
            <Appear
              key={row.title}
              preset="fade"
              className={cn(
                'relative grid w-full grid-cols-1 gap-y-3.5 border-t border-rule pt-3.5 pb-2.5 tablet:grid-cols-2 tablet:gap-y-5 tablet:py-5 desktop:grid-cols-4 desktop:gap-y-0',
                i === rows.length - 1 && 'border-b',
              )}
            >
              <Corners />
              <p className="self-start px-2.5 text-mono tablet:px-5">{String(i + 1).padStart(2, '0')}/</p>
              <div className="flex w-full flex-col gap-2.5 self-start px-2.5 tablet:px-5">
                <h3 className="max-w-[200px] text-h5">{row.title}</h3>
                <p className="max-w-[300px] text-mono text-gray-500">{row.text}</p>
              </div>
              <div className="flex w-full flex-wrap items-start gap-2 self-start px-2.5 tablet:px-5">
                {row.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
              <div className="w-full self-start px-2.5 tablet:px-5">
                <img
                  src={row.image.src}
                  alt={row.image.alt}
                  width={row.image.width}
                  height={row.image.height}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Appear>
          ))}
        </div>
      </Container>
    </Section>
  )
}
