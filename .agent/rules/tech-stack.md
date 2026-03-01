---
trigger: always_on
---

# Regras de Arquitetura - Pink Pig
- **Next.js**: Fixado em 15.4.11 (Não atualizar para @latest).
- **Tailwind**: Versão 4 (Usar @tailwindcss/postcss).
- **TypeScript**: Proibido uso de 'as any'. Sempre buscar interfaces do PayloadCMS.
- **Componentes**: Priorizar Server Components. Só usar 'use client' se houver interatividade.