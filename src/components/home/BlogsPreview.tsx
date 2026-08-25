'use client'
import type { Blog } from '@/content/types'
import { Container, Section } from '@/components/ui/Section'

/** TODO(task): replace this stub with the real section (see the plan). `posts` comes from the CMS. */
export function BlogsPreview({ posts = [] }: { posts?: Blog[] }) {
  return (
    <Section id="blogs">
      <Container>
        <p className="col-span-2 px-5 text-mono text-gray-500">BlogsPreview (stub) — {posts.length} posts</p>
      </Container>
    </Section>
  )
}
