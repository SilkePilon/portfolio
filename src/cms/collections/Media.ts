import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  upload: {
    staticDir: path.resolve(dirname, '../../../media'),
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
}
