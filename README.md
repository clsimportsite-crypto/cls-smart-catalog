# CLS Smart Catalog

Transforma a lista do fornecedor (WhatsApp, TXT, CSV, Excel) em catálogo e vitrine prontos para vender.

- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind 4 + Supabase (Auth, Postgres com RLS).
- **Banco:** o mesmo Supabase do CLS Control, em tabelas próprias com prefixo `cat_` (veja `supabase/migrations`).
- **Plano completo:** documento "CLS Smart Catalog" (arquitetura, banco, telas e fases).

## Regras que valem para tudo

1. Custo fica em `cat_custos`, separado de `cat_precos`. A vitrine nunca lê custo.
2. A IA não inventa: campo que não está na lista fica vazio e o item vai para revisão.
3. Foto só do modelo e cor certos; sem foto confirmada, aparece como ilustrativa.
4. Cada loja só enxerga os próprios dados (RLS por `empresa_id` + `cat_membros`).

## Rodar localmente

```bash
cp .env.example .env.local   # preencha a chave pública
npm install
npm run dev
```

## Publicação

Netlify, site `cls-smart-catalog`, compilado a partir da branch `main`.
