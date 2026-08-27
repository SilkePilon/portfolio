import type { GlobalConfig } from 'payload'
import { authenticated, publicRead } from '../access'
import { image, markedText, sectionTag } from '../fields'
import { home } from '@/content/home'
import { toMarked } from '@/lib/marked'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home page',
  admin: { group: 'Pages' },
  access: { read: publicRead, update: authenticated },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'hero',
          label: 'Hero',
          fields: [
            markedText('intro', 'Intro paragraph', {
              defaultValue: toMarked(home.hero.intro),
              admin: { description: 'Home page hero — the paragraph under the big name.', rows: 4 },
            }),
            {
              name: 'bio',
              type: 'array',
              label: 'Bio stats',
              labels: { singular: 'Stat', plural: 'Stats' },
              admin: { description: 'Home page hero — the four label/value stats under the intro (e.g. Location — London, UK).' },
              defaultValue: home.bio,
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          name: 'about',
          label: 'About',
          fields: [
            sectionTag(home.about.tag),
            {
              name: 'paragraphs',
              type: 'array',
              label: 'Paragraphs',
              admin: { description: 'Home page About section — the intro paragraphs next to the photo.' },
              defaultValue: home.about.paragraphs.map((text) => ({ text })),
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            image('image1', 'Photo 1', 'Home page About section — the tall portrait photo.'),
            markedText('caption', 'Caption', {
              defaultValue: toMarked(home.about.caption),
              admin: { description: 'Home page About section — the caption next to the second photo.', rows: 3 },
            }),
            image('image2', 'Photo 2', 'Home page About section — the wide photo next to the caption.'),
            { name: 'resultTag', type: 'text', label: 'Section tag', defaultValue: home.about.resultTag, admin: { description: 'Home page About section — small label above "Driven Result" heading.' } },
            markedText('resultHeading', 'Result heading', {
              defaultValue: toMarked(home.about.resultHeading),
              admin: { description: 'Home page About section — heading above the metrics row.', rows: 3 },
            }),
            {
              name: 'metrics',
              type: 'array',
              label: 'Metrics',
              labels: { singular: 'Metric', plural: 'Metrics' },
              maxRows: 4,
              admin: { description: 'Home page About section — up to four count-up stats (position = dot number).' },
              defaultValue: home.metrics.map((m) => ({ end: m.end, suffix: m.suffix, label: m.label, text: m.text })),
              fields: [
                { name: 'end', type: 'number', required: true, label: 'Counts up to', admin: { description: 'e.g. 62' } },
                { name: 'suffix', type: 'text', label: 'Suffix', admin: { description: 'e.g. "+" or "%".' } },
                { name: 'label', type: 'text', required: true, admin: { description: 'e.g. "Projects".' } },
                { name: 'text', type: 'textarea', label: 'Description' },
              ],
            },
          ],
        },
        {
          name: 'showcase',
          label: 'Showcase',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'reelWord1', type: 'text', label: 'Word 1', defaultValue: home.reel.words[0], admin: { description: 'Home page Showcase — first word of the spinning reel (e.g. "Show").' } },
                { name: 'reelWord2', type: 'text', label: 'Word 2', defaultValue: home.reel.words[1], admin: { description: 'Home page Showcase — second word of the spinning reel (e.g. "Case").' } },
              ],
            },
            { name: 'video', type: 'upload', relationTo: 'media', label: 'Showcase video', admin: { description: 'Home page Showcase — full-bleed looping video (mp4).' } },
          ],
        },
        {
          name: 'works',
          label: 'Works',
          fields: [
            sectionTag(home.works.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.works.heading), admin: { description: 'Home page Works section heading.', rows: 3 } }),
            markedText('text', 'Intro text', { defaultValue: toMarked(home.works.text), admin: { description: 'Home page Works section — paragraph under the heading.', rows: 3 } }),
            markedText('outro', 'Outro text', { defaultValue: toMarked(home.works.outro), admin: { description: 'Home page Works section — closing paragraph before the button.', rows: 3 } }),
            { name: 'cta', type: 'text', label: 'Button text', defaultValue: home.works.cta, admin: { description: 'Home page Works section — "Explore all works" button label.' } },
          ],
        },
        {
          name: 'services',
          label: 'Services',
          fields: [
            sectionTag(home.services.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.services.heading), admin: { description: 'Home page Services section heading.', rows: 3 } }),
            { name: 'text', type: 'textarea', label: 'Intro text', defaultValue: home.services.text, admin: { description: 'Home page Services section — paragraph under the heading.' } },
            image('image1', 'Photo 1', 'Home page Services section — first side photo.'),
            image('image2', 'Photo 2', 'Home page Services section — second side photo. Rows themselves are edited in the Services list.'),
          ],
        },
        {
          name: 'testimonials',
          label: 'Testimonials',
          fields: [
            sectionTag(home.testimonials.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.testimonials.heading), admin: { description: 'Home page Testimonials section heading.', rows: 3 } }),
            {
              type: 'row',
              fields: [
                { name: 'prev', type: 'text', defaultValue: home.testimonials.prev, admin: { description: 'Home page Testimonials — "previous" slider button label.' } },
                { name: 'next', type: 'text', defaultValue: home.testimonials.next, admin: { description: 'Home page Testimonials — "next" slider button label.' } },
              ],
            },
          ],
        },
        {
          name: 'clients',
          label: 'Clients',
          fields: [
            sectionTag(home.clients.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.clients.heading), admin: { description: 'Home page Clients section heading.', rows: 3 } }),
            markedText('text', 'Intro text', { defaultValue: toMarked(home.clients.text), admin: { description: 'Home page Clients section — paragraph under the heading.', rows: 3 } }),
            markedText('sentence', 'Closing sentence', { defaultValue: toMarked(home.clients.sentence), admin: { description: 'Home page Clients section — sentence above the "Book a call" button.', rows: 3 } }),
            { name: 'cta', type: 'text', label: 'Button text', defaultValue: home.clients.cta, admin: { description: 'Home page Clients section — "Book a call" button label.' } },
          ],
        },
        {
          name: 'approach',
          label: 'Approach',
          fields: [
            sectionTag(home.approach.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.approach.heading), admin: { description: 'Home page Approach section heading.', rows: 3 } }),
            { name: 'text', type: 'textarea', label: 'Intro text', defaultValue: home.approach.text, admin: { description: 'Home page Approach section — paragraph under the heading.' } },
            image('image', 'Photo', 'Home page Approach section photo.'),
            {
              name: 'steps',
              type: 'array',
              label: 'Steps',
              maxRows: 4,
              admin: { description: 'Home page Approach section — up to four process steps (position = dot number).' },
              defaultValue: home.approach.steps.map((s) => ({ title: s.title, text: s.text })),
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          name: 'awards',
          label: 'Awards',
          fields: [
            sectionTag(home.awards.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.awards.heading), admin: { description: 'Home page Awards section heading.', rows: 3 } }),
            markedText('sentence', 'Sentence', { defaultValue: toMarked(home.awards.sentence), admin: { description: 'Home page Awards section — sentence under the heading. Awards themselves are edited in the Awards list.', rows: 3 } }),
          ],
        },
        {
          name: 'blogs',
          label: 'Blogs',
          fields: [
            sectionTag(home.blogsPreview.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.blogsPreview.heading), admin: { description: 'Home page Blogs section heading.', rows: 3 } }),
            markedText('profileText', 'Profile text', { defaultValue: toMarked(home.blogsPreview.profileText), admin: { description: 'Home page Blogs section — text next to the author avatar.', rows: 3 } }),
            { name: 'cta', type: 'text', label: 'Button text', defaultValue: home.blogsPreview.cta, admin: { description: 'Home page Blogs section — "Read more blogs" button label.' } },
          ],
        },
        {
          name: 'faq',
          label: 'FAQ',
          fields: [
            sectionTag(home.faq.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.faq.heading), admin: { description: 'Home page FAQ section heading.', rows: 3 } }),
            markedText('outroHeading', 'Outro heading', { defaultValue: toMarked(home.faq.outroHeading), admin: { description: 'Home page FAQ section — "Didn’t find your answer?" heading.', rows: 3 } }),
            { name: 'outroText', type: 'textarea', label: 'Outro text', defaultValue: home.faq.outroText, admin: { description: 'Home page FAQ section — paragraph under the outro heading.' } },
            { name: 'outroCta', type: 'text', label: 'Outro button text', defaultValue: home.faq.outroCta, admin: { description: 'Home page FAQ section — "Send me a message" button label.' } },
          ],
        },
        {
          name: 'contact',
          label: 'Contact',
          fields: [
            sectionTag(home.contact.tag),
            markedText('heading', 'Heading', { defaultValue: toMarked(home.contact.heading), admin: { description: 'Home page Contact section heading.', rows: 3 } }),
            markedText('sentence', 'Sentence', { defaultValue: toMarked(home.contact.sentence), admin: { description: 'Home page Contact section — sentence under the heading.', rows: 3 } }),
            { name: 'connectLabel', type: 'text', label: 'Connect label', defaultValue: home.contact.connectLabel, admin: { description: 'Home page Contact section — small "Let’s Connect" label.' } },
            {
              name: 'fields',
              type: 'array',
              label: 'Form fields',
              admin: { description: 'Home page Contact section — the form fields, in order.' },
              defaultValue: home.contact.fields,
              fields: [
                {
                  name: 'key',
                  type: 'select',
                  label: 'Form value',
                  required: true,
                  options: ['Name', 'Email', 'Phone', 'Budget', 'Message'],
                  admin: { description: 'Which form value this row is — the label below is what visitors see' },
                },
                { name: 'name', type: 'text', label: 'Label', required: true, admin: { description: 'Field label, e.g. "Name".' } },
                { name: 'placeholder', type: 'text' },
                { name: 'type', type: 'select', defaultValue: 'text', options: ['text', 'email', 'tel', 'textarea'] },
              ],
            },
            markedText('replyNote', 'Reply note', { defaultValue: toMarked(home.contact.replyNote), admin: { description: 'Home page Contact section — "I usually reply within 24 hours" note.', rows: 2 } }),
            { name: 'submit', type: 'text', defaultValue: home.contact.submit, admin: { description: 'Contact form — submit button default label.' } },
            { name: 'submitting', type: 'text', defaultValue: home.contact.submitting, admin: { description: 'Contact form — submit button label while sending.' } },
            { name: 'sent', type: 'text', defaultValue: home.contact.sent, admin: { description: 'Contact form — submit button label after a successful send.' } },
            { name: 'failed', type: 'text', defaultValue: home.contact.failed, admin: { description: 'Contact form — submit button label after a failed send.' } },
          ],
        },
      ],
    },
  ],
}
