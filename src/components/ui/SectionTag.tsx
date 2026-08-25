import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** "● LABEL" eyebrow used above every section heading. */
export function SectionTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 text-mono text-gray-500', className)}>
      <span aria-hidden className="size-[5px] shrink-0 rounded-full bg-fg" />
      <span>{children}</span>
    </div>
  )
}
