import type { Metadata } from 'next'
import { WorksIndex } from '@/components/works/WorksIndex'
import { getWorks } from '@/lib/cms'
import { pages } from '@/content/home'

export const metadata: Metadata = { title: 'Works', description: pages.works.text }

export default async function WorksPage() {
  return <WorksIndex works={await getWorks()} />
}
