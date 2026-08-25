import { Appear } from '@/components/anim/Appear'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { WorkCard } from '@/components/works/WorkCard'
import { home } from '@/content/home'
import { getWork } from '@/content/works'
import { cn } from '@/lib/cn'

/**
 * The template's four card rows. Every card keeps its own aspect ratio (580×480 wide, 290×350
 * narrow) at all widths; the columns change: 4 on desktop with hand-placed starts, alternating
 * sides on tablet, a single stack on phone.
 */
const rows: { slug: string; cell: string }[][] = [
  [{ slug: 'sienna', cell: 'aspect-[580/480] tablet:col-start-1 tablet:col-end-2 desktop:col-start-2 desktop:col-end-4' }],
  [
    { slug: 'glidex', cell: 'aspect-[290/350] tablet:col-start-2 tablet:col-end-3 desktop:col-start-1 desktop:col-end-2' },
    { slug: 'veon', cell: 'aspect-[580/480] tablet:col-start-1 tablet:col-end-2 desktop:col-start-3 desktop:col-end-5' },
  ],
  [{ slug: 'zayla', cell: 'aspect-[580/480] tablet:col-start-2 tablet:col-end-3 desktop:col-start-1 desktop:col-end-3' }],
  [{ slug: 'destello', cell: 'aspect-[580/480] tablet:col-start-1 tablet:col-end-2 desktop:col-start-2 desktop:col-end-4' }],
]

/** "Selected works" — five project cards on the page grid, closing with the explore-all-works cell. */
export function WorksGrid() {
  const { tag, heading, text, outro, cta } = home.works

  return (
    <Section id="works">
      <Container grid={false} className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <div className="flex w-full flex-col items-start gap-3.5 px-2.5 tablet:gap-5 tablet:px-5 desktop:flex-row desktop:items-end desktop:gap-0">
          <div className="flex w-full flex-col items-start gap-5 tablet:gap-[30px] desktop:flex-1">
            <Appear preset="left">
              <SectionTag>{tag}</SectionTag>
            </Appear>
            <Appear preset="left" className="w-full">
              <h2 className="max-w-[800px] text-h2">
                <RichSpan parts={heading} />
              </h2>
            </Appear>
          </div>
          <Appear as="p" preset="right" className="w-full max-w-[300px] text-mono desktop:text-right">
            <RichSpan parts={text} />
          </Appear>
        </div>

        {rows.map((row, i) => (
          <div key={i} className="grid w-full grid-cols-1 gap-y-[30px] tablet:grid-cols-2 tablet:gap-y-[50px] desktop:grid-cols-4">
            {row.map(({ slug, cell }) => {
              const work = getWork(slug)
              return work ? (
                <Appear key={slug} preset="up" className={cn('w-full self-start', cell)}>
                  <WorkCard work={work} />
                </Appear>
              ) : null
            })}
          </div>
        ))}

        <div className="grid w-full grid-cols-1 gap-y-5 tablet:grid-cols-2 tablet:gap-y-[30px] desktop:grid-cols-4 desktop:gap-y-0">
          <Appear preset="left" className="col-start-1 col-end-2 self-start px-2.5 tablet:col-end-3 tablet:px-5">
            <h4 className="max-w-[400px] text-lead">
              <RichSpan parts={outro} />
            </h4>
          </Appear>
          <Appear
            preset="fade"
            className="col-start-1 col-end-2 self-end border-y border-rule tablet:col-start-2 tablet:col-end-3 desktop:col-start-4 desktop:col-end-5"
          >
            <ArrowButton bar to="/works">
              {cta}
            </ArrowButton>
          </Appear>
        </div>
      </Container>
    </Section>
  )
}
