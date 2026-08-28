import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'dark' | 'light'

/**
 * Vertical 1px rules at the 4 column edges (3 on tablet/phone where the grid has 2 columns).
 * Colour follows `--rule`, set by the surrounding `.theme-dark` / `.theme-light`.
 */
export function GridLines({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 z-0 flex justify-center px-2.5 tablet:px-5', className)}>
      <div className="relative flex h-full w-full max-w-[1600px] justify-between">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-full w-px bg-rule', (i === 1 || i === 3) && 'hidden desktop:block')} />
        ))}
      </div>
    </div>
  )
}

/**
 * Full-width page section with the template's gutter (10px phone / 20px tablet+).
 * `tone="light"` switches to the #ededed sections (Services, Approach) with their own rules and padding.
 * `index` (with an `id`) lists the section in the fixed right-hand `SectionIndex` nav.
 */
export function Section({
  id,
  index,
  tone = 'dark',
  className,
  children,
  as: Tag = 'section',
}: {
  id?: string
  index?: string
  tone?: Tone
  className?: string
  children: ReactNode
  as?: 'section' | 'header' | 'div'
}) {
  return (
    <Tag
      id={id}
      data-index={index}
      className={cn(
        'relative w-full px-2.5 tablet:px-5',
        tone === 'light' ? 'theme-light bg-light py-[100px] text-black tablet:py-[150px]' : 'theme-dark text-white',
        className,
      )}
    >
      {tone === 'light' && <GridLines />}
      {children}
    </Tag>
  )
}

/** Centred 1600px content box. With `grid` (default) it is the 2/4-column layout grid. */
export function Container({ className, children, grid = true }: { className?: string; children: ReactNode; grid?: boolean }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[1600px]', grid && 'grid grid-cols-2 desktop:grid-cols-4', className)}>
      {children}
    </div>
  )
}
