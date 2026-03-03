import { NextResponse } from 'next/server'
import { buildOAuthState } from '@/lib/user-auth'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const origin = searchParams.get('origin') || '/'

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
        return NextResponse.json({ error: 'Google OAuth não configurado' }, { status: 500 })
    }

    const state = buildOAuthState(origin)
    const base = process.env.NEXT_PUBLIC_STORE_URL || ''
    const redirectUri = `${base}/api/auth/user/google/callback`

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
