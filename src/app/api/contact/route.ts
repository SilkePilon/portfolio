import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/** Contact-form endpoint: validates and stores the submission in the CMS "Messages" collection. */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const str = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '')
  if (str('website')) return NextResponse.json({ ok: true }) // honeypot
  const data = { name: str('Name'), email: str('Email'), phone: str('Phone'), budget: str('Budget'), message: str('Message') }
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !data.message) {
    return NextResponse.json({ error: 'Name, a valid e-mail and a message are required' }, { status: 422 })
  }
  const payload = await getPayload({ config })
  await payload.create({ collection: 'messages', data })
  return NextResponse.json({ ok: true })
}
