import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import UserModel from '@/lib/models/User'

export async function GET(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'))
    const search = searchParams.get('search') || ''

    await connectMongo()

    const query: Record<string, unknown> = {}
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ]
    }

    const [users, total] = await Promise.all([
        UserModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        UserModel.countDocuments(query),
    ])

    return NextResponse.json({
        data: users,
        meta: { page, limit, total, pages: Math.ceil(total / limit) },
    })
}
