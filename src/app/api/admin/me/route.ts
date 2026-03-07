import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import AdminModel from '@/lib/models/Admin'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
})

export async function GET() {
    const { session, response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    const admin = await AdminModel.findOne({ email: session!.user!.email }).select('-password').lean()
    if (!admin) return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })

    return NextResponse.json({ data: admin })
}

export async function PUT(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const data = updateSchema.parse(body)

        await connectMongo()
        const admin = await AdminModel.findOne({ email: session!.user!.email }).select('+password')
        if (!admin) return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })

        // Password change flow
        if (data.newPassword) {
            if (!data.currentPassword) {
                return NextResponse.json({ error: 'Senha atual obrigatória' }, { status: 400 })
            }
            const valid = await bcrypt.compare(data.currentPassword, admin.password)
            if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
            admin.password = await bcrypt.hash(data.newPassword, 12)
        }

        if (data.name) admin.name = data.name
        if (data.email) admin.email = data.email

        await admin.save()

        return NextResponse.json({
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                avatar: admin.avatar,
            },
        })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
