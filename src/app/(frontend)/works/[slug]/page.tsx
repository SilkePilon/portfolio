import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WorkDetail } from '@/components/works/WorkDetail'
import { getNextWork, getWork } from '@/lib/cms'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = await getWork((await params).slug)
  return work ? { title: work.title, description: work.description, openGraph: { images: [work.cover.src] } } : { title: '404' }
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()
  return <WorkDetail work={work} next={await getNextWork(slug)} />
}
