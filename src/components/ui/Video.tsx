import { cn } from '@/lib/cn'

export function Video({ src, className, poster }: { src: string; className?: string; poster?: string }) {
  return <video src={src} poster={poster} muted loop playsInline autoPlay preload="metadata" className={cn('h-full w-full object-cover', className)} />
}
