import { NextResponse } from 'next/server'
import { auth } from './auth'
import { verifyUserToken } from './user-auth'
import { cookies } from 'next/headers'
import { connectMongo } from './mongodb'
import UserModel from './models/User'
import AdminModel from './models/Admin'

export type AdminRole = 'support' | 'admin' | 'super_admin'
export const ROLE_RANK: Record<AdminRole, number> = { support: 0, admin: 1, super_admin: 2 }

/** Basic auth check — any authenticated admin */
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

/** Auth check + role gate + active status check */
export async function requireRole(minRole: AdminRole) {
    const session = await auth()
    if (!session?.user) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }),
        }
    }

    const role = ((session.user as { role?: string }).role ?? 'support') as AdminRole
    if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Sem permissão' }, { status: 403 }),
        }
    }

    await connectMongo()
    const admin = await AdminModel.findOne({ email: session.user.email })
        .select('isActive')
        .lean() as { isActive?: boolean } | null

    if (!admin || admin.isActive === false) {
        return {
            session: null,
            response: NextResponse.json({ error: 'Conta desativada' }, { status: 403 }),
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
