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
          data: { _verified: true },
        })
      }
    } else {
      // Create new user. Payload persists to DB before triggering the email
      // hook, so if the email fails the user already exists in MongoDB.
      // We always attempt recovery — email errors must NEVER block OAuth login.
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
          context: {
            isOAuthCreate: true,
            skipVerificationEmail: true,
            disableVerificationEmail: true,
          },
        })
        userId = newUser.id
      } catch (createError) {
        // payload.create threw — could be email failure or a real DB error.
        // Log the raw error so it is visible in Vercel logs.
        console.warn('Google OAuth: payload.create threw (may be email error):', createError)

        // Always attempt to recover — find the user that was (likely) persisted.
        try {
          const { docs: createdDocs } = await payload.find({
            collection: 'users',
            where: { email: { equals: googleUser.email } },
            limit: 1,
          })

          if (createdDocs.length > 0) {
            userId = createdDocs[0].id
            console.warn('Google OAuth: recovered userId after createError:', userId)

            if (!createdDocs[0]._verified) {
              await payload.update({
                collection: 'users',
                id: userId,
                data: { _verified: true },
              })
            }
          } else {
            // User truly was not persisted — log the failure clearly.
            console.error('Google OAuth: user not in DB after createError. Original error:', createError)
            // userId stays undefined → handled below
          }
        } catch (findError) {
          console.error('Google OAuth: find-after-create also failed:', findError)
          // userId stays undefined → handled below
        }
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
