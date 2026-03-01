# White-label Digital Marketplace

A white-label digital marketplace built with **Next.js 15 App Router + Payload CMS v3**.  
Every aspect of branding — name, color, currency, and product categories — is configurable via environment variables with no code changes required.

📖 **[Full Setup Guide → SETUP.md](./SETUP.md)**

## Stack

- **Next.js 15** — App Router nativo, sem Express
- **Payload CMS v3** — headless CMS integrado nativamente ao Next.js
- **MongoDB Atlas** — banco de dados
- **Stripe** — pagamentos
- **Resend** — emails transacionais
- **tRPC v11** — API type-safe
- **Tailwind CSS** — design system

## Quick Start

```bash
npm install
cp .env.example .env.local   # preencha as variáveis obrigatórias
npm run dev
```

- **Loja**: http://localhost:3000
- **Admin CMS**: http://localhost:3000/admin

Para instruções completas de configuração, deploy e webhook do Stripe, veja [SETUP.md](./SETUP.md).

## White-label

Customize o marketplace sem alterar código:

```env
NEXT_PUBLIC_STORE_NAME="Acme Store"
NEXT_PUBLIC_CURRENCY="EUR"
NEXT_PUBLIC_PRIMARY_COLOR="#6366f1"
NEXT_PUBLIC_COPYRIGHT_OWNER="Acme Corp"
NEXT_PUBLIC_COPYRIGHT_URL="https://acme.com"
NEXT_PUBLIC_PRODUCT_CATEGORIES='[{"label":"Templates","value":"templates","featured":[]}]'
```

## Estrutura do projeto

```
src/
├── app/
│   ├── (payload)/           ← Payload CMS (admin + REST API)
│   ├── (store)/             ← Loja pública
│   │   ├── product/[productId]/
│   │   ├── products/
│   │   ├── cart/
│   │   └── thank-you/
│   └── api/
│       ├── trpc/[trpc]/     ← tRPC Route Handler
│       └── webhooks/stripe/ ← Webhook Stripe nativo
├── collections/             ← Coleções do Payload CMS
├── components/
├── config/
│   ├── tenant.ts            ← Fonte da verdade para configuração do tenant
│   └── index.ts             ← Re-exports PRODUCT_CATEGORIES
├── hooks/
├── lib/
└── payload.config.ts        ← Config Payload v3 nativa
```
