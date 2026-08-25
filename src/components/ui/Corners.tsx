import { cn } from '@/lib/cn'
import { PlusIcon } from './Icons'

type Variant = 4 | '2-bottom' | '2-top'

const positions: Record<Variant, string[]> = {
  4: ['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'],
  '2-bottom': ['-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'],
  '2-top': ['-top-1.5 -left-1.5', '-top-1.5 -right-1.5'],
}

/** The `+` markers the template draws on box corners (12px, centred on the corner). Parent must be `relative`. */
export function Corners({ variant = 4, className }: { variant?: Variant; className?: string }) {
  return (
    <>
      {positions[variant].map((pos) => (
        <span key={pos} aria-hidden className={cn('pointer-events-none absolute z-10 size-3 text-corner', pos, className)}>
          <PlusIcon className="size-full" />
        </span>
      ))}
    </>
  )
}
