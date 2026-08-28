import type { Metadata } from 'next'
import { ShowcaseLab } from '@/components/lab/showcase/ShowcaseLab'

export const metadata: Metadata = { title: 'Showcase lab', robots: { index: false } }

export default function ShowcaseLabPage() {
  return <ShowcaseLab />
}
