'use client'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Appear } from '@/components/anim/Appear'
import { useHome, useSite } from '@/components/layout/ContentProvider'
import { ArrowButton } from '@/components/ui/ArrowButton'
import { Corners } from '@/components/ui/Corners'
import { Profile } from '@/components/ui/Profile'
import { RichSpan } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { SectionTag } from '@/components/ui/SectionTag'
import { home as staticHome } from '@/content/home'
import type { FormField } from '@/content/types'
import { cn } from '@/lib/cn'
import { submit as submitForm, validate, type FormErrors, type FormValues } from '@/lib/form'

const empty: FormValues = { Name: '', Email: '', Phone: '', Budget: '', Message: '', website: '' }

/**
 * The built-in row per form value. The five keys the form posts are fixed in code; the CMS rows only
 * supply the label, placeholder and input type, so a renamed or deleted row degrades to these.
 */
const builtIn = Object.fromEntries(staticHome.contact.fields.map((f) => [f.key, f])) as Record<FormField['key'], FormField>

type Status = 'idle' | 'pending' | 'success' | 'error'

/** Shared classes for every field's bordered input row (the label text row sits above it, unbordered). */
const inputRow = 'w-full border-y border-rule bg-transparent px-5 py-[22px] text-body text-white placeholder:text-gray-500'

/** One label + input/textarea pair. `className` lets the Email/Phone pair add a divider and share a row. */
function Field({
  name,
  values,
  errors,
  onChange,
  className,
}: {
  name: FormField['key']
  values: FormValues
  errors: FormErrors
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  className?: string
}) {
  // Matched on `key`, never on the label: editors can rename or delete the row in the admin.
  const f = useHome().contact.fields.find((x) => x.key === name) ?? builtIn[name]
  const error = errors[name]
  return (
    <label className={cn('flex flex-1 flex-col gap-2.5', className)}>
      <span className="px-5 text-mono">{f.name}</span>
      {f.type === 'textarea' ? (
        <textarea
          name={name}
          value={values[name]}
          onChange={onChange}
          placeholder={f.placeholder}
          aria-invalid={!!error}
          className={cn(inputRow, 'min-h-[180px]')}
        />
      ) : (
        <input
          type={f.type}
          name={name}
          value={values[name]}
          onChange={onChange}
          placeholder={f.placeholder}
          aria-invalid={!!error}
          className={inputRow}
        />
      )}
      {error && <span className="px-5 text-mono text-[#ff6b6b]">{error}</span>}
    </label>
  )
}

/** "Have a Project in Mind?" — CMS profile/contact details + the message form, posting through `src/lib/form.ts`. */
export function Contact() {
  const { tag, heading, sentence, connectLabel, replyNote, submit: submitLabel, submitting, sent, failed } = useHome().contact
  const site = useSite()
  const [values, setValues] = useState<FormValues>(empty)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'pending') return
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus('pending')
    const result = await submitForm(values)
    if (result === 'ok') {
      setStatus('success')
      setValues(empty)
      setErrors({})
    } else {
      setStatus('error')
    }
  }

  const label = status === 'pending' ? submitting : status === 'success' ? sent : status === 'error' ? failed : submitLabel

  return (
    <Section id="contact">
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-[30px] tablet:gap-[50px] desktop:gap-[70px]">
        <Appear preset="left" className="flex flex-col items-start gap-5 px-2.5 tablet:gap-[30px] tablet:px-5">
          <SectionTag>{tag}</SectionTag>
          <h2 className="max-w-[400px] text-h2 desktop:max-w-[500px]">
            <RichSpan parts={heading} />
          </h2>
        </Appear>

        <div className="grid grid-cols-1 gap-x-0 gap-y-[50px] tablet:grid-cols-2 desktop:grid-cols-4 desktop:gap-y-0">
          <Appear preset="fade" className="relative order-2 flex flex-col border-y border-rule desktop:order-none">
            <Corners />
            <div className="flex flex-col gap-[14px] p-[20px_10px] tablet:gap-5 tablet:p-[30px_20px]">
              <Profile name={site.profile.name} role={site.profile.role} avatar={site.profile.avatar} />
              <p className="max-w-[300px] text-lead">
                <RichSpan parts={sentence} />
              </p>
            </div>
            <div className="flex flex-col gap-[14px] border-t border-rule p-[20px_10px] tablet:gap-5 tablet:p-[30px_20px]">
              <p className="text-mono text-gray-500">{connectLabel}</p>
              <div className="flex flex-col gap-3.5">
                <a href={`mailto:${site.contact.email}`} className="text-mono-bold">
                  {site.contact.email}
                </a>
                <a href={`tel:${site.contact.phone}`} className="text-mono-bold">
                  {site.contact.phone}
                </a>
              </div>
            </div>
          </Appear>

          <Appear preset="right" className="order-1 tablet:col-span-2 desktop:order-none desktop:col-start-3">
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field name="Name" values={values} errors={errors} onChange={onChange} />

              <div className="flex flex-col gap-5 tablet:flex-row tablet:gap-0">
                <Field name="Email" values={values} errors={errors} onChange={onChange} />
                <Field name="Phone" values={values} errors={errors} onChange={onChange} className="tablet:border-l tablet:border-rule" />
              </div>

              <Field name="Budget" values={values} errors={errors} onChange={onChange} />
              <Field name="Message" values={values} errors={errors} onChange={onChange} />

              <div className="grid grid-cols-1 gap-y-5 tablet:grid-cols-2 tablet:gap-y-0">
                <div className="order-2 flex items-end px-2.5 tablet:order-none tablet:px-5">
                  <p className="max-w-[180px] text-mono">
                    <RichSpan parts={replyNote} />
                  </p>
                </div>
                <div className="relative order-1 border border-rule tablet:order-none">
                  <ArrowButton type="submit" bar disabled={status === 'pending'}>
                    {label}
                  </ArrowButton>
                </div>
              </div>

              <input
                type="text"
                name="website"
                value={values.website}
                onChange={onChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />
            </form>
          </Appear>
        </div>
      </div>
    </Section>
  )
}
