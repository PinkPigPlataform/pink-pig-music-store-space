import 'server-only'

import { cache } from 'react'
import { stripe } from './stripe'

const DEFAULT_TRANSACTION_FEE_CENTS = 0

export const getTransactionFeeCents = cache(async () => {
  const feePriceId = process.env.STRIPE_TRANSACTION_FEE_PRICE_ID

  if (!feePriceId) {
    return DEFAULT_TRANSACTION_FEE_CENTS
  }

  const price = await stripe.prices.retrieve(feePriceId)

  if (typeof price.unit_amount !== 'number') {
    throw new Error('STRIPE_TRANSACTION_FEE_PRICE_ID must reference a fixed-amount price')
  }

  return price.unit_amount
})
