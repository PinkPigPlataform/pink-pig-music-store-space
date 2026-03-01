import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
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

  // Verify state
  const cookieStore = await cookies()
  const oauthStateCookie = cookieStore.get('google-oauth-state')?.value

  if (!oauthStateCookie) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=missing-state`)
  }

  let storedState: { state: string; origin: string }
  try {
    storedState = JSON.parse(oauthStateCookie)
  } catch {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=invalid-state`)
  }

  if (state !== storedState.state) {
    return NextResponse.redirect(`${baseUrl}/sign-in?error=state-mismatch`)
  }

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
      limit: 1,
    })

    let userId: string | number

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0]
      userId = existingUser.id

      // Ensure user is verified
      if (!existingUser._verified) {
        await payload.update({
          collection: 'users',
          id: existingUser.id,
          data: { _verified: true },
        })
      }
    } else {
      // Create new user with random password (OAuth-only user).
      // Payload writes to MongoDB BEFORE calling the email hook, so even if
      // Resend rejects the verification email (e.g. 422 / missing html), the
      // user record already exists. We catch that error and look the user up.
      const randomPassword = crypto.randomBytes(32).toString('hex')

      try {
        const newUser = await payload.create({
          collection: 'users',
          data: {
            email: googleUser.email,
            password: randomPassword,
            role: 'user',
            _verified: true,
          },
          context: { isOAuthCreate: true, skipVerificationEmail: true },
        })
        userId = newUser.id
      } catch (createError) {
        // Payload may have persisted the user before the email hook threw.
        // Try to find the newly-created record before treating this as fatal.
        const { docs: createdDocs } = await payload.find({
          collection: 'users',
          where: { email: { equals: googleUser.email } },
          limit: 1,
        })

        if (createdDocs.length > 0) {
          userId = createdDocs[0].id

          // Ensure the record is marked verified (may not have been saved yet).
          if (!createdDocs[0]._verified) {
            await payload.update({
              collection: 'users',
              id: userId,
              data: { _verified: true },
            })
          }
        } else {
          // User was not created at all — surface the real error.
          throw createError
        }
      }
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
    const origin = storedState.origin || '/'
    const response = NextResponse.redirect(`${baseUrl}${origin}`)

    response.cookies.set('payload-token', payloadToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    // Clean up the oauth state cookie
    response.cookies.delete('google-oauth-state')

    return response
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${baseUrl}/sign-in?error=server-error`)
  }
}
