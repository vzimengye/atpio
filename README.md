# Atpio

Atpio is a prototype for collecting product feedback through embeddable gadgets and sending the collected responses into OpenClio for aggregate analysis.

The app does not redesign Clio. The intended architecture is:

```text
Next.js app -> response storage -> Python OpenClio worker -> dashboard output
```

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
- Python OpenClio worker dry-run adapter.

Not implemented yet:

- Production database storage.
- Real OpenClio dependency setup.
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
- Install the full OpenClio stack and replace the local analysis fallback when the runtime supports it. See `docs/openclio-runtime.md`.
- Add user login and per-project access control beyond the admin-token API guard.
- Deploy to Vercel and configure production environment variables. See `docs/deployment.md`.
- Add privacy hardening beyond basic PII redaction, including minimum group thresholds and audit logs.

## Validate

```bash
npm run lint
npm run build
```

## OpenClio Worker Dry Run

```bash
python workers/openclio_worker.py \
  --project-id project_onboarding_feedback \
  --responses data/mock-responses.json \
  --output outputs/project_onboarding_feedback \
  --dry-run
```

This writes:

```text
outputs/project_onboarding_feedback/openclio-input.json
```

`outputs/` is ignored because it is generated analysis output.

## Git Rule

Keep commits small:

- Commit each meaningful feature addition.
- Commit each decision or documentation update.
- Check `git diff` before committing.
