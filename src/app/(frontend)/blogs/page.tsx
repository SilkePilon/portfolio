import type { Metadata } from 'next'
import { BlogsIndex } from '@/components/blogs/BlogsIndex'
import { getPages } from '@/lib/cms'

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPages()
  return { title: 'Blogs', description: p.blogs.text }
}

export default function BlogsPage() {
  return <BlogsIndex />
}
