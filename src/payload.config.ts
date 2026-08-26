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
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** Required in production (signs auth cookies/JWTs); a fixed dev fallback keeps `npm run dev`/tests/builds zero-config. */
function payloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('PAYLOAD_SECRET is not set. Generate one with `openssl rand -hex 32` and pass it as an environment variable.')
  }
  return 'dev-only-secret-change-me'
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Elian Kent CMS' },
  },
  collections: [Works, Posts, Media, Messages, Users],
  globals: [Site],
  editor: lexicalEditor(),
  secret: payloadSecret(),
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./payload.db' },
    // Dev pushes schema changes automatically; production (Docker image) applies these migrations on start.
    // After changing collections run `npm run payload -- migrate:create <name>` and commit src/migrations.
    prodMigrations: migrations,
  }),
  sharp,
})
