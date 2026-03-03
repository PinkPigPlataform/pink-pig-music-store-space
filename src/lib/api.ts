import { NextResponse } from 'next/server'
import { auth } from './auth'
import { verifyUserToken } from './user-auth'
import { cookies } from 'next/headers'
import { connectMongo } from './mongodb'
import UserModel from './models/User'

export async function requireAdmin() {
    const session = await auth()
    if (!session?.user) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
        }
    }
    return { session, response: null }
}

export async function requireUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('user-token')?.value

    if (!token) {
        return {
            user: null,
            response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
        }
    }

    const payload = verifyUserToken(token)
    if (!payload) {
        return {
            user: null,
            response: NextResponse.json({ error: 'Token inválido' }, { status: 401 }),
        }
    }

    await connectMongo()
    const user = await UserModel.findById(payload.id)
    if (!user) {
        return {
            user: null,
            response: NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            ),
        }
    }

    return { user, response: null }
}
