import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'

export async function GET() {
    const { user, response } = await requireUser()
    if (response) return response

    try {
        await connectMongo()
        const orders = await OrderModel.find({ user: user._id })
            .populate('products', 'name price slug')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({ data: orders })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
