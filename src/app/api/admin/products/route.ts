import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import ProductModel from '@/lib/models/Product'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const schema = z.object({
    name: z.string().min(1),
    locale: z.enum(['pt', 'en']).default('pt'),
    description: z.string().optional(),
    price: z.number().min(0),
    category: z.string(),
    images: z.array(z.string()).optional(),
    digitalFile: z.string().optional(),
    active: z.boolean().optional(),
    featured: z.boolean().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    demoUrl: z.string().optional(),
    videoUrl: z.string().optional(),
})

export async function GET(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const search = searchParams.get('search') || ''

    await connectMongo()

    const query: Record<string, unknown> = {}
    if (search) query.name = { $regex: search, $options: 'i' }

    const [products, total] = await Promise.all([
        ProductModel.find(query)
            .populate('category', 'label value')
            .populate('digitalFile', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        ProductModel.countDocuments(query),
    ])

    return NextResponse.json({
        data: products,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
    })
}

export async function POST(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    try {
        const body = await req.json()
        const data = schema.parse(body)

        await connectMongo()

        const baseName = data.name || 'product'
        let slug = generateSlug(baseName)
        const existing = await ProductModel.findOne({ slug })
        if (existing) {
            slug = `${slug}-${Date.now()}`
        }

        const product = await ProductModel.create({
            ...data,
            slug,
        })

        return NextResponse.json({ data: product }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
        }
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
