import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './cms/collections/Users'
import { Media } from './cms/collections/Media'
import { Works } from './cms/collections/Works'
import { Posts } from './cms/collections/Posts'
import { Messages } from './cms/collections/Messages'
import { Site } from './cms/globals/Site'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Elian Kent CMS' },
  },
  collections: [Works, Posts, Media, Messages, Users],
  globals: [Site],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({ client: { url: process.env.DATABASE_URI || 'file:./payload.db' } }),
  sharp,
})
