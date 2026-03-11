import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import CategoryModel from '@/lib/models/Category'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const category = searchParams.get('category')
        const featured = searchParams.get('featured')
        const locale = searchParams.get('locale') || 'pt'
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
        const limit = Math.min(50, parseInt(searchParams.get('limit') || '12'))

        await connectMongo()

        const query: Record<string, unknown> = { active: true, locale }

        if (featured === '1') query.featured = true

        if (category) {
            const cat = await CategoryModel.findOne({ value: category, locale })
            if (cat) query.category = cat._id
        }

        const [products, total] = await Promise.all([
            ProductModel.find(query)
                .populate('category', 'label value')
                .populate('images', 'url')
                .sort({ featured: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments(query),
        ])

        return NextResponse.json({
            data: products,
            meta: { page, limit, total, pages: Math.ceil(total / limit) },
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
