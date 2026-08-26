'use client'
import { Appear } from '@/components/anim/Appear'
import { Counter } from '@/components/anim/Counter'
import { useHome } from '@/components/layout/ContentProvider'
import { Dots } from '@/components/ui/Dots'
import { Container, Section } from '@/components/ui/Section'
import { cn } from '@/lib/cn'

/**
 * The original packs the 4 cards into a 4-column grid with 1px spacers between them, which bins
 * Projects/Years Experience into row 1 (columns 1 & 3) and Client Satisfaction/Avg Rating into
 * row 2 (columns 2 & 4) — a checkerboard stagger. Tablet (2 cols) and phone (1 col) stay in
 * plain source order, so this only needs to kick in at desktop width.
 */
const desktopPlacement = [
  'desktop:col-start-1 desktop:row-start-1',
  'desktop:col-start-3 desktop:row-start-1',
  'desktop:col-start-2 desktop:row-start-2',
  'desktop:col-start-4 desktop:row-start-2',
]

/** Four counters (projects, years, satisfaction, rating) — "Container - metrices" inside Section - About. */
export function Metrics() {
  const { metrics } = useHome()
  return (
    <Section id="metrics">
      <Container grid={false}>
        <div className="grid w-full grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-4">
          {metrics.map((metric, i) => (
            <Appear
              key={metric.label}
              preset="fade"
              className={cn('flex flex-col gap-5 border-b border-rule p-[14px_10px] tablet:gap-[30px] tablet:p-5', desktopPlacement[i])}
            >
              <Dots active={metric.dots} />
              <Counter end={metric.end} suffix={metric.suffix} className="text-display" />
              <div className="flex flex-col gap-2.5">
                <h4 className="text-mono-bold">{metric.label}</h4>
                <p className="max-w-[220px] text-mono text-gray-500">{metric.text}</p>
              </div>
            </Appear>
          ))}
        </div>
      </Container>
    </Section>
  )
}
