import { cn } from '@/lib/cn'

/**
 * Per-character hover effect from the template's nav links: each letter has a duplicate
 * that slides in from above while the idle letter slides out below, staggered 20ms per char.
 * Put `group` on the hovered ancestor.
 */
export function SlideText({
  text,
  className,
  idle = 'text-gray-300',
  hover = 'text-white',
}: {
  text: string
  className?: string
  idle?: string
  hover?: string
}) {
  const chars = Array.from(text)
  return (
    <span className={cn('inline-flex whitespace-pre', className)} aria-label={text}>
      {chars.map((c, i) => (
        <span key={i} aria-hidden className="relative inline-block overflow-hidden">
          <span
            className={cn('inline-block transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-full', idle)}
            style={{ transitionDelay: `${i * 20}ms` }}
          >
            {c}
          </span>
          <span
            className={cn('absolute left-0 top-0 inline-block -translate-y-full transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0', hover)}
            style={{ transitionDelay: `${i * 20}ms` }}
          >
            {c}
          </span>
        </span>
      ))}
    </span>
  )
}
