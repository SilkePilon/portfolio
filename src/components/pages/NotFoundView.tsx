'use client'
import { usePages } from '@/components/layout/ContentProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { Container, Section } from '@/components/ui/Section'
import { Appear } from '@/components/anim/Appear'

export function NotFoundView() {
  const { notFound } = usePages()
  return (
    <Section as="header" className="pt-[100px] tablet:pt-[150px]">
      <Container>
        <Appear preset="left" trigger="mount" className="col-span-2 flex flex-col gap-[30px] px-5">
          <h1 className="text-display">{notFound.heading}</h1>
          <p className="max-w-[450px] text-body-lg text-gray-500">{notFound.text}</p>
        </Appear>
        <Appear preset="fade" trigger="mount" delay={0.3} className="relative col-span-2 mt-[60px] border-y border-rule desktop:col-span-1 desktop:col-start-4">
          <Corners />
          <ArrowButton to="/" bar>
            {notFound.cta}
          </ArrowButton>
        </Appear>
      </Container>
    </Section>
  )
}
