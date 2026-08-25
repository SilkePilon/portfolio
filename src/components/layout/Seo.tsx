import { useEffect } from 'react'
import { site } from '@/content/site'

/** Sets the document title ("<title> - Elian Kent") and meta description for the current page. */
export function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    document.title = title ? `${title} - ${site.name}` : site.name
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (meta) meta.content = description ?? site.description
  }, [title, description])
  return null
}
