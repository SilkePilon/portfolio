import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  // Self-contained build in .next/standalone (used by the Dockerfile) — no node_modules needed at runtime.
  output: 'standalone',
  images: { localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/images/**' }] },
  turbopack: { root: path.resolve(dirname) },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = { '.cjs': ['.cts', '.cjs'], '.js': ['.ts', '.tsx', '.js', '.jsx'], '.mjs': ['.mts', '.mjs'] }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
