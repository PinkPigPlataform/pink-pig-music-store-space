import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'

export async function GET(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const status = searchParams.get('status')

    await connectMongo()

    const query: Record<string, unknown> = {}
    if (status) query.status = status

    const [orders, total] = await Promise.all([
        OrderModel.find(query)
            .populate('user', 'name email')
            .populate('products', 'name price')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        OrderModel.countDocuments(query),
    ])

    return NextResponse.json({
        data: orders,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
    })
}
