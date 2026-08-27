import type { Field, TextareaField, UploadField } from 'payload'

/** Editor help shown on every marked field, before the call site's own description. */
const MARKED_HELP = 'Grey by default. Wrap the white part in **double asterisks**. Enter = new line.'

/** Grey/white heading: plain textarea using `**white**` markers; newline = line break. */
export const markedText = (name: string, label: string, extra: Partial<TextareaField> = {}): TextareaField => {
  const { admin, ...rest } = extra
  return {
    name,
    type: 'textarea',
    label,
    ...rest,
    admin: {
      rows: 2,
      ...admin,
      description: [MARKED_HELP, admin?.description].filter(Boolean).join(' '),
    },
  }
}

export const image = (name: string, label: string, description?: string): UploadField => ({
  name, type: 'upload', relationTo: 'media', label, admin: description ? { description } : undefined,
})

/** The "Services(04)"-style eyebrow above a section heading. */
export const sectionTag = (defaultValue: string): Field => ({
  name: 'tag', type: 'text', label: 'Section tag', defaultValue, admin: { description: 'Small mono label above the heading, e.g. "Services(04)".' },
})
