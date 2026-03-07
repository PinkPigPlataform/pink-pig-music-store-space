import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import AdminModel from '@/lib/models/Admin'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: Request) {
    const { session, response } = await requireAdmin()
    if (response) return response

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) return NextResponse.json({ error: 'Arquivo obrigatório' }, { status: 400 })

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: 'pink-pig/avatars',
                        resource_type: 'image',
                        transformation: [
                            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                            { quality: 'auto', fetch_format: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error || !result) reject(error)
                        else resolve(result as { secure_url: string })
                    }
                )
                .end(buffer)
        })

        await connectMongo()
        await AdminModel.findOneAndUpdate(
            { email: session!.user!.email },
            { avatar: result.secure_url }
        )

        return NextResponse.json({ url: result.secure_url })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro no upload' }, { status: 500 })
    }
}
