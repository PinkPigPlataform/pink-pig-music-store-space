import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'
import UserModel from '@/lib/models/User'
import ProductModel from '@/lib/models/Product'

export async function GET() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    const [totalOrders, totalRevenue, totalUsers, totalProducts, recentOrders] =
        await Promise.all([
            OrderModel.countDocuments({ status: 'paid' }),
            OrderModel.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]),
            UserModel.countDocuments(),
            ProductModel.countDocuments({ active: true }),
            OrderModel.find({ status: 'paid' })
                .populate('user', 'name email')
                .populate('products', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ])

    return NextResponse.json({
        data: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total ?? 0,
            totalUsers,
            totalProducts,
            recentOrders,
        },
    })
}
