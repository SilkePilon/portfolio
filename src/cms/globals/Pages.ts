import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'
import { markedText, sectionTag } from '../fields'
import { pages } from '@/content/home'
import { toMarked } from '@/lib/marked'

export const Pages: GlobalConfig = {
  slug: 'pages',
  label: 'Other pages',
  admin: { group: 'Pages' },
  access: { read: publicRead, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'notFound',
          label: '404',
          fields: [
            { name: 'heading', type: 'text', defaultValue: pages.notFound.heading, admin: { description: '404 page — big heading (e.g. "404").' } },
            { name: 'text', type: 'textarea', defaultValue: pages.notFound.text, admin: { description: '404 page — explanation paragraph.' } },
            { name: 'cta', type: 'text', label: 'Button text', defaultValue: pages.notFound.cta, admin: { description: '404 page — "Back to Home" button label.' } },
          ],
        },
        {
          name: 'works',
          label: 'Works page',
          fields: [
            sectionTag(pages.works.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(pages.works.heading), admin: { description: 'Works page (/works) — heading at the top.', rows: 3 } }),
            { name: 'text', type: 'textarea', defaultValue: pages.works.text, admin: { description: 'Works page (/works) — paragraph under the heading.' } },
          ],
        },
        {
          name: 'blogs',
          label: 'Blogs page',
          fields: [
            sectionTag(pages.blogs.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(pages.blogs.heading), admin: { description: 'Blogs page (/blogs) — heading at the top.', rows: 3 } }),
            { name: 'text', type: 'textarea', defaultValue: pages.blogs.text, admin: { description: 'Blogs page (/blogs) — paragraph under the heading.' } },
          ],
        },
        {
          name: 'workLabels',
          label: 'Work labels',
          fields: [
            { name: 'overview', type: 'text', defaultValue: pages.workLabels.overview, admin: { description: 'Work case-study page — "Overview" section label.' } },
            { name: 'date', type: 'text', defaultValue: pages.workLabels.date, admin: { description: 'Work case-study page — "Date:" label.' } },
            { name: 'client', type: 'text', defaultValue: pages.workLabels.client, admin: { description: 'Work case-study page — "Client:" label.' } },
            { name: 'industry', type: 'text', defaultValue: pages.workLabels.industry, admin: { description: 'Work case-study page — "Industry:" label.' } },
            { name: 'services', type: 'text', defaultValue: pages.workLabels.services, admin: { description: 'Work case-study page — "Services:" label.' } },
            { name: 'live', type: 'text', defaultValue: pages.workLabels.live, admin: { description: 'Work case-study page — "Live Project:" label.' } },
            { name: 'next', type: 'text', defaultValue: pages.workLabels.next, admin: { description: 'Work case-study page — "Next Project" heading.' } },
            { name: 'cta', type: 'text', defaultValue: pages.workLabels.cta, admin: { description: 'Work case-study page — "Explore all works" button label.' } },
          ],
        },
        {
          name: 'blogLabels',
          label: 'Blog labels',
          fields: [
            { name: 'next', type: 'text', defaultValue: pages.blogLabels.next, admin: { description: 'Blog post page — "Next Blogs" heading.' } },
            { name: 'cta', type: 'text', defaultValue: pages.blogLabels.cta, admin: { description: 'Blog post page — "Explore all blogs" button label.' } },
          ],
        },
      ],
    },
  ],
}
