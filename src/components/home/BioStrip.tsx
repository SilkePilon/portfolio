'use client'
import { Appear } from '@/components/anim/Appear'
import { useHome } from '@/components/layout/ContentProvider'
import { Corners } from '@/components/ui/Corners'
import { Container, Section } from '@/components/ui/Section'

/** Every cell draws its own top rule; only the last row's cells close the strip with a bottom rule too. */
const bottomRule = ['desktop:border-b', 'desktop:border-b', 'tablet:border-b', 'border-b']

/** Single-row strip of quick facts (location, field, approach, clients) between the hero and the about copy. */
export function BioStrip() {
  const { bio } = useHome()
  return (
    <Section id="bio">
      <Container className="relative">
        <Corners />
        <Appear preset="fade" className="contents">
          {bio.map((item, i) => (
            <div key={item.label} className={`flex flex-col gap-[5px] border-t border-rule p-[14px_10px] tablet:gap-2.5 tablet:p-5 ${bottomRule[i]}`}>
              <p className="text-mono text-gray-500">{item.label}</p>
              <p className="text-mono-bold">{item.value}</p>
            </div>
          ))}
        </Appear>
      </Container>
    </Section>
  )
}
