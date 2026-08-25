'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Appear } from '@/components/anim/Appear'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { PlusIcon } from '@/components/ui/Icons'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { home } from '@/content/home'
import { cn } from '@/lib/cn'

const easeOut = [0.22, 1, 0.36, 1] as const

/** One accordion row: question button + a height-animated answer panel. */
function FaqRow({ q, a, isOpen, isFirst, onToggle }: { q: string; a: string; isOpen: boolean; isFirst: boolean; onToggle: () => void }) {
  return (
    <div className={cn('border-b border-rule', isFirst && 'border-t')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-5 px-5 py-[22px] text-left"
      >
        <span className={cn('text-body', isOpen && 'text-gray-500')}>{q}</span>
        <PlusIcon className={cn('size-3 shrink-0 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]', isOpen && 'rotate-45')} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.4, ease: easeOut }}
        className="overflow-hidden"
      >
        <p className="max-w-[600px] px-5 pb-6 text-mono text-gray-500">{a}</p>
      </motion.div>
    </div>
  )
}

/** FAQ accordion (one item open at a time) followed by a "didn't find your answer?" CTA row. */
export function Faq() {
  const { tag, heading, items, outroHeading, outroText, outroCta } = home.faq
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section id="faq">
      <Container className="gap-y-[30px] tablet:gap-y-[50px] desktop:gap-y-[70px]">
        <Appear preset="up" className="col-span-2 flex flex-col items-center gap-5 px-2.5 text-center tablet:gap-[30px] tablet:px-5 desktop:col-span-4">
          <div className="flex justify-center">
            <SectionTag>{tag}</SectionTag>
          </div>
          <h2 className="max-w-[550px] text-h2 desktop:max-w-[700px]">
            <RichSpan parts={heading} />
          </h2>
        </Appear>

        <Appear preset="fade" className="relative col-span-2 w-full desktop:col-span-2 desktop:col-start-2">
          <Corners />
          {items.map((item, i) => (
            <FaqRow key={item.q} q={item.q} a={item.a} isFirst={i === 0} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)} />
          ))}
        </Appear>

        <Appear
          preset="fade"
          className="col-span-2 grid w-full grid-cols-1 gap-x-0 gap-y-5 tablet:grid-cols-2 tablet:gap-y-[30px] desktop:col-span-4 desktop:grid-cols-4 desktop:gap-y-0"
        >
          <h4 className="max-w-[400px] px-2.5 text-h4 tablet:col-start-1 tablet:row-start-1 tablet:px-5 desktop:col-start-1 desktop:row-start-1">
            <RichSpan parts={outroHeading} />
          </h4>
          <p className="max-w-[240px] px-2.5 text-left text-mono text-gray-500 tablet:col-start-2 tablet:row-start-2 tablet:px-5 tablet:text-right desktop:col-start-4 desktop:row-start-1 desktop:text-right">
            {outroText}
          </p>
          <div className="border-y border-rule tablet:col-start-1 tablet:row-start-2 desktop:col-start-3 desktop:row-start-1">
            <ArrowButton bar href="#contact">
              {outroCta}
            </ArrowButton>
          </div>
        </Appear>
      </Container>
    </Section>
  )
}
