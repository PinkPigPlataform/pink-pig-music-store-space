import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

interface GoogleTokenResponse {
  access_token: string
  id_token: string
  token_type: string
  expires_in: number
}

interface GoogleUserInfo {
  email: string
  email_verified: boolean
  name?: string
  picture?: string
  sub: string
}

/**
 * Verify and decode the stateless HMAC-signed OAuth state parameter.
 * Returns { nonce, origin } or null if invalid/tampered.
 */
function verifyState(state: string): { nonce: string; origin: string } | null {
  try {
    const dotIndex = state.lastIndexOf('.')
    if (dotIndex === -1) return null
    const encoded = state.slice(0, dotIndex)
    const sig = state.slice(dotIndex + 1)
    const expectedSig = crypto
      .createHmac('sha256', process.env.PAYLOAD_SECRET!)
      .update(encoded)
      .digest('hex')
    if (sig !== expectedSig) return null
    return JSON.parse(Buffer.from(encoded, 'base64url').toString())
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''

  // Handle errors from Google
  if (error) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=google-denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=missing-params`)
  }

  // Verify HMAC-signed state (stateless — no cookie needed)
  const stateData = verifyState(state)
  if (!stateData) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=invalid-state`)
  }

  const origin = stateData.origin || '/'


  try {
    // Exchange code for tokens
    const redirectUri = `${baseUrl}/api/auth/google/callback`
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Google token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(`${baseUrl}/sign-in?error=token-exchange`)
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=userinfo-failed`)
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    if (!googleUser.email || !googleUser.email_verified) {
      return NextResponse.redirect(`${baseUrl}/sign-in?error=email-not-verified`)
    }

    // Find or create user in Payload
    const payload = await getPayloadClient()

    const { docs: existingUsers } = await payload.find({
      collection: 'users',
      where: { email: { equals: googleUser.email } },
      overrideAccess: true,
      limit: 1,
    })

    let userId: string | number | undefined

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      userId = existingUser.id

      // Ensure user is verified
      if (!existingUser._verified) {
        await payload.update({
          collection: 'users',
          id: existingUser.id,
          overrideAccess: true,
          data: { _verified: true },
        })
      }
    } else {
      // Create user directly via the DB adapter — no Payload hooks, no email.
      // OAuth users authenticate via Google only; they never need email/password login.
      // Using payload.db.create() bypasses the verification email flow entirely,
      // making this independent of Resend domain configuration.
      try {
        const newDoc = await payload.db.create({
          collection: 'users',
          data: {
            email: googleUser.email,
            role: 'user',
            _verified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          req: undefined as never,
        })
        userId = (newDoc as { id: string | number }).id
        console.log('Google OAuth: user created via db.create, id:', userId)
      } catch (dbError) {
        console.error('Google OAuth: db.create failed:', dbError)
        // userId stays undefined → handled below
      }
    }

    // If we could not resolve a userId by any means, bail out clearly.
    if (userId === undefined) {
      console.error('Google OAuth: could not resolve userId — aborting')
      return NextResponse.redirect(`${baseUrl}/sign-in?error=server-error`)
    }

    // Generate Payload JWT token manually
    const payloadSecret = process.env.PAYLOAD_SECRET!
    const payloadToken = jwt.sign(
      {
        id: userId,
        email: googleUser.email,
        collection: 'users',
      },
      payloadSecret,
      { expiresIn: '7d' }
    )

    // Set the payload-token cookie and redirect
    const response = NextResponse.redirect(`${baseUrl}${origin}`)

    response.cookies.set('payload-token', payloadToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/sign-in?error=server-error`)
  }
}
