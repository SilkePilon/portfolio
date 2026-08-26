import type { Rich } from '@/content/types'

/**
 * Plain-text form of the mixed-colour headings used everywhere in the template:
 * text is grey by default, `**like this**` renders white, a newline is a line break.
 * Unbalanced `**` is kept literally. Adjacent parts of the same colour are merged.
 */
export function parseMarked(s: string): Rich {
  const out: Rich = []
  const push = (text: string, muted: boolean) => {
    if (!text) return
    const last = out[out.length - 1]
    if (last && !last.br && !!last.muted === muted) last.text = (last.text ?? '') + text
    else out.push(muted ? { text, muted: true } : { text })
  }
  for (const [li, line] of s.split(/\r?\n/).entries()) {
    if (li > 0) out.push({ br: true })
    const parts = line.split('**')
    if (parts.length % 2 === 0) { push(line, true); continue } // unbalanced → literal
    parts.forEach((p, i) => push(p, i % 2 === 0))
  }
  return out
}

/** Inverse of parseMarked (seed + tests). */
export function toMarked(r: Rich): string {
  return r.map((p) => (p.br ? '\n' : p.muted ? p.text ?? '' : p.text ? `**${p.text}**` : '')).join('')
}
