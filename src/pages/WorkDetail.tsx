import { useParams } from 'react-router-dom'
import { getWork } from '@/content/works'
import { Seo } from '@/components/layout/Seo'
import { Container, Section } from '@/components/ui/Section'
import NotFound from './NotFound'

export default function WorkDetail() {
  const { slug = '' } = useParams()
  const work = getWork(slug)
  if (!work) return <NotFound />
  return (
    <>
      <Seo title={work.title} description={work.description} />
      <Section className="min-h-screen">
        <Container>
          <h1 className="col-span-2 px-5 text-h2">{work.title}</h1>
        </Container>
      </Section>
    </>
  )
}
