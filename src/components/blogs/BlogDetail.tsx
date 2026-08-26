'use client'
import type { Blog } from '@/content/types'
import { Appear } from '@/components/anim/Appear'
import { usePages } from '@/components/layout/ContentProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { BlogBody } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { BlogCard } from './BlogCard'

export function BlogDetail({ post, next }: { post: Blog; next: Blog[] }) {
  const pages = usePages()
  const [intro, ...rest] = post.body[0]?.kind === 'paragraph' ? [post.body[0], ...post.body.slice(1)] : [undefined, ...post.body]
  return (
    <>
      <Section as="header" className="pt-[100px] tablet:pt-[150px]">
        <Container className="gap-y-[60px]">
          <Appear preset="left" trigger="mount" className="col-span-2 flex flex-col gap-[30px] px-5 desktop:col-span-3">
            <SectionTag>{post.category}</SectionTag>
            <h1 className="max-w-[700px] text-h2">{post.title}</h1>
          </Appear>
          <Appear preset="right" trigger="mount" delay={0.2} className="col-span-2 flex items-end px-5 desktop:col-span-1">
            <p className="text-mono text-gray-500 tablet:text-right">{post.date}</p>
          </Appear>
          <Appear preset="fade" trigger="mount" delay={0.3} className="relative col-span-2 self-start border-y border-rule p-2.5 tablet:p-5 desktop:col-span-1 desktop:sticky desktop:top-5">
            <Corners />
            <img src={post.cover.src} alt={post.cover.alt} width={post.cover.width} height={post.cover.height} className="aspect-[3/4] w-full object-cover" />
          </Appear>
          <Appear preset="up" trigger="mount" delay={0.4} className="col-span-2 flex flex-col gap-[30px] px-5 desktop:col-start-3">
            {intro && 'text' in intro && <p className="text-body-lg">{intro.text}</p>}
            <BlogBody body={rest} />
          </Appear>
        </Container>
      </Section>

      <Section>
        <Container className="gap-y-[30px]">
          <Appear preset="left" className="col-span-2 px-5 desktop:col-span-1">
            <SectionTag>{pages.blogLabels.next}</SectionTag>
          </Appear>
          <div className="col-span-2 flex flex-col gap-5 desktop:col-start-3">
            <div className="grid grid-cols-1 tablet:grid-cols-2">
              {next.map((b, i) => (
                <Appear key={b.slug} preset="up" delay={0.1 * i} className="flex">
                  <BlogCard blog={b} className="w-full" />
                </Appear>
              ))}
            </div>
            <Appear preset="fade" className="relative border-y border-rule">
              <Corners variant="2-bottom" />
              <ArrowButton to="/blogs" bar>
                {pages.blogLabels.cta}
              </ArrowButton>
            </Appear>
          </div>
        </Container>
      </Section>
    </>
  )
}
