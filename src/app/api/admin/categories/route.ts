import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
    label: z.string().min(1),
    description: z.string().optional(),
    active: z.boolean().optional(),
    parent: z.string().nullable().optional(),
    order: z.number().optional(),
})

export async function GET() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    // Fetch all categories with parent populated
    const categories = await CategoryModel.find()
        .populate('parent', 'label value')
        .sort({ order: 1, label: 1 })
        .lean()

    return NextResponse.json({ data: categories })
}

export async function POST(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const { label, description, active, parent, order } = schema.parse(body)
        const value = generateSlug(label)

        await connectMongo()

        const existing = await CategoryModel.findOne({ value })
        if (existing) {
            return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
        }

        // Prevent depth > 2: parent must be a root category
        if (parent) {
            const parentCat = await CategoryModel.findById(parent)
            if (!parentCat) {
                return NextResponse.json({ error: 'Categoria pai não encontrada' }, { status: 404 })
            }
            if (parentCat.parent) {
                return NextResponse.json({ error: 'Subcategorias não podem ter filhos (máx. 2 níveis)' }, { status: 400 })
            }
        }

        const category = await CategoryModel.create({
            label, value, description, active,
            parent: parent || null,
            order: order ?? 0,
        })

        return NextResponse.json({ data: category }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
