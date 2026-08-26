import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Logos shown in the home page Clients grid. Drag to reorder. */
export const Clients: CollectionConfig = {
  slug: 'clients',
  labels: { singular: 'Client', plural: 'Clients' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'year'], group: 'Home lists' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  orderable: true,
  defaultSort: '_order',
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'Client name, shown under the logo.' } },
    { name: 'year', type: 'text', admin: { description: 'Year worked with, e.g. "2025".' } },
    { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Client logo image.' } },
    { name: 'href', type: 'text', label: 'Link', admin: { description: 'Optional link the client card opens (leave empty for none).' } },
  ],
}
