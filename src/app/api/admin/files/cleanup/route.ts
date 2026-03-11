import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import DigitalFileModel from '@/lib/models/DigitalFile'

export async function POST() {
    const { response } = await requireAdmin()
    if (response) return response

    await connectMongo()
    const files = await DigitalFileModel.find().lean()

    const results = await Promise.allSettled(
        files.map(async (f) => {
            try {
                const res = await fetch(f.url, { method: 'HEAD' })
                if (res.status === 404 || res.status === 400) {
                    await DigitalFileModel.findByIdAndDelete(f._id)
                    return { removed: true, name: f.name }
                }
                return { removed: false }
            } catch {
                // Network error — treat as broken
                await DigitalFileModel.findByIdAndDelete(f._id)
                return { removed: true, name: f.name }
            }
        })
    )

    const removed = results
        .filter((r) => r.status === 'fulfilled' && r.value.removed)
        .map((r) => (r as PromiseFulfilledResult<{ name: string }>).value.name)

    return NextResponse.json({ removed, count: removed.length })
}
