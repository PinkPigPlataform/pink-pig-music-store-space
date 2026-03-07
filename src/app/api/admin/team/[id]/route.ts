import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import AdminModel from '@/lib/models/Admin'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateSchema = z.object({
    name: z.string().min(2).optional(),
    role: z.enum(['admin', 'support']).optional(),
    isActive: z.boolean().optional(),
    newPassword: z.string().min(8).optional(),
})

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { session, response } = await requireRole('super_admin')
    if (response) return response

    try {
        const body = await req.json()
        const data = updateSchema.parse(body)

        await connectMongo()
        const target = await AdminModel.findById(params.id)
        if (!target) return NextResponse.json({ error: 'Admin não encontrado' }, { status: 404 })

        // super_admin cannot demote or deactivate themselves
        if (target.email === session!.user!.email) {
            return NextResponse.json({ error: 'Não pode modificar sua própria conta aqui' }, { status: 400 })
        }

        // Cannot promote to super_admin via UI
        if ((data as { role?: string }).role === 'super_admin') {
            return NextResponse.json({ error: 'Operação não permitida' }, { status: 403 })
        }

        if (data.name !== undefined) target.name = data.name
        if (data.role !== undefined) target.role = data.role
        if (data.isActive !== undefined) target.isActive = data.isActive
        if (data.newPassword) target.password = await bcrypt.hash(data.newPassword, 12)

        await target.save()

        return NextResponse.json({
            data: {
                _id: target._id,
                name: target.name,
                email: target.email,
                role: target.role,
                isActive: target.isActive,
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

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { session, response } = await requireRole('super_admin')
    if (response) return response

    await connectMongo()
    const target = await AdminModel.findById(params.id)
    if (!target) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    if (target.email === session!.user!.email) {
        return NextResponse.json({ error: 'Não pode deletar sua própria conta' }, { status: 400 })
    }

    await AdminModel.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Admin removido' })
}
