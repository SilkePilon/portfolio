import { Fragment } from 'react'
import type { BlogBlock, Rich } from '@/content/types'
import { cn } from '@/lib/cn'

/** Renders the content model's mixed-colour strings: muted parts grey, `br` line breaks. */
export function RichSpan({ parts, mutedClass = 'text-gray-500' }: { parts: Rich; mutedClass?: string }) {
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p.br ? <br /> : <span className={cn(p.muted && mutedClass)}>{p.text}</span>}
        </Fragment>
      ))}
    </>
  )
}

/** Blog article body: uppercase h3 headings, paragraphs and bullet lists in reading order. */
export function BlogBody({ body, className }: { body: BlogBlock[]; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {body.map((b, i) => {
        if (b.kind === 'heading') return <h3 key={i} className={cn('text-h3', i > 0 && 'mt-5')}>{b.text}</h3>
        if (b.kind === 'list')
          return (
            <ul key={i} className="flex list-disc flex-col gap-2.5 pl-5 text-body">
              {b.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )
        return (
          <p key={i} className="text-body">
            {b.text}
          </p>
        )
      })}
    </div>
  )
}
