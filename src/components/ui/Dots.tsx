import { cn } from '@/lib/cn'

/** Four 5px dots; the first `active` are solid, the rest dimmed. */
export function Dots({ active, className }: { active: 1 | 2 | 3 | 4; className?: string }) {
  return (
    <div className={cn('flex items-center gap-[5px]', className)} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} data-active={i <= active} className={cn('size-[5px] rounded-full bg-fg', i > active && 'opacity-40')} />
      ))}
    </div>
  )
}
