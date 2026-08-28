/**
 * The Route Handler the dashboard's Deploy button posts to, shown verbatim on the `01 backend` layer,
 * plus the tiny tokenizer that colours it. One accent (#7dd3a0) for strings; everything else is grey/white.
 */
export const deployRoutePath = 'src/app/api/deploy/route.ts'

export const deployRouteCode = `import { after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { run } from '@/lib/pipeline'

const STAGES = ['build', 'image', 'push', 'rollout'] as const

export async function POST(req: Request) {
  const { project, ref } = await req.json()
  const payload = await getPayload({ config })
  const deploy = await payload.create({
    collection: 'deploys',
    data: { project, ref, status: 'running' },
  })

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: object) =>
        controller.enqueue(\`data: \${JSON.stringify(e)}\\n\\n\`)

      for (const [i, stage] of STAGES.entries()) {
        send({ stage, progress: i / STAGES.length })
        await run(stage, { project, ref })
      }

      send({ stage: 'ready', progress: 1 })
      controller.close()
    },
  })

  after(() => payload.update({ id: deploy.id, data: DONE }))

  return new Response(stream, {
    headers: { 'content-type': 'text/event-stream' },
  })
}`

/** A sample of what the handler writes to the stream — shown next to the code on the `01 backend` sheet. */
export const eventStream = [
  'data: {"stage":"build","progress":0}',
  'data: {"stage":"image","progress":0.25}',
  'data: {"stage":"push","progress":0.5}',
  'data: {"stage":"rollout","progress":0.75}',
  'data: {"stage":"ready","progress":1}',
]

export type CodeToken = { text: string; color: string }

const KEYWORDS = new Set([
  'import', 'from', 'const', 'export', 'async', 'function', 'await', 'return', 'for', 'of', 'new', 'as', 'let', 'class',
])
const TYPES = new Set(['Request', 'Response', 'ReadableStream', 'JSON', 'STAGES', 'DONE', 'object'])

const C = {
  kw: '#ffffff',
  str: '#7dd3a0',
  type: '#d6d6d6',
  ident: '#a8a8a8',
  punct: '#6b6b6b',
  num: '#c4c4c4',
  comment: '#5a5a5a',
}

/** Split one source line into coloured tokens. Deliberately naive — enough for a static snippet. */
export function tokenizeLine(line: string): CodeToken[] {
  const re = /(\/\/.*$)|('[^']*'|`[^`]*`|"[^"]*")|(\b\d+\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g
  const out: CodeToken[] = []
  for (const m of line.matchAll(re)) {
    const text = m[0]
    const color = m[1]
      ? C.comment
      : m[2]
        ? C.str
        : m[3]
          ? C.num
          : m[4]
            ? KEYWORDS.has(text)
              ? C.kw
              : TYPES.has(text)
                ? C.type
                : C.ident
            : m[5]
              ? C.ident
              : C.punct
    const prev = out[out.length - 1]
    if (prev && prev.color === color) prev.text += text
    else out.push({ text, color })
  }
  return out
}

export const deployRouteLines = deployRouteCode.split('\n').map(tokenizeLine)
