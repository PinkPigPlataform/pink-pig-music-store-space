import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    trustHost: true,
    pages: { signIn: '/admin/login' },
    session: { strategy: 'jwt' as const, maxAge: 60 * 60 * 24 * 30 },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLogin = nextUrl.pathname === '/admin/login'
            const isOnAdmin = nextUrl.pathname.startsWith('/admin')

            if (isOnAdmin && !isOnLogin && !isLoggedIn) {
                return false // redirects to signIn page
            }
            return true
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = (user as { role?: string }).role
                token.id = user.id ?? token.sub
            }
            // Handle update() call from client — sync new name into token
            if (trigger === 'update' && session?.name) {
                token.name = session.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = (token.id as string) ?? token.sub ?? ''
                session.user.role = (token.role as string) ?? 'admin'
            }
            return session
        },
    },
    providers: [], // providers are added in auth.ts
} satisfies NextAuthConfig
