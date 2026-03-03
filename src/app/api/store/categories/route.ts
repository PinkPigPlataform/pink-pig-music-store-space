import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'

export async function GET() {
    try {
        await connectMongo()
        const categories = await CategoryModel.find({ active: true })
            .sort({ label: 1 })
            .lean()
        return NextResponse.json({ data: categories })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
