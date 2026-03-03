import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectMongo } from './mongodb'
import AdminModel from './models/Admin'
import { authConfig } from './auth.config'

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
    ...authConfig,
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
})
