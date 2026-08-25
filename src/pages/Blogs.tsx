import { Seo } from '@/components/layout/Seo'
import { Container, Section } from '@/components/ui/Section'

export default function Blogs() {
  return (
    <>
      <Seo title="Blogs" />
      <Section className="min-h-screen">
        <Container>
          <h1 className="col-span-2 px-5 text-h2">Blogs</h1>
        </Container>
      </Section>
    </>
  )
}
