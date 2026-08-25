import { useParams } from 'react-router-dom'
import { getBlog } from '@/content/blogs'
import { Seo } from '@/components/layout/Seo'
import { Container, Section } from '@/components/ui/Section'
import NotFound from './NotFound'

export default function BlogDetail() {
  const { slug = '' } = useParams()
  const blog = getBlog(slug)
  if (!blog) return <NotFound />
  return (
    <>
      <Seo title={blog.title} />
      <Section className="min-h-screen">
        <Container>
          <h1 className="col-span-2 px-5 text-h2">{blog.title}</h1>
        </Container>
      </Section>
    </>
  )
}
