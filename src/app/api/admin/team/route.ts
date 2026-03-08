import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import AdminModel from '@/lib/models/Admin'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['admin', 'support']),
})

export async function GET() {
    const { response } = await requireRole('super_admin')
    if (response) return response

    await connectMongo()
    const admins = await AdminModel.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .lean()

    return NextResponse.json({ data: admins })
}

export async function POST(req: Request) {
    const { response } = await requireRole('super_admin')
    if (response) return response

    try {
        const body = await req.json()
        const data = createSchema.parse(body)

        await connectMongo()

        const exists = await AdminModel.findOne({ email: data.email })
        if (exists) {
            return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
        }

        const hashed = await bcrypt.hash(data.password, 12)
        const admin = await AdminModel.create({
            name: data.name,
            email: data.email,
            password: hashed,
            role: data.role, // never super_admin from UI
            isActive: true,
        })

        return NextResponse.json({
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive,
                createdAt: admin.createdAt,
            },
        }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
