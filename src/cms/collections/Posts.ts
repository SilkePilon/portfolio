import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Blog post', plural: 'Blog posts' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'date', 'order'], group: 'Content' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL segment: /blogs/<slug>' } },
    { name: 'order', type: 'number', required: true, defaultValue: 0, admin: { position: 'sidebar', description: 'Sort order on the blogs page (ascending).' } },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar', description: 'Show on the home page (the first three featured posts are used).' } },
    { name: 'date', type: 'date', required: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    { name: 'category', type: 'text', required: true, admin: { description: 'Shown as the card eyebrow, e.g. "Design Strategy".' } },
    { name: 'cover', type: 'upload', relationTo: 'media', required: true },
    { name: 'body', type: 'richText', required: true, admin: { description: 'Use Heading 3 for section titles; paragraphs and bullet lists are supported.' } },
  ],
}
