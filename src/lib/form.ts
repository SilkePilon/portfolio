export type FormValues = { Name: string; Email: string; Phone: string; Budget: string; Message: string; website?: string }
export type FormErrors = Partial<Record<keyof FormValues, string>>

export function validate(v: FormValues): FormErrors {
  const e: FormErrors = {}
  if (!v.Name.trim()) e.Name = 'Required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.Email.trim())) e.Email = 'Enter a valid e-mail'
  if (!v.Phone.trim()) e.Phone = 'Required'
  if (!v.Budget.trim()) e.Budget = 'Required'
  if (!v.Message.trim()) e.Message = 'Required'
  return e
}

/** POSTs to /api/contact (stored in the CMS "Messages" collection) or to NEXT_PUBLIC_FORM_ENDPOINT when set. */
export async function submit(v: FormValues): Promise<'ok' | 'error'> {
  if (v.website) return 'ok' // honeypot filled → pretend success
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT || '/api/contact'
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}
