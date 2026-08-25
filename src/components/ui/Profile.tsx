import type { Img } from '@/content/types'
import { cn } from '@/lib/cn'

/** 40px round avatar + name / role, as used in Clients, Blogs and Contact. */
export function Profile({ name, role, avatar, className }: { name: string; role: string; avatar: Img; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img src={avatar.src} alt={avatar.alt} width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" loading="lazy" />
      <div className="flex flex-col gap-[5px]">
        <span className="text-mono-bold">{name}</span>
        <span className="text-mono text-gray-500">{role}</span>
      </div>
    </div>
  )
}
