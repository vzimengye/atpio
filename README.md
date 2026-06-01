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
- Mock collection APIs:
  - `GET /api/projects/[projectId]/schema`
  - `POST /api/projects/[projectId]/responses`
- Python OpenClio worker dry-run adapter.

Not implemented yet:

- Real database storage.
- LLM schema generation from briefs.
- Real OpenClio dependency setup.
- Authentication and permission management.
- Production gadget script at `/gadget.js`.

## Run the App

```bash
npm install
npm run dev
```

Open:

- `http://127.0.0.1:3000`
- `http://127.0.0.1:3000/projects/new`
- `http://127.0.0.1:3000/embed/project_onboarding_feedback`

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
