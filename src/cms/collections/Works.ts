import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

export const Works: CollectionConfig = {
  slug: 'works',
  labels: { singular: 'Work', plural: 'Works' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'order', 'date'], group: 'Content' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { description: 'URL segment: /works/<slug>' } },
    { name: 'order', type: 'number', required: true, defaultValue: 0, admin: { position: 'sidebar', description: 'Sort order on the home page and the works page (ascending).' } },
    { name: 'date', type: 'date', admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } } },
    {
      type: 'row',
      fields: [
        { name: 'cover', type: 'upload', relationTo: 'media', required: true, admin: { description: 'Card image (4:3).' } },
        { name: 'hoverCover', type: 'upload', relationTo: 'media', admin: { description: 'Revealed by the liquid hover effect on cards. Defaults to the first gallery image.' } },
      ],
    },
    { name: 'description', type: 'textarea', admin: { description: 'One-liner shown next to the title on the case-study page.' } },
    { name: 'overview', type: 'textarea', admin: { description: 'Overview paragraph on the case-study page.' } },
    {
      type: 'row',
      fields: [
        { name: 'client', type: 'text' },
        { name: 'industry', type: 'text' },
        { name: 'liveUrl', type: 'text', label: 'Live project URL' },
      ],
    },
    { name: 'services', type: 'array', labels: { singular: 'Service', plural: 'Services' }, fields: [{ name: 'label', type: 'text', required: true }] },
    { name: 'gallery', type: 'array', labels: { singular: 'Image', plural: 'Gallery' }, admin: { description: 'Four images shown in a 2×2 grid.' }, fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }] },
  ],
}
