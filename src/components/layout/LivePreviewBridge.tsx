'use client'
import { useEffect } from 'react'
import { mergeData, ready } from '@payloadcms/live-preview'
import { applyPreview } from '@/lib/preview-patch'
import { useSetContent } from './ContentProvider'

/** Inside the Payload admin's live-preview iframe: patches the content context as the editor types. No-op elsewhere. */
export function LivePreviewBridge() {
  const setContent = useSetContent()
  useEffect(() => {
    if (window.parent === window) return
    const serverURL = window.location.origin
    let latest = 0
    const onMessage = async (event: MessageEvent) => {
      const message = event.data
      if (event.origin !== serverURL || !message || message.type !== 'payload-live-preview') return
      const { collectionSlug, globalSlug, data, locale } = message
      if (!collectionSlug && !globalSlug) return
      const seq = ++latest
      try {
        // Ask Payload to populate the uploads and relationships of the unsaved form data. A document that
        // was never saved has no id to populate against, so its raw form data is used as it comes.
        const doc =
          collectionSlug && !data?.id
            ? data
            : await mergeData<Record<string, any>>({
                apiRoute: '/api',
                collectionSlug,
                globalSlug,
                depth: 1,
                incomingData: data,
                initialData: { id: data?.id },
                locale,
                serverURL,
              })
        // Keystrokes overlap and the responses can land out of order — only the newest may touch the page.
        if (seq === latest) setContent((c) => applyPreview(c, { collectionSlug, globalSlug, doc }))
      } catch (e) {
        console.warn('[live-preview]', e)
      }
    }
    window.addEventListener('message', onMessage)
    ready({ serverURL })
    return () => window.removeEventListener('message', onMessage)
  }, [setContent])
  return null
}
