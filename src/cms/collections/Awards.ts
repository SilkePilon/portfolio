import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Rows shown in the home page Awards section. Drag to reorder. */
export const Awards: CollectionConfig = {
  slug: 'awards',
  labels: { singular: 'Award', plural: 'Awards' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'text'], group: 'Home lists' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  orderable: true,
  defaultSort: '_order',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Award name, e.g. "Awwwards (3×)".' } },
    { name: 'text', type: 'textarea', admin: { description: 'Short description of the award.' } },
  ],
}
