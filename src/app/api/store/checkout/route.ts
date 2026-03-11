import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/api'
import { connectMongo } from '@/lib/mongodb'
import { stripe } from '@/lib/stripe'
import ProductModel from '@/lib/models/Product'
import OrderModel from '@/lib/models/Order'

export async function POST(req: Request) {
    const { user, response } = await requireUser()
    if (response) return response

    try {
        const { productIds } = await req.json()

        if (!productIds?.length) {
            return NextResponse.json({ error: 'Nenhum produto selecionado' }, { status: 400 })
        }

        await connectMongo()

        const products = await ProductModel.find({
            _id: { $in: productIds },
            active: true,
        }).lean()

        if (!products.length) {
            return NextResponse.json({ error: 'Produtos não encontrados' }, { status: 400 })
        }

        // Check for mixed locales in the cart
        const locales = new Set(products.map((p) => p.locale || 'pt'))
        if (locales.size > 1) {
            return NextResponse.json(
                { error: 'Não é possível misturar produtos de idiomas diferentes no mesmo pedido' },
                { status: 400 }
            )
        }

        const locale = Array.from(locales)[0]
        const currency = locale === 'en' ? 'usd' : 'brl'


        const total = products.reduce((sum, p) => sum + p.price, 0)

        const order = await OrderModel.create({
            user: user._id,
            products: products.map((p) => p._id),
            total: Math.round(total * 100),
            currency: currency.toUpperCase(),
            status: 'pending',
        })

        const line_items = products.map((product) => {
            const prodName = product.name;
            return {
                price_data: {
                    currency: currency,
                    product_data: { name: prodName || 'Produto' },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: 1,
            };
        })

        const base = process.env.NEXT_PUBLIC_STORE_URL || ''

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items,
            success_url: `${base}/thank-you?orderId=${order._id}`,
            cancel_url: `${base}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId: user._id.toString(),
            },
        })

        await OrderModel.findByIdAndUpdate(order._id, {
            stripeSessionId: session.id,
        })

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
