import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'
import { comparePassword, generateUserToken } from '@/lib/user-auth'

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 })
        }

        await connectMongo()
        const user = await UserModel.findOne({ email }).select('+password')

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
        }

        const valid = await comparePassword(password, user.password)
        if (!valid) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
        }

        if (!user._verified) {
            return NextResponse.json({ error: 'Confirme seu email antes de entrar' }, { status: 403 })
        }

        const token = generateUserToken(user._id.toString(), user.email)

        const response = NextResponse.json({
            user: { id: user._id, name: user.name, email: user.email },
        })
        response.cookies.set('user-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        })

        return response
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
