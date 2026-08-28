'use client'
/**
 * Option 1 — "Editor". A small, dim editor window grows to full width (p 0→0.45), then `tsxSnippet` types itself
 * character by character behind a blinking block cursor (p 0.15→0.9). At the end (p 0.9→1) the display words
 * SHIP / CODE slide in from the left/right around the editor, which settles to 85% opacity.
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { LabOption, seg, easeOut, easeInOut } from '../LabOption'
import { tsxSnippet } from './code'

type Kind = 'kw' | 'tag' | 'punct' | 'str' | 'id' | 'ws'
type Token = { text: string; kind: Kind; start: number }

const KEYWORDS = new Set(['export', 'async', 'function', 'const', 'await', 'if', 'return', 'import', 'from'])
const COLOR: Record<Kind, string> = {
  kw: '#ffffff',
  tag: '#7dd3a0',
  punct: '#7a7a7a',
  str: '#7dd3a0',
  id: '#c4c4c4',
  ws: '#c4c4c4',
}

/** Tiny tokenizer: keywords, JSX tag names, strings, identifiers, punctuation. Offsets index into the full snippet. */
function tokenize(src: string): { start: number; tokens: Token[] }[] {
  const re = /(<\/?[A-Za-z][\w.]*|\/?>)|("[^"]*"|'[^']*'|`[^`]*`)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g
  const lines: { start: number; tokens: Token[] }[] = []
  let offset = 0
  for (const line of src.split('\n')) {
    const tokens: Token[] = []
    for (const m of line.matchAll(re)) {
      const text = m[0]
      const kind: Kind = m[1] ? 'tag' : m[2] ? 'str' : m[3] ? (KEYWORDS.has(text) ? 'kw' : 'id') : m[4] ? 'ws' : 'punct'
      tokens.push({ text, kind, start: offset + (m.index ?? 0) })
    }
    lines.push({ start: offset, tokens })
    offset += line.length + 1
  }
  return lines
}

export function Option1Editor() {
  const lines = useMemo(() => tokenize(tsxSnippet), [])
  const editor = useRef<HTMLDivElement>(null)
  const left = useRef<HTMLSpanElement>(null)
  const right = useRef<HTMLSpanElement>(null)
  const cursor = useRef<HTMLSpanElement>(null)
  const codeRoot = useRef<HTMLDivElement>(null)
  const shown = useRef(-1)

  const apply = (p: number) => {
    const ed = editor.current
    if (!ed) return
    // Grow: scale 0.35 → 1, slightly dim → full, then dip to 0.85 once the words arrive.
    const g = easeInOut(seg(p, 0, 0.45))
    const w = easeOut(seg(p, 0.9, 1))
    ed.style.transform = `scale(${0.35 + 0.65 * g})`
    ed.style.opacity = String(0.55 + 0.45 * g - 0.15 * w)

    // Words slide in from ±600px.
    const l = left.current
    const r = right.current
    if (l && r) {
      l.style.transform = `translateX(${-600 * (1 - w)}px)`
      r.style.transform = `translateX(${600 * (1 - w)}px)`
      l.style.opacity = r.style.opacity = String(w)
    }

    // Typing: slice every token to the visible char count; only touch the DOM when the count changes.
    const count = Math.round(seg(p, 0.15, 0.9) * tsxSnippet.length)
    if (count === shown.current) return
    shown.current = count
    const root = codeRoot.current
    const cur = cursor.current
    if (!root || !cur) return
    let lastLine: HTMLElement | null = null
    for (const lineEl of root.querySelectorAll<HTMLElement>('[data-line]')) {
      const lineStart = Number(lineEl.dataset.line)
      const reached = lineStart <= count
      lineEl.style.opacity = reached ? '1' : '0'
      if (reached) lastLine = lineEl
      for (const tok of lineEl.querySelectorAll<HTMLElement>('[data-s]')) {
        const s = Number(tok.dataset.s)
        const full = tok.dataset.t ?? ''
        tok.textContent = full.slice(0, Math.max(0, Math.min(full.length, count - s)))
      }
    }
    if (lastLine) lastLine.querySelector('[data-code]')?.appendChild(cur)
  }

  useLayoutEffect(() => {
    // LabOption (a child) reports first; only paint p=0 if nothing was applied yet.
    if (shown.current === -1) apply(0)
  }, [])

  return (
    <LabOption id="editor" heightVh={300} onProgress={apply}>
      <style>{`@keyframes lab-editor-blink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }`}</style>
      <div className="relative flex h-full w-full items-center justify-center">
        {/* Display words, behind the editor */}
        <span
          ref={left}
          className="text-display pointer-events-none absolute top-[12vh] left-[4vw] z-0 text-white will-change-transform tablet:top-[16vh]"
        >
          Ship
        </span>
        <span
          ref={right}
          className="text-display pointer-events-none absolute right-[4vw] bottom-[12vh] z-0 text-white will-change-transform tablet:bottom-[16vh]"
        >
          Code
        </span>

        {/* Editor window */}
        <div
          ref={editor}
          aria-hidden
          className="relative z-10 w-[min(1100px,92vw)] overflow-hidden rounded-lg border border-rule bg-gray-900 shadow-[0_30px_80px_rgba(0,0,0,.6)] will-change-transform"
          style={{ transformOrigin: '50% 50%' }}
        >
          {/* Title bar */}
          <div className="flex h-10 items-center gap-3 border-b border-rule bg-gray-800 px-4">
            <span className="flex gap-1.5">
              <i className="size-2.5 rounded-full bg-gray-500/60" />
              <i className="size-2.5 rounded-full bg-gray-500/40" />
              <i className="size-2.5 rounded-full bg-gray-500/25" />
            </span>
            <span className="ml-2 flex h-10 items-center border-b border-white px-3 font-mono text-[11px] tracking-[0.05em] text-white uppercase">
              page.tsx
            </span>
            <span className="hidden font-mono text-[11px] tracking-[0.05em] text-gray-500 uppercase tablet:inline">
              app/works/[slug]
            </span>
          </div>

          {/* Code */}
          <div
            ref={codeRoot}
            className="overflow-x-auto px-3 py-4 font-mono text-[13px] leading-[1.7] tablet:px-5 tablet:py-6 tablet:text-[14px] desktop:text-[15px]"
          >
            {lines.map(({ start, tokens: toks }, i) => (
              <div key={i} data-line={start} className="flex whitespace-pre">
                <span className="w-8 shrink-0 text-right text-gray-500 select-none tablet:w-10">{i + 1}</span>
                <span data-code className="pl-4 tablet:pl-6">
                  {toks.map((t, j) => (
                    <span key={j} data-s={t.start} data-t={t.text} style={{ color: COLOR[t.kind] }} />
                  ))}
                </span>
              </div>
            ))}
            <span
              ref={cursor}
              className="inline-block h-[1.1em] w-[0.6em] translate-y-[0.2em] bg-white align-baseline"
              style={{ animation: 'lab-editor-blink 1s steps(1) infinite' }}
            />
          </div>
        </div>
      </div>
    </LabOption>
  )
}
