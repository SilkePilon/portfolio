/** Real-looking snippets shared by the code-flavoured options. */
export const tsxSnippet = `export async function Page({ params }: PageProps) {
  const { slug } = await params
  const work = await getWork(slug)
  if (!work) notFound()

  return (
    <Shell>
      <CaseStudy work={work} />
      <NextWork slug={work.next} />
    </Shell>
  )
}`

export const hookSnippet = `export function useScrub(ref: RefObject<HTMLElement>) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: ref.current,
      scrub: true,
      onUpdate: (s) => setP(s.progress),
    })
    return () => st.kill()
  }, [ref])
  return p
}`

export const deployLog = [
  '$ git push origin main',
  'Enumerating objects: 27, done.',
  'Writing objects: 100% (16/16), 4.2 KiB | 4.2 MiB/s, done.',
  'remote: Resolving deltas: 100% (9/9), completed with 9 local objects.',
  '',
  '$ npm run build',
  '▲ Next.js 16.3.3',
  '  Creating an optimized production build ...',
  '✓ Compiled successfully in 8.4s',
  '✓ Collecting page data',
  '✓ Generating static pages (12/12)',
  '',
  '$ docker build -t ghcr.io/silkepilon/portfolio:1.4.0 .',
  '[+] Building 41.2s (18/18) FINISHED',
  ' => exporting to image                                  0.8s',
  '',
  '$ docker compose up -d',
  '✓ Container portfolio  Started',
  '',
  '→ https://silkepilon.dev  (200 OK · 38 ms)',
]
