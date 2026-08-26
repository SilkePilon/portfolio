import type { Metadata } from 'next'
import { WorksIndex } from '@/components/works/WorksIndex'
import { getPages } from '@/lib/cms'

export async function generateMetadata(): Promise<Metadata> {
  const p = await getPages()
  return { title: 'Works', description: p.works.text }
}

export default function WorksPage() {
  return <WorksIndex />
}
