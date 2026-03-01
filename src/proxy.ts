import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
    const { nextUrl, cookies } = req
    const token = cookies.get('payload-token')?.value

    const isAuthenticated = !!token

    if (isAuthenticated && ['/sign-in', '/sign-up'].includes(nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/sign-in', '/sign-up'],
}
