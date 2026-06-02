# Atpio

Atpio is a TypeScript-first prototype for collecting product feedback through embeddable gadgets. Product teams describe the data they want in natural language, and Atpio generates a lightweight form/questionnaire gadget that can run inside another product.

The current architecture is intentionally a solo TypeScript codebase:

```text
Next.js app -> PPIO schema generation -> script/iframe gadget -> response storage -> local aggregate analysis
```

OpenClio is only a research reference for later analysis work. It is not required for the current data gathering MVP.

## Current Status

Implemented:

- Next.js + TypeScript + Tailwind app scaffold.
- Project dashboard shell.
- Mock project and insight data.
- Dynamic form renderer.
- `/projects/new` builder stub.
- `/embed/[projectId]` embedded form preview.
- `/gadget.js` script embed.
- `/demo-host` mock host product page.
- Local file-backed persistence in `data/app-store.json`.
- PPIO-backed schema generation with local fallback.
- Local privacy-preserving analysis fallback with PII redaction.
- Mock collection APIs:
  - `GET /api/projects/[projectId]/schema`
  - `POST /api/projects/[projectId]/responses`
- Analysis APIs:
  - `POST /api/projects/[projectId]/analyze`
  - `GET /api/projects/[projectId]/insights`
- OpenClio concept notes for future analysis exploration.

Not implemented yet:

- Production database storage.
- Production-grade analysis beyond the local TypeScript fallback.
- Authentication and permission management.
- Vercel deployment.

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

Set `ATPIO_ADMIN_TOKEN` to require `x-atpio-admin-token` for admin APIs such as project creation, schema generation, analysis, and audit logs. Leave it unset for local demos without auth.

When auth is enabled, paste the token into the Admin token panel in the Atpio UI. The browser stores it in localStorage and sends it as `x-atpio-admin-token`.

## MVP Flow

1. Open `/projects/new`.
2. Enter or edit a research brief.
3. Generate a schema.
4. Save the project.
5. Open `/demo-host` or `/embed/[projectId]`.
6. Submit feedback.
7. Return to `/` and click `Analyze responses`.
8. Review aggregate themes and recommendations.

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

## Remaining Production Work

- Replace `data/app-store.json` with Supabase, Postgres, or another production database.
- Revisit advanced analysis after the data gathering product flow is stable. If needed, use OpenClio only as conceptual reference and prefer a TypeScript implementation first.
- Add user login and per-project access control beyond the admin-token API guard.
- Deploy to Vercel and configure production environment variables. See `docs/deployment.md`.
- Add privacy hardening beyond basic PII redaction, including minimum group thresholds and audit logs.

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
