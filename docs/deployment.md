# Deployment Notes

## Vercel

Atpio is a standard Next.js app and can be deployed to Vercel.

Choose the **Next.js** application preset. Then override the build command.

Use the custom build command:

```bash
npm run vercel-build
```

This runs:

```bash
prisma generate && prisma migrate deploy && next build
```

The Prisma steps matter because Vercel caches dependencies between builds. Generating Prisma Client during deployment keeps the generated client aligned with `prisma/schema.prisma`, and `prisma migrate deploy` applies committed migrations.

Do not run Prisma from `postinstall`. Dependency installation should not require a database connection; the deployment build command is the right place to generate the client and apply migrations.

## Required Environment Variables

```text
AUTH_SECRET=...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-atpio-domain.vercel.app
NEXT_PUBLIC_MOCK_PRODUCT_URL=https://mock-product.vercel.app
PPIO_API_KEY=...
PPIO_BASE_URL=https://api.ppinfra.com/v3/openai
PPIO_MODEL=deepseek/deepseek-v3-turbo
PPIO_TIMEOUT_MS=30000
```

Optional migration fallback credentials:

```text
ATPIO_ADMIN_EMAIL=admin@example.com
ATPIO_ADMIN_PASSWORD=...
```

Optional for local/demo environments:

```text
LOG_LEVEL=info
```

## Database

Atpio uses Prisma with PostgreSQL when `DATABASE_URL` is set.

Recommended Vercel-compatible options:

- Prisma Postgres through the Vercel Marketplace.
- Neon Postgres.
- Supabase Postgres.
- Any pooled PostgreSQL URL suitable for serverless workloads.

Local development can still run without `DATABASE_URL`; in that case Atpio falls back to `data/app-store.json`.

## Auth

Project management routes are protected by Auth.js credentials auth. Atpio
users can register their own account at `/register`; each account has its own
project workspace.

Set:

- `AUTH_SECRET`

`ATPIO_ADMIN_EMAIL` and `ATPIO_ADMIN_PASSWORD` are optional migration fallback
credentials. They are not required for normal self-serve accounts.

Public routes intentionally remain open:

- `/gadget.js`
- `/embed/[projectId]`
- `/api/projects/[projectId]/schema`
- `/api/projects/[projectId]/responses`
- `/api/projects/latest`
- `/api/projects/generate-schema`

Project management/export routes require a signed-in Atpio account session.

## Deploy From Local

```bash
npm install
npm test
npm run lint
npm run build
npx vercel
```

Production deploy:

```bash
npx vercel --prod
```

## Verify After Deployment

1. Open `https://your-atpio-domain.vercel.app/login`.
2. Create an account at `/register`, then sign in.
3. Create and save a project.
4. Open `/api/projects/{projectId}/export` while signed in and verify a JSON file downloads.
5. Mark the project active in `/projects`.
6. Open the configured mock product URL with the workspace key, for example `https://mock-product.vercel.app?workspaceKey=...`, and verify it loads the selected project.
7. Add the script from the project detail page to a host product and verify the iframe opens.
