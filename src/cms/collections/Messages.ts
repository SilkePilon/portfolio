import type { CollectionConfig } from 'payload'
import { authenticated } from '../access'

/** Contact-form submissions (created by /api/contact, read in the admin). */
export const Messages: CollectionConfig = {
  slug: 'messages',
  labels: { singular: 'Message', plural: 'Messages' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'budget', 'createdAt'], group: 'Inbox' },
  access: { read: authenticated, create: () => true, update: authenticated, delete: authenticated },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'budget', type: 'text' },
    { name: 'message', type: 'textarea', required: true },
  ],
}
