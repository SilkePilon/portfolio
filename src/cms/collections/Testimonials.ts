import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Quotes shown in the home page Testimonials slider. Drag to reorder. */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'role'], group: 'Home lists' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  orderable: true,
  defaultSort: '_order',
  fields: [
    { name: 'quote', type: 'textarea', required: true, admin: { description: 'The quote, shown in the testimonial card.' } },
    { name: 'name', type: 'text', required: true, admin: { description: 'Person’s name, shown under the quote.' } },
    { name: 'role', type: 'text', admin: { description: 'Person’s role and company, e.g. "Director, Aestha Studio".' } },
    { name: 'avatar', type: 'upload', relationTo: 'media', admin: { description: 'Small photo shown next to the name.' } },
  ],
}
