import type { BlogBlock } from '@/content/types'

type LexNode = { type: string; text?: string; tag?: string; listType?: string; children?: LexNode[] }
export type LexicalDoc = { root: { type: 'root'; children: LexNode[]; direction: 'ltr' | null; format: string; indent: number; version: number } }

const textOf = (n: LexNode): string =>
  n.type === 'text' ? (n.text ?? '') : n.type === 'linebreak' ? '\n' : (n.children ?? []).map(textOf).join('')

/** Payload (Lexical) rich text → the ordered heading / paragraph / list blocks the blog renderer uses. */
export function lexicalToBlocks(doc: unknown): BlogBlock[] {
  const root = (doc as LexicalDoc | null | undefined)?.root
  if (!root) return []
  const out: BlogBlock[] = []
  for (const n of root.children ?? []) {
    if (n.type === 'heading') {
      const t = textOf(n).trim()
      if (t) out.push({ kind: 'heading', text: t })
    } else if (n.type === 'list') {
      const items = (n.children ?? []).map(textOf).map((s) => s.trim()).filter(Boolean)
      if (items.length) out.push({ kind: 'list', items })
    } else if (n.type === 'paragraph' || n.type === 'quote') {
      const t = textOf(n).trim()
      if (t) out.push({ kind: 'paragraph', text: t })
    }
  }
  return out
}

const textNode = (s: string) => ({ type: 'text', text: s, detail: 0, format: 0, mode: 'normal', style: '', version: 1 })
const inline = (s: string) => s.split('\n').flatMap((part, i) => (i === 0 ? [textNode(part)] : [{ type: 'linebreak', version: 1 }, textNode(part)]))
const block = (extra: Record<string, unknown>) => ({ direction: 'ltr', format: '', indent: 0, version: 1, ...extra })

/** Blocks → Lexical document (used by the seed script). */
export function blocksToLexical(blocks: BlogBlock[]): LexicalDoc {
  const children = blocks.map((b) =>
    b.kind === 'heading'
      ? block({ type: 'heading', tag: 'h3', children: inline(b.text) })
      : b.kind === 'list'
        ? block({ type: 'list', listType: 'bullet', tag: 'ul', start: 1, children: b.items.map((it, i) => block({ type: 'listitem', value: i + 1, children: inline(it) })) })
        : block({ type: 'paragraph', textFormat: 0, children: inline(b.text) }),
  ) as unknown as LexNode[]
  return { root: { type: 'root', children, direction: 'ltr', format: '', indent: 0, version: 1 } }
}
