import nodemailer from 'nodemailer'
import { formatPrice } from '@/lib/utils'

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
        secure: process.env.EMAIL_SMTP_PORT === '465',
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        },
    })
}

const STORE = process.env.NEXT_PUBLIC_STORE_NAME || 'Pink Pig Store'
const FROM = process.env.EMAIL_FROM || 'contato@pinkpigstore.com'

// Link relativo nao funciona em e-mail. Se a variavel nao estiver setada,
// cai no dominio de producao em vez de gerar URL quebrada.
const BASE = (process.env.NEXT_PUBLIC_STORE_URL || 'https://www.pinkpigstore.com')
    .replace(/\/+$/, '')

const BTN =
    'display:inline-block;background:#ec4899;color:#ffffff;padding:12px 24px;' +
    'border-radius:6px;text-decoration:none;font-weight:600'
const WRAP = 'font-family:sans-serif;max-width:480px;margin:0 auto'

// ── Verificacao de email ────────────────────────────────────────────
export async function sendVerificationEmail(
    to: string,
    token: string
): Promise<void> {
    const url = `${BASE}/verify-email?token=${token}`
    await createTransporter().sendMail({
        from: `${STORE} <${FROM}>`,
        to,
        subject: `Verifique seu email — ${STORE}`,
        html: `
      <div style="${WRAP}">
        <h2>Verifique seu email</h2>
        <p>Clique no botão abaixo para confirmar sua conta em ${STORE}.</p>
        <a href="${url}" style="${BTN}">Verificar email</a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">
          Se você não criou uma conta, ignore este email.
        </p>
      </div>
    `,
    })
}

// ── Recibo de compra ────────────────────────────────────────────────
export async function sendReceiptEmail(
    to: string,
    order: {
        id: string
        products: { name: string; price: number }[]
        total: number
        /** 'BRL' ou 'USD'. Se ausente, assume BRL. */
        currency?: string
    }
): Promise<void> {
    const currency = (order.currency || 'BRL').toUpperCase()
    const isEn = currency === 'USD'
    const money = (cents: number) => formatPrice(cents, currency)

    const t = isEn
        ? {
              subject: `Receipt for order #${order.id.slice(-6).toUpperCase()} — ${STORE}`,
              heading: 'Thank you for your purchase!',
              intro: 'Your order is confirmed. Your files are available below.',
              total: 'Total',
              cta: 'View order and download files',
          }
        : {
              subject: `Recibo do seu pedido #${order.id.slice(-6).toUpperCase()} — ${STORE}`,
              heading: 'Obrigado pela sua compra!',
              intro: 'Seu pedido foi confirmado. Acesse seus arquivos abaixo.',
              total: 'Total',
              cta: 'Ver pedido e baixar arquivos',
          }

    const productRows = order.products
        .map(
            (p) =>
                `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${p.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">
            ${money(p.price)}
          </td>
        </tr>`
        )
        .join('')

    await createTransporter().sendMail({
        from: `${STORE} <${FROM}>`,
        to,
        subject: t.subject,
        html: `
      <div style="${WRAP}">
        <h2>${t.heading}</h2>
        <p>${t.intro}</p>
        <table style="width:100%;border-collapse:collapse">
          ${productRows}
          <tr>
            <td style="padding:12px 0;font-weight:700">${t.total}</td>
            <td style="padding:12px 0;font-weight:700;text-align:right">
              ${money(order.total)}
            </td>
          </tr>
        </table>
        <a href="${BASE}/account/orders/${order.id}" style="margin-top:16px;${BTN}">
          ${t.cta}
        </a>
      </div>
    `,
    })
}

// ── Redefinicao de senha ────────────────────────────────────────────
export async function sendPasswordResetEmail(
    to: string,
    token: string
): Promise<void> {
    const url = `${BASE}/reset-password?token=${token}`
    await createTransporter().sendMail({
        from: `${STORE} <${FROM}>`,
        to,
        subject: `Redefinir senha — ${STORE}`,
        html: `
      <div style="${WRAP}">
        <h2>Redefinir senha</h2>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</p>
        <a href="${url}" style="${BTN}">Redefinir senha</a>
      </div>
    `,
    })
}
