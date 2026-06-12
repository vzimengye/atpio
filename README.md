# Atpio

Atpio is a TypeScript-first prototype for collecting product feedback through embeddable gadgets. Product teams describe the data they want in natural language, and Atpio generates a lightweight form/questionnaire gadget that can run inside another product.

The current architecture is intentionally a solo TypeScript codebase:

```text
Next.js app -> PPIO schema generation -> script/iframe gadget -> response storage -> collection summary
```

OpenClio is only a research reference for later analysis work. It is not required for the current data gathering MVP.

## Current Status

Implemented:

- Next.js + TypeScript + Tailwind app scaffold.
- Project dashboard shell.
- Dynamic form renderer.
- `/projects/new` project creator with AI-assisted schema generation.
- `/projects` project list.
- `/projects/[projectId]` project detail editor.
- `/embed/[projectId]` embedded form preview.
- `/gadget.js` script embed.
- `/demo-host` mock host product page.
- Prisma/PostgreSQL storage for deployed environments, with local JSON fallback.
- Self-serve account registration and sign-in for project workspaces.
- PPIO-backed schema generation with local fallback.
- Multi-page questionnaire rendering.
- Field validation metadata.
- Visual schema builder with an advanced JSON fallback.
- Visual validation controls for text length and rating ranges.
- Configurable gadget position, theme, label, success message, brand color, accent color, button shape, and font family.
- Host metadata, open/close/success events, and success callback.
- Mock collection APIs:
  - `GET /api/projects/[projectId]/schema`
  - `POST /api/projects/[projectId]/responses`
- Project data export API:
  - `GET /api/projects/[projectId]/export`
- OpenClio concept notes for future analysis exploration.

Not implemented yet:

- Basic aggregate reporting beyond response and schema counts.
- Shared team workspaces and role permissions.

## Run the App

```bash
npm install
npm run dev
```

Open:

- `http://127.0.0.1:3000`
- `http://127.0.0.1:3000/projects/new`
- `http://127.0.0.1:3000/embed/project_onboarding_feedback`
- `http://127.0.0.1:3000/demo-host`

## Environment

Copy `.env.example` to `.env.local` and set `PPIO_API_KEY` to enable real LLM schema generation. Without a key, Atpio falls back to the local deterministic schema generator.

Do not commit `.env.local`.

For account sign-in, set:

- `AUTH_SECRET`

Atpio users can create accounts from `/register`. The legacy
`ATPIO_ADMIN_EMAIL` and `ATPIO_ADMIN_PASSWORD` variables are optional migration
fallback credentials and are not required for normal self-serve use.

For production database storage on Vercel, set `DATABASE_URL` and use the
`npm run vercel-build` build command so Prisma generates the client and applies
migrations before `next build`.

For the exact Prisma + Neon + Vercel setup, see
[`docs/prisma-vercel.md`](docs/prisma-vercel.md).

## MVP Flow

1. Open `/projects/new`.
2. Enter or edit a research brief.
3. Generate a schema.
4. Save the project.
5. Open `/projects` or `/projects/[projectId]` to edit schema and gadget settings.
6. Mark the project active for workspace embeds, or use the fixed project embed.
7. Open `/demo-host`, `/embed/[projectId]`, or the deployed mock product link.
8. Submit feedback as a public participant without signing in.
9. Return to `/`.
10. Review response and schema counts.

## Local Two-Project Integration Test

This verifies that Atpio can run inside another product locally.

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run mock-product
```

Open:

```text
http://127.0.0.1:4000
```

The mock product is a separate static app in `mock-product/`. It loads Atpio from `http://127.0.0.1:3000/gadget.js`, then opens the feedback form in an iframe. This is the local equivalent of another product calling Atpio's gadget API.

The deployed mock product is available at:

```text
https://mock-product.vercel.app
```

In production, set `NEXT_PUBLIC_MOCK_PRODUCT_URL=https://mock-product.vercel.app`
on the Atpio Vercel project so Atpio's "Test in mock product" links open the
host product directly.

## Mock Product Integration Skill

If someone needs to build a mock host page that connects to Atpio the same way
`mock-product/` does, use this guide:

[`skills/mock-product-integration/SKILL.md`](skills/mock-product-integration/SKILL.md)

That skill only explains the mock host side:

1. Load Atpio's public `gadget.js` script.
2. Pass either `data-atpio-workspace-key` to follow the account's active
   project, or `data-project-id` to pin one project.
3. Optionally pass `data-atpio-meta-*` metadata.
4. Listen for open, close, and success events.
5. Verify the iframe opens and responses are saved.

It does not describe Atpio's internal implementation.

## Download Project Data

Project data can be exported as JSON:

```text
GET /api/projects/{projectId}/export
```

The response is returned as a downloadable file containing the project, schema,
gadget settings, responses, audit events, and export timestamp.

## Remaining Production Work

- Revisit advanced analysis after the data gathering product flow is stable. If needed, use OpenClio only as conceptual reference and prefer a TypeScript implementation first.
- Deploy to Vercel and configure production environment variables. See `docs/deployment.md`.
- Add privacy hardening before advanced analysis work, including PII redaction and minimum group thresholds.

## Validate

```bash
npm run lint
npm run build
```

## OpenClio Reference

OpenClio is not on the current critical path. Atpio should stay TypeScript-first while the data gathering flow is being developed.

Current rule: do not integrate or adapt OpenClio before the data gathering flow is stable. Use it only as conceptual reference for later analysis work.

## Git Rule

Keep commits small:

- Commit each meaningful feature addition.
- Commit each decision or documentation update.
- Check `git diff` before committing.
