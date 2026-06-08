# Atpio Agent Guide

## Run Commands

- Install dependencies: `npm install`
- Start the Atpio app: `npm run dev`
- Start the mock product: `npm run mock-product`
- Lint: `npm run lint`
- Test: `npm test`
- Build: `npm run build`

## Project Shape

- App routes live in `src/app`.
- Shared UI components live in `src/components`.
- Core business logic lives in `src/lib`.
- AI provider, prompts, and schema generation live in `src/ai`.
- Public gadget integration lives in `src/app/gadget.js/route.ts`.
- The mock external product lives in `mock-product`.

## Import Rules

- Prefer the `@/` alias for imports from `src`.
- AI generation should import from `@/ai/generate-schema`, not from API routes.
- Shared validation should import from `@/lib/validation`.
- Shared logging should import from `@/lib/logger`.

## Type Rules

- Keep `strict` TypeScript enabled.
- Do not use `any`. Prefer `unknown`, Zod schemas, or explicit project types.
- Use object parameters when a function takes more than one argument.
- Validate untrusted input at route boundaries with Zod.

## Logging Rules

- Use `logger` from `@/lib/logger`.
- Logger calls accept one parameter only: either a string or an object with a `msg` field.
- Do not silently swallow errors. Log the error, then fall back when appropriate.

## Public Endpoint Rules

- Keep response submission routes public, but validate input and rate limit them.
- Admin/project management routes should eventually require authentication.
- Do not add broad CORS headers to admin routes.

## URL Rules

- Do not hardcode `127.0.0.1:3000` in product code.
- Use `NEXT_PUBLIC_APP_URL` via `@/lib/public-url` for public Atpio URLs.
- Use `NEXT_PUBLIC_MOCK_PRODUCT_URL` via `@/lib/public-url` for the local mock product URL.

## Git Habit

- Keep changes small and commit each meaningful step.
- Run `npm run lint`, `npm test`, and `npm run build` when changing core logic.
