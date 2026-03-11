import nodemailer from 'nodemailer'

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

const FROM = process.env.EMAIL_FROM ?? 'noreply@example.com'
const STORE = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Minha Loja'
const BASE = process.env.NEXT_PUBLIC_STORE_URL ?? ''

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
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Verifique seu email</h2>
        <p>Clique no botão abaixo para confirmar sua conta em ${STORE}.</p>
        <a href="${url}" style="display:inline-block;background:#ec4899;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Verificar email
        </a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">
          Se você não criou uma conta, ignore este email.
        </p>
      </div>
    `,
    })
}

export async function sendReceiptEmail(
    to: string,
    order: {
        id: string
        products: { name: string; price: number }[]
        total: number
    }
): Promise<void> {
    const productRows = order.products
        .map(
            (p) =>
                `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6">${p.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right">
            R$ ${(p.price / 100).toFixed(2).replace('.', ',')}
          </td>
        </tr>`
        )
        .join('')

    await createTransporter().sendMail({
        from: `${STORE} <${FROM}>`,
        to,
        subject: `Recibo do seu pedido #${order.id.slice(-6).toUpperCase()} — ${STORE}`,
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Obrigado pela sua compra! 🎉</h2>
        <p>Seu pedido foi confirmado. Acesse seus arquivos abaixo.</p>
        <table style="width:100%;border-collapse:collapse">
          ${productRows}
          <tr>
            <td style="padding:12px 0;font-weight:700">Total</td>
            <td style="padding:12px 0;font-weight:700;text-align:right">
              R$ ${(order.total / 100).toFixed(2).replace('.', ',')}
            </td>
          </tr>
        </table>
        <a href="${BASE}/account/orders"
           style="display:inline-block;margin-top:16px;background:#ec4899;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Ver pedido e baixar arquivos
        </a>
      </div>
    `,
    })
}

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
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Redefinir senha</h2>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</p>
        <a href="${url}" style="display:inline-block;background:#ec4899;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Redefinir senha
        </a>
      </div>
    `,
    })
}
