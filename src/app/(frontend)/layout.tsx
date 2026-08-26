import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/host-grotesk'
import '@fontsource-variable/host-grotesk/wght-italic.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import '@fontsource/ibm-plex-mono/700.css'
import '@fontsource-variable/inter'
import 'lenis/dist/lenis.css'
import '@/index.css'
import { Shell } from '@/components/layout/Shell'
import { getSite } from '@/lib/cms'

/** Content is read from the CMS on every request so edits show up immediately. */
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  // SITE_URL is read at runtime (works with the prebuilt Docker image); NEXT_PUBLIC_SITE_URL is the build-time fallback.
  const base = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    metadataBase: new URL(base),
    title: { default: site.name, template: `%s - ${site.name}` },
    description: site.description,
    icons: {
      icon: [
        { url: '/images/favicon-light.png', media: '(prefers-color-scheme: light)' },
        { url: '/images/favicon-dark.png', media: '(prefers-color-scheme: dark)' },
      ],
    },
    openGraph: { type: 'website', title: site.name, description: site.description, images: [{ url: site.ogImage.src, width: site.ogImage.width, height: site.ogImage.height }] },
    twitter: { card: 'summary_large_image', title: site.name, description: site.description, images: [site.ogImage.src] },
  }
}

export const viewport = { themeColor: '#0e0e0e' }

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = await getSite()
  return (
    <html lang="en">
      <body>
        <Shell site={site}>{children}</Shell>
      </body>
    </html>
  )
}
