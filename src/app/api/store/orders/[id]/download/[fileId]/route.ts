import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'
import DigitalFileModel from '@/lib/models/DigitalFile'

export async function GET(
    _req: Request,
    { params }: { params: { id: string; fileId: string } }
) {
    const { user, response } = await requireUser()
    if (response) return response

    try {
        await connectMongo()

        const order = await OrderModel.findOne({
            _id: params.id,
            user: user._id,
            status: 'paid',
        }).populate({ path: 'products', populate: { path: 'digitalFile' } })

        if (!order) {
            return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
        }

        const hasFile = (order.products as Array<{ digitalFile?: { _id: { toString(): string } } }>).some(
            (p) => p.digitalFile?._id?.toString() === params.fileId
        )

        if (!hasFile) {
            return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
        }

        const file = await DigitalFileModel.findById(params.fileId)
        if (!file) {
            return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
        }

        return NextResponse.redirect(file.url)
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
