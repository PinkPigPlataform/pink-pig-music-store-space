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
    // Default limit to 30, capped at a maximum of 100 to reduce payload size
    const rawLimit = Number(searchParams.get('limit') || 30)
    const limit = Math.min(Math.max(rawLimit, 1), 100)
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

    // Sanitize records to ensure no base64, buffer, or abnormally large fields are returned
    const safeFiles = files.map((file: any) => {
        let name = file.name || ''
        let originalName = file.originalName || ''
        let url = file.url || ''
        let blobKey = file.blobKey || ''

        if (name.length > 500 || name.includes(';base64,')) {
            name = name.substring(0, 100) + '... (truncated)'
        }
        if (originalName.length > 500 || originalName.includes(';base64,')) {
            originalName = originalName.substring(0, 100) + '... (truncated)'
        }
        // Base64 check and length limit
        if (url.includes(';base64,') || url.length > 2000) {
            url = '(omitted: large data/base64 detected)'
        }
        if (blobKey.includes(';base64,') || blobKey.length > 2000) {
            blobKey = '(omitted: large data/base64 detected)'
        }

        return {
            _id: file._id,
            name,
            originalName,
            url,
            blobKey,
            mime: file.mime || '',
            size: typeof file.size === 'number' ? file.size : 0,
            createdAt: file.createdAt,
        }
    })

    return NextResponse.json({
        data: safeFiles,
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
        const contentType = req.headers.get('content-type') || ''
        
        let name: string
        let originalName: string
        let url: string
        let blobKey: string
        let mime: string
        let size: number

        if (contentType.includes('application/json')) {
            const body = await req.json()
            name = body.name
            originalName = body.originalName || body.name
            url = body.url
            blobKey = body.blobKey
            mime = body.mime
            size = body.size

            if (!name || !url || !blobKey) {
                return NextResponse.json({ error: 'Dados incompletos para registrar o arquivo' }, { status: 400 })
            }
        } else {
            const formData = await req.formData()
            const file = formData.get('file') as File

            if (!file) {
                return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
            }

            const MAX_SIZE = 4.5 * 1024 * 1024 // 4.5MB
            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: `O arquivo excede o limite de 4.5MB (${(file.size / 1024 / 1024).toFixed(1)}MB). Por favor, use upload direto do cliente para arquivos maiores.` }, { status: 413 })
            }

            const blob = await put(`digital-files/${Date.now()}-${file.name}`, file, {
                access: 'public',
            })

            name = file.name
            originalName = file.name
            url = blob.url
            blobKey = blob.pathname
            mime = file.type
            size = file.size
        }

        await connectMongo()

        const digitalFile = await DigitalFileModel.create({
            name,
            originalName,
            url,
            blobKey,
            mime,
            size,
            uploadedBy: session?.user?.id,
        })

        return NextResponse.json({ data: digitalFile }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
