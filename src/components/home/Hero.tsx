'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { Appear } from '@/components/anim/Appear'
import { wasPreloaderShown } from '@/components/layout/Preloader'
import { Corners } from '@/components/ui/Corners'
import { FitText } from '@/components/ui/FitText'
import { RichSpan } from '@/components/ui/RichText'
import { Container, GridLines, Section } from '@/components/ui/Section'
import { home } from '@/content/home'

const { badge, image, intro, name } = home.hero

/** The original delays are timed against the preloader's 1s hold; without it everything starts 1s earlier. */
const heroDelay = (t: number) => (wasPreloaderShown() ? t : Math.max(0, t - 1))

/** Both grid rows: 1 column on phone, 2 on tablet, 4 on desktop, all rows sized to their content. */
const row = 'relative grid w-full auto-rows-min grid-cols-1 justify-center tablet:grid-cols-2 desktop:grid-cols-4'
/** The giant fit-to-width wordmarks. The tracking has to sit on FitText's own spans: `em` letter-spacing
 *  resolves against the element's font size, and only those spans carry the fitted size. */
const wordmark = 'font-display font-bold uppercase [&_span]:tracking-[-0.05em]'
/** Desktop-only filler cell keeping the 4-column rhythm. */
const spacer = 'relative hidden h-px w-full self-start desktop:block'

/** Full-viewport opening: portrait behind the ELIAN / KENT wordmarks, intro copy and the certification badge. */
export function Hero() {
  // Framer parallax (speed 90): the photo scrolls 10% slower than the page.
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, (v) => v * 0.1)
  return (
    <Section as="header" id="hero" className="isolate flex min-h-[calc(100svh-69px)] items-end justify-center overflow-clip tablet:min-h-0 tablet:h-[calc(100svh-65px)]">
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0 z-0">
      <Appear
        preset="scale"
        duration={1.5}
        delay={heroDelay(1)}
        trigger="mount"
        className="absolute inset-0"
      >
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="size-full object-cover object-center"
        />
      </Appear>
      </motion.div>
      <GridLines className="z-[1]" />

      <Container grid={false} className="z-[1] flex flex-col items-start justify-end">
        <div className={`${row} overflow-clip`}>
          <Appear
            preset="left"
            x={-150}
            duration={1}
            delay={heroDelay(1.4)}
            trigger="mount"
            className="pointer-events-none relative order-2 w-full self-start tablet:order-none desktop:col-span-2"
          >
            <h1 className={wordmark}>
              <FitText text={name[0]} />
            </h1>
          </Appear>

          <div aria-hidden className={spacer} />

          <div className="relative order-1 flex h-min w-full items-end justify-end overflow-clip p-2.5 tablet:order-none tablet:self-end tablet:p-0 tablet:pb-5">
            <Appear
              as="p"
              preset="fade"
              duration={1.5}
              delay={heroDelay(1.8)}
              trigger="mount"
              className="max-w-[350px] flex-1 text-mono tablet:text-right"
            >
              <RichSpan parts={intro} mutedClass="text-white tablet:text-white/60" />
            </Appear>
          </div>
        </div>

        <div className={`${row} gap-y-2.5 tablet:gap-y-0`}>
          <div className="relative order-1 flex h-min w-full items-end justify-end self-end justify-self-start pb-10 tablet:pb-5 desktop:order-none">
            <Appear
              preset="fade"
              duration={1.5}
              delay={heroDelay(2)}
              trigger="mount"
              className="relative flex h-min flex-1 items-center justify-center gap-2.5 border-y border-rule bg-black/20 p-5"
            >
              <Corners />
              <img src="/images/resend-icon-white.svg" alt="Resend" width={28} height={28} className="size-7 shrink-0" />
              <span className="flex-1 whitespace-nowrap text-mono text-[11px]">{badge}</span>
            </Appear>
          </div>

          <div aria-hidden className={spacer} />

          <Appear
            preset="right"
            x={150}
            duration={1}
            delay={heroDelay(1.6)}
            trigger="mount"
            className="pointer-events-none relative w-full self-start desktop:col-span-2"
          >
            <h1 className={wordmark}>
              <FitText text={name[1]} />
            </h1>
          </Appear>
        </div>
      </Container>
    </Section>
  )
}
