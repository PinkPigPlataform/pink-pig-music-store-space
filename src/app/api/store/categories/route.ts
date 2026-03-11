import { NextResponse } from 'next/server'
import { connectMongo } from '@/lib/mongodb'
import CategoryModel from '@/lib/models/Category'

export async function GET(request: Request) {
    try {
        await connectMongo()
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'pt'
        const categories = await CategoryModel.find({ active: true, locale })
            .sort({ label: 1 })
            .lean()
        return NextResponse.json({ data: categories })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
