# Store Rebuild — Next.js 14 + Mongoose + Stripe

## Goal
Substituir PayloadCMS por arquitetura custom leve: Next.js 14 App Router,
Mongoose, NextAuth v5 (admin), JWT manual (compradores), Stripe, Cloudinary,
Vercel Blob, Nodemailer.

## Fases

### Fase 1 — Limpeza e Setup ✅
- [ ] 1.1 Apagar `src/` inteiro, `next.config.ts`, `.npmrc`
- [ ] 1.2 Reescrever `package.json` com nova stack (next@14, mongoose, next-auth@beta…)
- [ ] 1.3 `npm install`
- [ ] 1.4 Criar `tsconfig.json` e `next.config.ts` clean
- [ ] 1.5 Configurar Tailwind v3 + shadcn/ui
- [ ] 1.6 Criar `.env.example` atualizado

### Fase 2 — Lib / Foundation ✅
- [ ] 2.1 `lib/mongodb.ts` — singleton Mongoose
- [ ] 2.2 `lib/models/` — Admin, User, Category, Product, DigitalFile, Order, UploadFile
- [ ] 2.3 `lib/auth.ts` — NextAuth (credentials → Admin)
- [ ] 2.4 `lib/user-auth.ts` — JWT manual (compradores)
- [ ] 2.5 `lib/api.ts` — requireAdmin / requireUser helpers
- [ ] 2.6 `lib/email.ts` — Nodemailer helpers
- [ ] 2.7 `lib/stripe.ts` + `lib/cloudinary.ts` + `lib/utils.ts`
- [ ] 2.8 `middleware.ts` — protect /admin e /account

### Fase 3 — API Routes ✅
- [ ] 3.1 NextAuth handler: `api/auth/[...nextauth]`
- [ ] 3.2 Store auth: register, login, logout, verify, google OAuth
- [ ] 3.3 Store public: products, categories
- [ ] 3.4 Store private: checkout, orders, download
- [ ] 3.5 Admin: products, categories, orders, customers, files, dashboard
- [ ] 3.6 Webhook: stripe

### Fase 4 — Admin UI ✅
- [ ] 4.1 `app/admin/layout.tsx` + `components/admin/sidebar.tsx` + `header.tsx`
- [ ] 4.2 `app/admin/login/page.tsx`
- [ ] 4.3 `app/admin/page.tsx` (dashboard com métricas)
- [ ] 4.4 `app/admin/products/` — CRUD completo
- [ ] 4.5 `app/admin/categories/` — CRUD
- [ ] 4.6 `app/admin/orders/` — listagem + detalhe
- [ ] 4.7 `app/admin/files/` — upload Vercel Blob
- [ ] 4.8 `app/admin/customers/` — listagem
- [ ] 4.9 `app/admin/settings/page.tsx`
- [ ] 4.10 `components/admin/data-table.tsx`

### Fase 5 — Store Frontend ✅
- [ ] 5.1 `app/(store)/layout.tsx` + `components/store/navbar.tsx` + `footer.tsx`
- [ ] 5.2 `app/(store)/page.tsx` — home com produtos em destaque
- [ ] 5.3 `app/(store)/products/` — listagem + filtro
- [ ] 5.4 `app/(store)/products/[slug]/` — detalhe do produto
- [ ] 5.5 `app/(store)/cart/` — carrinho Zustand
- [ ] 5.6 `app/(store)/sign-in/` + `sign-up/` — auth compradores
- [ ] 5.7 `app/(store)/account/orders/` — histórico + download
- [ ] 5.8 `app/(store)/thank-you/` — pós-pagamento
- [ ] 5.9 `components/store/product-card.tsx` + `cart-drawer.tsx`
- [ ] 5.10 Zustand store: `lib/stores/cart.ts`

### Fase 6 — Scripts e Finalização ✅
- [ ] 6.1 `scripts/create-admin.mjs`
- [ ] 6.2 `npm run build` — zero erros TypeScript
- [ ] 6.3 Commit e push

## Done When
- [ ] `npm run build` passa limpo
- [ ] `/admin/login` → `/admin` com credenciais
- [ ] `/products` lista produtos
- [ ] Checkout cria sessão Stripe

## Notes
- Next.js 14 (não 15) conforme spec
- Tailwind v3 (shadcn/ui compatível)
- NextAuth v5 beta para admin
- Sem PayloadCMS, tRPC, Resend
- Banco pode ser limpo (sem dados)
