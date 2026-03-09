import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    const product = await ProductModel.findById(params.id)
        .populate('category', 'label value')
        .populate('digitalFile', 'name url size')
        .lean()

    if (!product) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ data: product })
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        await connectMongo()

        const product = await ProductModel.findByIdAndUpdate(params.id, body, {
            new: true,
            runValidators: true,
        })

        if (!product) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
        return NextResponse.json({ data: product })
    } catch (err) {
        console.error(err)
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
    await ProductModel.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Deletado' })
}
