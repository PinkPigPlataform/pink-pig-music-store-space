import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'
import { Types } from 'mongoose'

const schema = z.object({
    label: z.string().min(1),
    locale: z.enum(['pt', 'en']).default('pt'),
    description: z.string().optional(),
    active: z.boolean().optional(),
    parent: z.string().nullable().optional(),
    order: z.number().optional(),
})

export async function GET() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    // Fetch flat list — NO populate to avoid schema cache issues
    const raw = await CategoryModel.find().sort({ order: 1, label: 1 }).lean()

    // Manual parent join in memory
    const idMap = new Map(raw.map(c => [c._id.toString(), { _id: c._id, label: c.label, value: c.value }]))

    const categories = raw.map(c => ({
        ...c,
        parent: c.parent ? (idMap.get(c.parent.toString()) ?? null) : null,
    }))

    return NextResponse.json({ data: categories })
}

export async function POST(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const { label, locale, description, active, parent, order } = schema.parse(body)
        const value = generateSlug(label)

        await connectMongo()

        const existing = await CategoryModel.findOne({ value })
        if (existing) {
            return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
        }

        // Prevent depth > 2
        if (parent) {
            const parentCat = await CategoryModel.findById(parent).lean()
            if (!parentCat) return NextResponse.json({ error: 'Categoria pai não encontrada' }, { status: 404 })
            if (parentCat.parent) return NextResponse.json({ error: 'Máximo 2 níveis permitidos' }, { status: 400 })
        }

        const parentId = parent ? new Types.ObjectId(parent) : null
        const category = await CategoryModel.create({ label, locale, value, description, active, parent: parentId, order: order ?? 0 })

        return NextResponse.json({ data: { ...category.toObject(), parent: null } }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        console.error('[categories POST]', err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
