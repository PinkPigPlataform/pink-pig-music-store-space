import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { getPayloadClient } from '@/lib/payload'
import type { Product } from '@/payload-types'
import { Resend } from 'resend'
import { ReceiptEmailHtml } from '@/components/emails/ReceiptEmail'
import { tenantConfig } from '@/config/tenant'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 400 }
    )
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (!session?.metadata?.userId || !session?.metadata?.orderId) {
    return NextResponse.json(
      { error: 'Missing metadata' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const payload = await getPayloadClient()

    const { docs: users } = await payload.find({
      collection: 'users',
      where: { id: { equals: session.metadata.userId } },
    })

    const [user] = users
    if (!user) return NextResponse.json({ error: 'No such user' }, { status: 404 })

    const { docs: orders } = await payload.find({
      collection: 'orders',
      depth: 2,
      where: { id: { equals: session.metadata.orderId } },
    })

    const [order] = orders
    if (!order) return NextResponse.json({ error: 'No such order' }, { status: 404 })

    await payload.update({
      collection: 'orders',
      data: { _isPaid: true },
      where: { id: { equals: session.metadata.orderId } },
    })

    try {
      await resend.emails.send({
        from: `${tenantConfig.storeName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
        to: [user.email],
        subject: 'Thanks for your order! This is your receipt.',
        html: await ReceiptEmailHtml({
          date: new Date(),
          email: user.email,
          orderId: session.metadata.orderId,
          products: order.products as Product[],
        }),
      })
    } catch (emailErr) {
      console.error('Failed to send receipt email:', emailErr)
    }
  }

  return NextResponse.json({ received: true })
}
