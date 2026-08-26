'use client'
import { Appear } from '@/components/anim/Appear'
import { usePages, usePosts } from '@/components/layout/ContentProvider'
import { RichSpan } from '@/components/ui/RichText'
import { Container, Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { BlogCard } from './BlogCard'

export function BlogsIndex() {
  const pages = usePages()
  const posts = usePosts()
  return (
    <Section as="header" className="pt-[100px] tablet:pt-[150px]">
      <Container className="gap-y-[70px]">
        <Appear preset="left" trigger="mount" className="col-span-2 flex flex-col gap-[30px] px-5 desktop:col-span-3">
          <SectionTag>{pages.blogs.tag}</SectionTag>
          <h1 className="text-h2">
            <RichSpan parts={pages.blogs.heading} />
          </h1>
        </Appear>
        <Appear preset="right" trigger="mount" delay={0.2} className="col-span-2 flex items-end px-5 desktop:col-span-1">
          <p className="text-mono text-gray-500 tablet:text-right">{pages.blogs.text}</p>
        </Appear>
        <div className="col-span-2 grid grid-cols-1 tablet:grid-cols-2 desktop:col-span-4 desktop:grid-cols-4">
          {posts.map((p, i) => (
            <Appear key={p.slug} preset="up" delay={0.1 * (i % 4)} className="flex">
              <BlogCard blog={p} className="w-full" />
            </Appear>
          ))}
        </div>
      </Container>
    </Section>
  )
}
