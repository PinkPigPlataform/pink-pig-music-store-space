import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Stateless OAuth state: encode { nonce, origin } as base64url + HMAC signature.
 * No cookies needed — state travels via the OAuth `state` param and back.
 * CSRF protection is maintained by the HMAC signature verified in the callback.
 */
function buildState(origin: string): string {
  const payload = JSON.stringify({ nonce: crypto.randomBytes(16).toString('hex'), origin })
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = crypto
    .createHmac('sha256', process.env.PAYLOAD_SECRET!)
    .update(encoded)
    .digest('hex')
  return `${encoded}.${sig}`
}

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

  const state = buildState(origin)

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

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  )
}
