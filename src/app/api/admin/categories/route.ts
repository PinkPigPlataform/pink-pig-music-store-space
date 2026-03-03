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
})

export async function GET() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    const categories = await CategoryModel.find().sort({ label: 1 }).lean()
    return NextResponse.json({ data: categories })
}

export async function POST(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const { label, description, active } = schema.parse(body)
        const value = generateSlug(label)

        await connectMongo()

        const existing = await CategoryModel.findOne({ value })
        if (existing) {
            return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 })
        }

        const category = await CategoryModel.create({ label, value, description, active })
        return NextResponse.json({ data: category }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
