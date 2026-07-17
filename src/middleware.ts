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

    const pathname = req.nextUrl.pathname
    const isAccountRoute = pathname.includes('/account') || pathname.includes('/conta')
    
    if (isAccountRoute) {
        const token = req.cookies.get('user-token')?.value
        if (!token) {
            const localeMatch = pathname.match(/^\/([a-z]{2})\b/)
            const locale = localeMatch ? localeMatch[1] : null
            let signInPath = '/sign-in'
            if (locale === 'pt') {
                signInPath = '/pt/entrar'
            } else if (locale === 'en') {
                signInPath = '/en/sign-in'
            }
            const redirectUrl = new URL(signInPath, req.url)
            redirectUrl.searchParams.set('redirect', pathname + req.nextUrl.search)
            return NextResponse.redirect(redirectUrl)
        }
    }

    return intlMiddleware(req)
})

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
