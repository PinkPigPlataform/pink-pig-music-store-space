import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'

export async function GET(
    _req: Request,
    { params }: { params: { slug: string } }
) {
    try {
        await connectMongo()

        const product = await ProductModel.findOne({ slug: params.slug, active: true })
            .populate('category', 'label value')
            .populate('images', 'url width height')
            .lean()

        if (!product) {
            return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
        }

        return NextResponse.json({ data: product })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
