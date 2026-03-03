import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    const [revenueByMonth, ordersByMonth] = await Promise.all([
        OrderModel.aggregate([
            {
                $match: {
                    status: 'paid',
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$total' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
        OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        status: '$status',
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]),
    ])

    // Build last 12 months scaffold
    const months: Record<string, { month: string; revenue: number; orders: number; pending: number }> = {}
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`
        months[key] = {
            month: monthNames[d.getMonth()],
            revenue: 0,
            orders: 0,
            pending: 0,
        }
    }

    for (const r of revenueByMonth) {
        const key = `${r._id.year}-${r._id.month}`
        if (months[key]) {
            months[key].revenue = Math.round(r.revenue / 100)
            months[key].orders = r.count
        }
    }

    for (const o of ordersByMonth) {
        const key = `${o._id.year}-${o._id.month}`
        if (months[key] && o._id.status === 'pending') {
            months[key].pending = o.count
        }
    }

    return NextResponse.json({ data: Object.values(months) })
}
