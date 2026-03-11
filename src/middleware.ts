import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'
import { NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

const { auth: nextAuthMiddleware } = NextAuth(authConfig)

export default nextAuthMiddleware((req) => {
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnApi = req.nextUrl.pathname.startsWith('/api')

    if (isOnAdmin || isOnApi) {
        return NextResponse.next()
    }

    return intlMiddleware(req)
})

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
