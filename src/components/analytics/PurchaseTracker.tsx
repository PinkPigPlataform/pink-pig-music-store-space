'use client'

import { useEffect } from 'react'

type Props = {
  orderId?: string
  /** Valor total do pedido. Sem isso o Meta não consegue otimizar por ROAS. */
  value?: number
  currency?: string
}

export function PurchaseTracker({ orderId, value, currency = 'BRL' }: Props) {
  useEffect(() => {
    if (!orderId) return
    if (typeof window === 'undefined' || !window.fbq) return

    // Evita disparo duplicado se o usuário recarregar a página de obrigado.
    const key = `pp_purchase_${orderId}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage bloqueado — segue e dispara mesmo assim
    }

    window.fbq(
      'track',
      'Purchase',
      {
        currency,
        value: value ?? 0,
        content_type: 'product',
      },
      // eventID permite deduplicar caso você adicione a Conversions API depois
      { eventID: orderId },
    )
  }, [orderId, value, currency])

  return null
}
