import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import DigitalFileModel from '@/lib/models/DigitalFile'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    const { searchParams } = new URL(req.url)
    const rawLimit = Number(searchParams.get('limit') || 100)
    const limit = Math.min(Math.max(rawLimit, 1), 200)
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const skip = (page - 1) * limit

    const [files, total] = await Promise.all([
        DigitalFileModel.find()
            .select('_id name originalName url blobKey mime size createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        DigitalFileModel.countDocuments(),
    ])

    return NextResponse.json({
        data: files,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
}

export async function POST(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
        }

        const blob = await put(`digital-files/${Date.now()}-${file.name}`, file, {
            access: 'public',
        })

        await connectMongo()

        const digitalFile = await DigitalFileModel.create({
            name: file.name,
            originalName: file.name,
            url: blob.url,
            blobKey: blob.pathname,
            mime: file.type,
            size: file.size,
            uploadedBy: session?.user?.id,
        })

        return NextResponse.json({ data: digitalFile }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
