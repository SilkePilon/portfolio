'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Appear } from '@/components/anim/Appear'
import { useHome, useLists } from '@/components/layout/ContentProvider'
import { Corners } from '@/components/ui/Corners'
import { Dots } from '@/components/ui/Dots'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { cn } from '@/lib/cn'

const slideEase = 'transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]'

/** Prev/Next label: same slide-up-and-replace hover as `ArrowButton`, but centred with no bar/arrow. */
function ControlLabel({ children }: { children: string }) {
  return (
    <span className="relative block h-[1em] overflow-hidden">
      <span className={cn('block', slideEase, 'group-hover:translate-y-full')}>{children}</span>
      <span aria-hidden className={cn('absolute left-0 top-0 block -translate-y-full', slideEase, 'group-hover:translate-y-0')}>
        {children}
      </span>
    </span>
  )
}

/** Slider card: quote + author fade/slide between testimonials, `Dots` tracks the active index. */
export function Testimonials() {
  const { tag, heading, prev, next } = useHome().testimonials
  const items = useLists().testimonials
  const count = items.length
  const [index, setIndex] = useState(0)
  const item = items[index]

  const goPrev = () => setIndex((i) => (i - 1 + count) % count)
  const goNext = () => setIndex((i) => (i + 1) % count)

  return (
    <Section id="testimonials">
      <div className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <Container>
          <Appear
            preset="up"
            className="col-span-2 flex flex-col items-center gap-5 px-2.5 text-center tablet:px-5 desktop:col-start-2"
          >
            <SectionTag>{tag}</SectionTag>
            <h2 className="max-w-[600px] text-h2">
              <RichSpan parts={heading} />
            </h2>
          </Appear>
        </Container>

        <Container>
          <Appear preset="fade" className="col-span-2 desktop:col-start-2">
            <div className="relative border-y border-rule">
              <div className="relative border-x border-rule p-[30px] tablet:p-10 desktop:h-[500px]">
                <Corners />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex h-full flex-col items-center justify-between gap-10 text-center"
                  >
                    <p className="max-w-[450px] text-body-lg">{item.quote}</p>
                    <div className="flex flex-col items-center gap-5">
                      <img
                        src={item.avatar.src}
                        alt={item.avatar.alt}
                        width={40}
                        height={40}
                        loading="lazy"
                        className="size-10 shrink-0 rounded-full object-cover"
                      />
                      <div className="flex flex-col items-center gap-[5px]">
                        <span className="text-mono-bold">{item.name}</span>
                        <span className="text-mono text-white/60">{item.role}</span>
                      </div>
                      <Dots active={(index + 1) as 1 | 2 | 3 | 4} />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous testimonial"
                  className="group relative flex cursor-pointer items-center justify-center border-r border-t border-rule py-5 text-nav text-fg"
                >
                  <ControlLabel>{prev}</ControlLabel>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next testimonial"
                  className="group relative flex cursor-pointer items-center justify-center border-t border-rule py-5 text-nav text-fg"
                >
                  <ControlLabel>{next}</ControlLabel>
                </button>
              </div>
            </div>
          </Appear>
        </Container>
      </div>
    </Section>
  )
}
