'use client'
import { useState } from 'react'
import { motion } from 'motion/react'
import { Appear } from '@/components/anim/Appear'
import { useSite } from '@/components/layout/SiteProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Profile } from '@/components/ui/Profile'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { home } from '@/content/home'

const { tag, heading, text, sentence, cta, list } = home.clients

/**
 * "Brands I've worked with": eyebrow + h2 + intro on the right, then a 4-col row of sentence/
 * profile/book-a-call, a desktop-only hover-image slot, and the 8-row client list. Hovering a
 * row fades/scales that client's image into the slot (desktop only — the list is touch-only
 * below `desktop:`).
 */
export function Clients() {
  const site = useSite()
  const [hovered, setHovered] = useState<number | null>(null)
  const active = hovered !== null ? list[hovered] : null

  return (
    <Section id="clients">
      <Container grid={false} className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <div className="flex w-full flex-col items-start gap-3.5 px-2.5 tablet:gap-5 tablet:px-5 desktop:flex-row desktop:items-end desktop:gap-0">
          <div className="flex w-full flex-col items-start gap-5 tablet:gap-[30px] desktop:flex-1">
            <Appear preset="left">
              <SectionTag>{tag}</SectionTag>
            </Appear>
            <Appear preset="left" className="w-full">
              <h2 className="text-h2">
                <RichSpan parts={heading} />
              </h2>
            </Appear>
          </div>
          <Appear as="p" preset="right" className="w-full max-w-[320px] text-mono desktop:text-right">
            <RichSpan parts={text} />
          </Appear>
        </div>

        <div className="grid w-full grid-cols-1 desktop:grid-cols-4">
          <Appear preset="up" className="flex flex-col gap-[30px]">
            <div className="flex flex-col gap-[30px] px-2.5 tablet:px-5">
              <h4 className="max-w-[300px] text-lead">
                <RichSpan parts={sentence} />
              </h4>
              <Profile name={site.profile.name} role={site.profile.role} avatar={site.profile.avatar} />
            </div>
            <div className="border border-rule">
              <ArrowButton href={site.bookCall.href}>{cta}</ArrowButton>
            </div>
          </Appear>

          <div className="relative hidden desktop:block">
            {active && (
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute left-5 right-5 top-0 aspect-[3/4] overflow-hidden"
              >
                <img src={active.image.src} alt={active.image.alt} className="size-full object-cover" />
              </motion.div>
            )}
          </div>

          <Appear preset="up" delay={0.1} className="desktop:col-span-2">
            <ul className="flex flex-col px-2.5 tablet:px-5">
              {list.map((client, i) => (
                <li key={client.name}>
                  <a
                    href={client.href ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    className="group flex items-baseline justify-between gap-5 py-2.5"
                  >
                    <span className="text-h4-regular text-gray-500 transition-colors duration-300 group-hover:text-white">{client.name}</span>
                    <span className="text-mono text-gray-500 transition-colors duration-300 group-hover:text-white">{client.year}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Appear>
        </div>
      </Container>
    </Section>
  )
}
