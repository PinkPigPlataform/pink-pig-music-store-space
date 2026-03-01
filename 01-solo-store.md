# Transform to Solo Store

## Goal
Remove all multi-seller concepts from the Pink Pig v2 codebase — single admin/owner, no seller dashboard, no product approval flow.

## Tasks

- [x] AUDITORIA: Mapear todos os arquivos afetados
- [x] F2-A: `Products.ts` — remover `addUser`, `syncUser`, `isAdminOrHasAccess`, campo `user`, campo `approvedForSale`; simplificar access
- [x] F2-B: `Users.ts` — remover campos `products` e `product_files`
- [x] F2-C: `ProductFile.ts` — remover `addUser` (beforeChange), simplificar access `yourOwnAndPurchased` → só compras pagas
- [x] F2-D: `Media.ts` — remover `isAdminOrHasAccessToImages`, simplificar access (admin ou public read)
- [x] F3-A: `Footer.tsx` — remover seção "Become a seller"
- [x] F3-B: `UserAccountNav.tsx` — remover link "Seller Dashboard"
- [x] F3-C: `sign-in/page.tsx` — remover lógica `?as=seller`, `isSeller`, botão "continueAsSeller"
- [x] F3-D: `translations.ts` — remover chaves de vendedor (pt-BR e en)
- [x] F4-A: `trpc/index.ts` — remover filtro `approvedForSale` da query `getInfiniteProducts`
- [x] F4-B: `ProductReel.tsx` — remover filtro `approvedForSale`
- [x] F4-C: `app/sitemap.ts` — remover filtro `approvedForSale`
- [x] F6: `npm run generate:types` — regenerar payload-types.ts
- [x] F7: grep de verificação final + `npm run build`

## Done When
- [ ] grep de `approvedForSale|syncUser|isAdminOrHasAccess|as=seller|sellerDashboard|becomeSeller` retorna zero resultados em src/
- [ ] `npm run build` passa sem erros
