import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectMongo } from './mongodb'
import AdminModel from './models/Admin'

declare module 'next-auth' {
    interface User {
        role?: string
    }
    interface Session {
        user: {
            id: string
            role: string
            name?: string | null
            email?: string | null
        }
    }
}


export const { handlers: authHandlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
    pages: { signIn: '/admin/login' },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                await connectMongo()
                const admin = await AdminModel.findOne({
                    email: credentials.email,
                }).select('+password')

                if (!admin) return null

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    admin.password
                )
                if (!valid) return null

                return {
                    id: admin._id.toString(),
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id ?? token.sub
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
})
