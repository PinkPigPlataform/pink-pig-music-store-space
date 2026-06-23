import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import DigitalFileModel from '@/lib/models/DigitalFile'

export async function GET(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    await connectMongo()

    const { searchParams } = new URL(req.url)
    let page = parseInt(searchParams.get('page') || '1', 10)
    let limit = parseInt(searchParams.get('limit') || '100', 10)

    if (isNaN(page) || page < 1) page = 1
    if (isNaN(limit) || limit < 1) limit = 100
    if (limit > 200) limit = 200

    const skip = (page - 1) * limit

    const [files, total] = await Promise.all([
        DigitalFileModel.find()
            .select('_id name originalName url blobKey mime size createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        DigitalFileModel.countDocuments()
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
        data: files,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
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
