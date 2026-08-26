import type { Field, TextareaField, UploadField } from 'payload'

/** Grey/white heading: plain textarea using `**white**` markers; newline = line break. */
export const markedText = (name: string, label: string, extra: Partial<TextareaField> = {}): TextareaField => ({
  name,
  type: 'textarea',
  label,
  admin: { description: 'Grey by default. Wrap the white part in **double asterisks**. Enter = new line.', rows: 2, ...extra.admin },
  ...extra,
})

export const image = (name: string, label: string, description?: string): UploadField => ({
  name, type: 'upload', relationTo: 'media', label, admin: description ? { description } : undefined,
})

/** The "Services(04)"-style eyebrow above a section heading. */
export const sectionTag = (defaultValue: string): Field => ({
  name: 'tag', type: 'text', label: 'Section tag', defaultValue, admin: { description: 'Small mono label above the heading, e.g. "Services(04)".' },
})
