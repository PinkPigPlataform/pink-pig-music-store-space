# SETUP.md — White-label Digital Marketplace

This is a white-label digital marketplace built on **Next.js 15**, **PayloadCMS**, **Stripe**, and **MongoDB**.  
Every aspect of branding (name, color, currency, categories) is configurable via environment variables — no code changes required.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm / npm | any |
| MongoDB Atlas | Free tier or above |
| Stripe account | Dev or Live keys |
| Resend account | For transactional email |
| (Optional) Google Cloud | For OAuth sign-in |

---

## 1. Clone & Install

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install
```

---

## 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in the values. The minimum required set to boot:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | ✅ | e.g. `http://localhost:3000` |
| `MONGODB_URL` | ✅ | MongoDB Atlas connection string |
| `PAYLOAD_SECRET` | ✅ | Any strong random string |
| `RESEND_API_KEY` | ✅ | From resend.com |
| `RESEND_FROM_EMAIL` | ✅ | Verified sender address |
| `STRIPE_SECRET_KEY` | ✅ | From Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | ✅ | From Stripe CLI or dashboard |
| `STRIPE_TRANSACTION_FEE_PRICE_ID` | ✅ | Stripe Price ID for $1 fee |
| `BLOB_READ_WRITE_TOKEN` | ✅ (produção) | Token do Vercel Blob — veja seção 5 |

### White-label / Tenant Variables (all optional — have sensible defaults)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_STORE_NAME` | `My Digital Store` | Store name in UI, emails, admin panel |
| `NEXT_PUBLIC_STORE_TAGLINE` | `High-quality digital products.` | Short tagline |
| `NEXT_PUBLIC_STORE_DESCRIPTION` | — | Used as default meta description |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `support@example.com` | Customer-facing email |
| `NEXT_PUBLIC_CURRENCY` | `USD` | ISO 4217 code (e.g. `EUR`, `BRL`) |
| `NEXT_PUBLIC_PRIMARY_COLOR` | `#ec4899` | Brand color injected as `--color-brand` |
| `NEXT_PUBLIC_LOGO_URL` | *(inline icon)* | Public URL to your logo image |
| `NEXT_PUBLIC_COPYRIGHT_OWNER` | *(store name)* | Footer copyright text |
| `NEXT_PUBLIC_COPYRIGHT_URL` | *(hidden)* | Footer "Built by" link — leave empty to hide |
| `NEXT_PUBLIC_TWITTER_HANDLE` | *(none)* | Twitter/X handle without `@` |
| `NEXT_PUBLIC_PRODUCT_CATEGORIES` | *(empty)* | JSON array — see below |

---

## 3. Product Categories

You have **two ways** to manage categories:

### Option A — Environment Variable (zero-config / static)

Set `NEXT_PUBLIC_PRODUCT_CATEGORIES` as a JSON array:

```env
NEXT_PUBLIC_PRODUCT_CATEGORIES='[
  {
    "label": "E-books",
    "value": "ebooks",
    "featured": [
      { "name": "New Arrivals", "href": "/products?category=ebooks&sort=desc", "imageSrc": "" },
      { "name": "Bestsellers", "href": "/products?category=ebooks", "imageSrc": "" }
    ]
  },
  {
    "label": "Templates",
    "value": "templates",
    "featured": [
      { "name": "Editor Picks", "href": "/products?category=templates", "imageSrc": "" }
    ]
  }
]'
```

### Option B — Admin Panel (dynamic)

1. Start the app
2. Navigate to `/admin`
3. Open **Categories** in the sidebar
4. Create categories with optional featured links
5. Restart the app (or add server-side fetch if you need zero-restart updates)

> **Note:** The `value` field must match the category slug used when creating products in Stripe.

---

## 4. First Run

```bash
# development
npm run dev

# Open the admin panel and create the first admin user
open http://localhost:3000/admin
```

---

## 5. Vercel Blob Storage

Os arquivos de upload (`media` e `product_files`) precisam de armazenamento persistente em produção — o filesystem da Vercel é efêmero. O adapter do PayloadCMS lida com isso automaticamente via **Vercel Blob**.

> **Em dev local:** sem o token, os uploads continuam em disco normalmente. O adapter só ativa quando `BLOB_READ_WRITE_TOKEN` está presente.

### Configurar o Vercel Blob

1. No dashboard da Vercel, acesse seu projeto
2. Clique em **Storage** na barra lateral
3. Clique em **Create Database** → selecione **Blob**
4. Dê um nome (ex: `minha-loja-files`) e confirme
5. Copie o `BLOB_READ_WRITE_TOKEN` gerado
6. Adicione como variável de ambiente no projeto Vercel (Settings → Environment Variables)
7. Redeploy

---

## 6. Deploy

### Vercel (recommended)

1. Push your repo to GitHub
2. Import in [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.local` in the Vercel project settings
4. Deploy

### Railway

1. Create a new project from your GitHub repo
2. Add a MongoDB Atlas service (or connect your Atlas URL)
3. Set environment variables in the Railway dashboard
4. Railway auto-detects Next.js — no extra config needed

---

## 7. Stripe Webhook

### Local Development

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` value to `STRIPE_WEBHOOK_SECRET`.

### Production

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

---

## 8. Google OAuth (optional)

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Add Authorized Redirect URIs:
   - Local: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 9. Currency Note

> ⚠️ **Important:** The currency is set on Stripe products at **creation time** and cannot be changed afterwards. Changing `NEXT_PUBLIC_CURRENCY` after products exist will only apply to **new** products. Existing Stripe products will retain their original currency.
