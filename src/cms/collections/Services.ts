import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Rows shown in the home page Services section. Drag to reorder. */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'text'], group: 'Home lists' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  orderable: true,
  defaultSort: '_order',
  fields: [
    { name: 'title', type: 'text', required: true, admin: { description: 'Service row title, e.g. "Website Design & Development".' } },
    { name: 'text', type: 'textarea', admin: { description: 'Service row description.' } },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      admin: { description: 'Small pill tags shown on the service row (e.g. "Figma", "Framer").' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Image revealed on hover for this service row.' } },
  ],
}
