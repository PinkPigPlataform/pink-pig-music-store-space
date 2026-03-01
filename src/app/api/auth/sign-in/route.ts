import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as {
    email?: string
    password?: string
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  try {
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
      req: { headers: req.headers } as never,
    })

    const response = NextResponse.json({ success: true })
    if (result.token) {
      response.cookies.set('payload-token', result.token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      })
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
}
