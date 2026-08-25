import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BlogDetail } from '@/components/blogs/BlogDetail'
import { getNextPosts, getPost } from '@/lib/cms'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug)
  const first = post?.body.find((b) => b.kind === 'paragraph')
  return post ? { title: post.title, description: first && 'text' in first ? first.text.slice(0, 160) : undefined, openGraph: { images: [post.cover.src] } } : { title: '404' }
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return <BlogDetail post={post} next={await getNextPosts(slug)} />
}
