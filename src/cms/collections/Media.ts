import path from 'path'
import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Where uploads are stored on disk. Defaults to `<project>/media`; the Docker image sets MEDIA_DIR=/data/media. */
export const mediaDir = path.resolve(process.env.MEDIA_DIR || path.join(process.cwd(), 'media'))

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    staticDir: mediaDir,
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
}
