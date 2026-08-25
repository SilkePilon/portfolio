import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { site } from '@/content/site'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { FitText } from '@/components/ui/FitText'
import { Logo } from '@/components/ui/Logo'
import { RichSpan } from '@/components/ui/RichText'
import { GridLines } from '@/components/ui/Section'
import { SlideText } from '@/components/ui/SlideText'

/** Four-column footer with sitemap, socials and the giant wordmark; parallaxes up (−170px → 0) as it enters. */
export function Footer() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const y = useTransform(scrollYProgress, [0, 1], [-170, 0])

  return (
    <motion.footer ref={ref} style={reduce ? undefined : { y }} className="theme-dark relative w-full overflow-hidden bg-gray-900 px-2.5 text-white tablet:px-5">
      <GridLines />
      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-2 border-y border-rule desktop:grid-cols-4">
        <div className="flex flex-col justify-between">
          <div className="flex flex-col gap-5 px-5 py-[30px]">
            <Logo />
            <p className="max-w-[240px] text-mono">
              <RichSpan parts={site.footer.tagline} mutedClass="text-white/60" />
            </p>
          </div>
          <div className="border-t border-rule">
            <ArrowButton href={site.bookCall.href}>{site.bookCall.label}</ArrowButton>
          </div>
        </div>
        <nav className="flex flex-col border-l border-rule" aria-label="Sitemap">
          {site.nav.map((l, i) => (
            <div key={l.to} className={i > 0 ? 'border-t border-rule' : undefined}>
              <ArrowButton to={l.to}>{l.label}</ArrowButton>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-5 border-t border-rule px-5 py-[30px] desktop:border-l desktop:border-t-0">
          <span className="text-mono text-gray-500">{site.footer.socialsTitle}</span>
          <ul className="flex flex-col gap-3.5">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="group inline-block text-nav">
                  <SlideText text={s.label} idle="text-white" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-5 border-l border-t border-rule px-5 py-[30px] desktop:border-t-0">
          <p className="max-w-[240px] text-mono">{site.footer.socialsText}</p>
          <a href={site.footer.createdBy.href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2.5 text-mono">
            <span className="text-gray-500">{site.footer.createdBy.label}</span>
            <img
              src={site.footer.createdBy.avatar.src}
              alt={site.footer.createdBy.avatar.alt}
              width={24}
              height={24}
              loading="lazy"
              className="size-6 rounded-full object-cover"
            />
            <SlideText text={site.footer.createdBy.name} idle="text-white" />
          </a>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-[1600px] overflow-hidden pt-5">
        <FitText text={site.name} lineHeight={0.74} className="font-display font-bold uppercase tracking-[-0.05em] text-white" />
      </div>
    </motion.footer>
  )
}
