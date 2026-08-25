import type { Metadata } from 'next'
import { BlogsIndex } from '@/components/blogs/BlogsIndex'
import { getPosts } from '@/lib/cms'
import { pages } from '@/content/home'

export const metadata: Metadata = { title: 'Blogs', description: pages.blogs.text }

export default async function BlogsPage() {
  return <BlogsIndex posts={await getPosts()} />
}
