import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import DigitalFileModel from '@/lib/models/DigitalFile'
import { del } from '@vercel/blob'

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    const file = await DigitalFileModel.findById(params.id)
    if (!file) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    // Try to delete from Vercel Blob (best-effort — may already be gone)
    try {
        await del(file.url)
    } catch {
        // Blob may have been manually deleted already — ignore error
    }

    await DigitalFileModel.findByIdAndDelete(params.id)
    return NextResponse.json({ message: 'Deletado' })
}
