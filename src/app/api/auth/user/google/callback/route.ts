import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { verifyOAuthState, generateUserToken } from '@/lib/user-auth'

interface GoogleTokens {
    access_token: string
    id_token: string
}

interface GoogleUser {
    email: string
    email_verified: boolean
    name?: string
    sub: string
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    const base = process.env.NEXT_PUBLIC_STORE_URL || ''

    if (error) return NextResponse.redirect(`${base}/sign-in?error=google-denied`)
    if (!code || !state) return NextResponse.redirect(`${base}/sign-in?error=missing-params`)

    const stateData = verifyOAuthState(state)
    if (!stateData) return NextResponse.redirect(`${base}/sign-in?error=invalid-state`)

    const origin = stateData.origin || '/'

    try {
        const redirectUri = `${base}/api/auth/user/google/callback`

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
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

        if (!tokenRes.ok) {
            console.error('Token exchange failed:', await tokenRes.text())
            return NextResponse.redirect(`${base}/sign-in?error=token-exchange`)
        }

        const tokens: GoogleTokens = await tokenRes.json()

        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        })

        if (!userInfoRes.ok) return NextResponse.redirect(`${base}/sign-in?error=userinfo-failed`)

        const googleUser: GoogleUser = await userInfoRes.json()

        if (!googleUser.email || !googleUser.email_verified) {
            return NextResponse.redirect(`${base}/sign-in?error=email-not-verified`)
        }

        await connectMongo()

        let user = await UserModel.findOne({ email: googleUser.email })

        if (!user) {
            user = await UserModel.create({
                name: googleUser.name || googleUser.email.split('@')[0],
                email: googleUser.email,
                googleId: googleUser.sub,
                _verified: true,
            })
        } else if (!user._verified) {
            user._verified = true
            await user.save()
        }

        const token = generateUserToken(user._id.toString(), user.email)

        const response = NextResponse.redirect(`${base}${origin}`)
        response.cookies.set('user-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (err) {
        console.error('Google OAuth callback error:', err)
        return NextResponse.redirect(`${base}/sign-in?error=server-error`)
    }
}
