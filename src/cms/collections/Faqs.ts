import type { CollectionConfig } from 'payload'
import { authenticated, publicRead } from '../access'

/** Rows shown in the home page FAQ accordion. Drag to reorder. */
export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: { useAsTitle: 'question', defaultColumns: ['question'], group: 'Home lists' },
  access: { read: publicRead, create: authenticated, update: authenticated, delete: authenticated },
  orderable: true,
  defaultSort: '_order',
  fields: [
    { name: 'question', type: 'text', required: true, admin: { description: 'The question, shown as the accordion row.' } },
    { name: 'answer', type: 'textarea', required: true, admin: { description: 'The answer, shown when the row is expanded.' } },
  ],
}
