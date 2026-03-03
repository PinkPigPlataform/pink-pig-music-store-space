import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    const body = await req.json()
    await connectMongo()
    const cat = await CategoryModel.findByIdAndUpdate(params.id, body, { new: true })
    if (!cat) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ data: cat })
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    await CategoryModel.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Deletado' })
}
