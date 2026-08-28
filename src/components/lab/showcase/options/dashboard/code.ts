/**
 * The backend the trading dashboard talks to, shown verbatim on the `01 backend` layer: a Route Handler that
 * streams quote ticks over SSE, plus the order endpoint the ticket posts to. Also the tiny tokenizer that
 * colours them — one accent (#7dd3a0) for strings, everything else grey/white.
 */
export const quotesRoutePath = 'src/app/api/quotes/route.ts'

export const quotesRouteCode = `import type { NextRequest } from 'next/server'
import { subscribe } from '@/lib/market'

export const dynamic = 'force-dynamic'

const HEARTBEAT = 15_000

export async function GET(req: NextRequest) {
  const symbols =
    req.nextUrl.searchParams.get('symbols')?.split(',') ?? []
  const encode = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const write = (chunk: string) =>
        controller.enqueue(encode.encode(chunk))

      const off = subscribe(symbols, (tick) =>
        write(\`data: \${JSON.stringify(tick)}\\n\\n\`),
      )

      // Keeps proxies from closing an idle stream.
      const beat = setInterval(() => write(': ping\\n\\n'), HEARTBEAT)

      req.signal.addEventListener('abort', () => {
        clearInterval(beat)
        off()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-store, no-transform',
    },
  })
}`

export const ordersRoutePath = 'src/app/api/orders/route.ts'

export const ordersRouteCode = `export async function POST(req: Request) {
  const { symbol, side, qty } = await req.json()
  const { price } = await quote(symbol)

  const order = await db.orders.insert({
    symbol, side, qty, price, status: 'open',
  })

  after(() => fill(order.id))
  return Response.json(order, { status: 201 })
}`

/** A sample of what the quotes handler writes to the stream — shown next to the code on the `01 backend` sheet. */
export const eventStream = [
  'data: {"s":"NVDA","p":1203.4,"t":1756368000}',
  'data: {"s":"AAPL","p":189.58,"t":1756368001}',
  'data: {"s":"BTC","p":68437.1,"t":1756368001}',
  ': ping',
  'data: {"s":"TSLA","p":244.62,"t":1756368002}',
]

export type CodeToken = { text: string; color: string }

const KEYWORDS = new Set([
  'import', 'from', 'const', 'export', 'async', 'function', 'await', 'return', 'for', 'of', 'new', 'as', 'let', 'type', 'class',
])
const TYPES = new Set(['Request', 'NextRequest', 'Response', 'ReadableStream', 'TextEncoder', 'JSON', 'HEARTBEAT'])

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
  const re = /(\/\/.*$)|('[^']*'|`[^`]*`|"[^"]*")|(\b[\d_]+\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g
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

export const quotesRouteLines = quotesRouteCode.split('\n').map(tokenizeLine)
export const ordersRouteLines = ordersRouteCode.split('\n').map(tokenizeLine)
