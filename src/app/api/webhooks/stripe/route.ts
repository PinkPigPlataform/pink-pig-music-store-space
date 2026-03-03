import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'
import UserModel from '@/lib/models/User'
import { sendReceiptEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')!

    let event
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const { orderId } = session.metadata!

        await connectMongo()

        const order = await OrderModel.findByIdAndUpdate(
            orderId,
            {
                status: 'paid',
                stripePaymentIntentId: session.payment_intent as string,
            },
            { new: true }
        ).populate('products', 'name price')

        if (order && !order.receiptEmailSent) {
            const user = await UserModel.findById(order.user)
            if (user) {
                try {
                    await sendReceiptEmail(user.email, {
                        id: order._id.toString(),
                        products: (order.products as Array<{ name: string; price: number }>).map((p) => ({
                            name: p.name,
                            price: Math.round(p.price * 100),
                        })),
                        total: order.total,
                    })
                    await OrderModel.findByIdAndUpdate(orderId, { receiptEmailSent: true })
                } catch (emailErr) {
                    console.error('Receipt email failed:', emailErr)
                }
            }
        }
    }

    return NextResponse.json({ received: true })
}
