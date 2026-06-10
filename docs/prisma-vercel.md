# Prisma + Vercel Setup

Atpio uses Prisma as the TypeScript database layer and PostgreSQL as the actual
database.

The deployment shape is:

```text
Atpio on Vercel -> Prisma Client -> PostgreSQL database
```

Neon is a good PostgreSQL provider for this project. Supabase also works, but
the app code still talks to the database through Prisma, not through a Supabase
SDK.

## Vercel Project Settings

The repo includes `vercel.json`, so Vercel should use:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run vercel-build
```

The build command runs:

```bash
prisma generate && prisma migrate deploy && next build
```

## Create the Database

1. Open your Vercel dashboard.
2. Open the Atpio project.
3. Go to Storage, Integrations, or Marketplace.
4. Choose Neon Postgres.
5. Create a database for the project.
6. Copy the pooled PostgreSQL connection string.

The connection string should look like:

```text
postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
```

## Environment Variables

Add these in Vercel project settings:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_APP_URL=https://your-atpio-domain.vercel.app
PPIO_API_KEY=replace_with_your_ppio_key
PPIO_BASE_URL=https://api.ppinfra.com/v3/openai
PPIO_MODEL=deepseek/deepseek-v3-turbo
PPIO_TIMEOUT_MS=30000
```

Set the environment scope to Production and Preview.

After deployment, create your first user at `/register`.

## Generate AUTH_SECRET

Use any long random string. Locally, this command works:

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

## Redeploy

After setting the environment variables:

1. Open Deployments.
2. Select the latest deployment.
3. Click Redeploy.

The deployment should show:

```text
Loaded Prisma config from prisma.config.ts
Prisma schema loaded from prisma/schema.prisma
prisma migrate deploy
next build
```

## Common Failure

If you see:

```text
The datasource.url property is required
```

then `DATABASE_URL` is missing or was added to the wrong environment scope.
