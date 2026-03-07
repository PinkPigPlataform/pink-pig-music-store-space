import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: Request) {
    const { response } = await requireAdmin()
    if (response) return response

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: 'pink-pig/products',
                        resource_type: 'image',
                        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                    },
                    (error, result) => {
                        if (error || !result) reject(error)
                        else resolve(result as { secure_url: string; public_id: string })
                    }
                )
                .end(buffer)
        })

        return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro no upload' }, { status: 500 })
    }
}
