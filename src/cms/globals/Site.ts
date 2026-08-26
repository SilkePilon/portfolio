import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'
import { markedText } from '../fields'
import { site } from '@/content/site'
import { toMarked } from '@/lib/marked'

const link = [
  { name: 'label', type: 'text' as const, required: true },
  { name: 'href', type: 'text' as const, required: true },
]

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  admin: { group: 'Pages' },
  access: { read: publicRead, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            { name: 'name', type: 'text', required: true, defaultValue: 'Elian Kent', admin: { description: 'Used in titles, the preloader and the giant footer wordmark.' } },
            {
              type: 'row',
              fields: [
                { name: 'wordmarkLine1', type: 'text', required: true, defaultValue: 'EliaN', admin: { description: 'Logo, first line' } },
                { name: 'wordmarkLine2', type: 'text', required: true, defaultValue: 'Kent', admin: { description: 'Logo, second line' } },
              ],
            },
            { name: 'description', type: 'textarea', required: true, admin: { description: 'Default meta description / Open Graph description.' } },
            { name: 'ogImage', type: 'upload', relationTo: 'media', label: 'Social share image' },
          ],
        },
        {
          label: 'Home hero',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Background photo', admin: { description: 'Full-bleed photo behind the wordmarks (2400×1412 in the template).' } },
                {
                  type: 'row',
                  fields: [
                    { name: 'nameLine1', type: 'text', label: 'Big name, line 1', admin: { description: 'e.g. Elian' } },
                    { name: 'nameLine2', type: 'text', label: 'Big name, line 2', admin: { description: 'e.g. Kent' } },
                  ],
                },
                { name: 'badge', type: 'text', label: 'Badge text', admin: { description: 'Small cell bottom-left, e.g. "Building the future of email at Resend."' } },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            { name: 'nav', type: 'array', labels: { singular: 'Link', plural: 'Links' }, admin: { description: 'Header + footer sitemap. Use "/#about" style links for home sections.' }, fields: [{ name: 'label', type: 'text', required: true }, { name: 'to', type: 'text', required: true }] },
            { name: 'bookCall', type: 'group', label: 'Book-a-call button', fields: link },
          ],
        },
        {
          label: 'Contact & socials',
          fields: [
            { name: 'contact', type: 'group', fields: [{ name: 'email', type: 'text', required: true }, { name: 'phone', type: 'text', required: true }] },
            { name: 'socials', type: 'array', labels: { singular: 'Social link', plural: 'Social links' }, fields: link },
            {
              name: 'profile',
              type: 'group',
              admin: { description: 'The small avatar + name + role shown in Clients, Blogs and Contact.' },
              fields: [{ name: 'name', type: 'text', required: true }, { name: 'role', type: 'text', required: true }, { name: 'avatar', type: 'upload', relationTo: 'media' }],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            markedText('tagline', 'Footer tagline', {
              defaultValue: toMarked(site.footer.tagline),
              admin: { description: 'Footer — the tagline sentence above the social links.', rows: 3 },
            }),
            { name: 'socialsTitle', type: 'text', defaultValue: 'Follow on' },
            { name: 'socialsText', type: 'text', defaultValue: 'Creating experiences that balance aesthetics, usability, and intent.' },
            {
              name: 'createdBy',
              type: 'group',
              label: '"Created by" credit',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'Created by' },
                { name: 'name', type: 'text' },
                { name: 'href', type: 'text' },
                { name: 'avatar', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
