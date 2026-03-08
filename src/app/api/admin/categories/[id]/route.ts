import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'
import { z } from 'zod'

const updateSchema = z.object({
    label: z.string().min(1).optional(),
    description: z.string().optional(),
    active: z.boolean().optional(),
    parent: z.string().nullable().optional(),
    order: z.number().optional(),
})

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const data = updateSchema.parse(body)

        await connectMongo()

        // Prevent circular refs and depth > 2
        if (data.parent) {
            if (data.parent === params.id) {
                return NextResponse.json({ error: 'Uma categoria não pode ser pai de si mesma' }, { status: 400 })
            }
            const parentCat = await CategoryModel.findById(data.parent)
            if (!parentCat) return NextResponse.json({ error: 'Categoria pai não encontrada' }, { status: 404 })
            if (parentCat.parent) {
                return NextResponse.json({ error: 'Máximo 2 níveis permitidos' }, { status: 400 })
            }
        }

        const cat = await CategoryModel.findByIdAndUpdate(
            params.id,
            { ...data, parent: data.parent ?? null },
            { new: true }
        ).populate('parent', 'label value')

        if (!cat) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
        return NextResponse.json({ data: cat })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    // Move children to root before deleting parent
    await CategoryModel.updateMany({ parent: params.id }, { parent: null })
    await CategoryModel.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Deletado' })
}
