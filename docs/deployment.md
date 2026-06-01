# Deployment Notes

## Vercel

Atpio is a standard Next.js app and can be deployed to Vercel.

Required environment variables:

```text
PPIO_API_KEY=...
PPIO_BASE_URL=https://api.ppinfra.com/v3/openai
PPIO_MODEL=deepseek/deepseek-v3-turbo
ATPIO_ADMIN_TOKEN=...
ATPIO_MIN_THEME_COUNT=2
```

Deploy from a machine logged in to Vercel:

```bash
npm install
npm run lint
npm run build
npx vercel
```

Production deploy:

```bash
npx vercel --prod
```

## Important Production Caveat

The current MVP uses `data/app-store.json` for local persistence. That is useful for local demos but not suitable for Vercel production because serverless files are ephemeral.

Before real production use, replace `src/lib/store.ts` with a database-backed implementation. Recommended options:

- Supabase Postgres
- Vercel Postgres / Neon
- Any Postgres database with row-level project ownership

The rest of the app is already routed through the store abstraction, so the database change should be localized.

