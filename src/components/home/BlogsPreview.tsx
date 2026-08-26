'use client'
import { Appear } from '@/components/anim/Appear'
import { BlogCard } from '@/components/blogs/BlogCard'
import { useHome, useHomePosts, useSite } from '@/components/layout/ContentProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Profile } from '@/components/ui/Profile'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'

/**
 * "Stories behind the work" — heading + read-more cta, then a profile card and three BlogCards
 * placed like the template: card1 top-right, card2/card3 staggered onto the next row.
 * The three featured posts come from the CMS through `useHomePosts()`.
 */
export function BlogsPreview() {
  const { tag, heading, cta, profileText } = useHome().blogsPreview
  const site = useSite()
  const items = useHomePosts()

  return (
    <Section id="blogs">
      <Container grid={false} className="flex flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <div className="grid w-full grid-cols-1 gap-y-5 tablet:grid-cols-2 tablet:gap-y-[30px] desktop:grid-cols-4 desktop:gap-y-0">
          <div className="flex flex-col gap-5 px-2.5 tablet:gap-[30px] tablet:px-5 desktop:col-span-3">
            <Appear preset="left">
              <SectionTag>{tag}</SectionTag>
            </Appear>
            <Appear preset="left" className="w-full">
              <h2 className="max-w-[500px] text-h2">
                <RichSpan parts={heading} />
              </h2>
            </Appear>
          </div>
          <Appear preset="fade" className="self-end border-y border-rule">
            <ArrowButton bar to="/blogs">
              {cta}
            </ArrowButton>
          </Appear>
        </div>

        <div className="grid w-full grid-cols-1 gap-y-5 tablet:grid-cols-2 tablet:gap-y-[30px] desktop:grid-cols-4 desktop:gap-y-0">
          <Appear
            preset="up"
            className="flex min-h-[300px] flex-col justify-between gap-10 bg-gray-900 p-5 tablet:col-start-1 tablet:row-start-1 desktop:col-start-1 desktop:row-start-1"
          >
            <Profile name={site.profile.name} role={site.profile.role} avatar={site.profile.avatar} />
            <p className="max-w-[220px] text-mono">
              <RichSpan parts={profileText} />
            </p>
          </Appear>

          <Appear preset="up" className="tablet:col-start-2 tablet:row-start-2 desktop:col-start-3 desktop:row-start-1">
            <BlogCard blog={items[0]} />
          </Appear>

          <Appear preset="up" className="tablet:col-start-1 tablet:row-start-3 desktop:col-start-2 desktop:row-start-2">
            <BlogCard blog={items[1]} />
          </Appear>

          <Appear preset="up" className="tablet:col-start-2 tablet:row-start-4 desktop:col-start-4 desktop:row-start-2">
            <BlogCard blog={items[2]} />
          </Appear>
        </div>
      </Container>
    </Section>
  )
}
