import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const origin = searchParams.get('origin') || '/'

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured' },
      { status: 500 }
    )
  }

  // Generate a random state to prevent CSRF
  const state = crypto.randomBytes(32).toString('hex')

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const redirectUri = `${baseUrl}/api/auth/google/callback`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  // Set the cookie directly on the response object instead of via cookieStore.
  // In Vercel serverless, cookieStore.set() inside a redirect handler can be
  // silently dropped. Setting it on the NextResponse guarantees it is sent.
  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )

  response.cookies.set('google-oauth-state', JSON.stringify({ state, origin }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  })

  return response
}
