# Atpio Work Log

## 2026-06-01

Initial setup:

- Created `PROJECT_PLAN.md` with the overall project explanation and plan.
- Initialized git.
- Scaffolded the Next.js + TypeScript + Tailwind app.
- Added research, decision, and work log documents.

Current next steps:

- Replace mock responses with real persistence.
- Add LLM schema generation from a natural-language brief.
- Turn the embed preview into a production `/gadget.js` script.
- Keep OpenClio as concept reference only; focus current work on data gathering.

Completed implementation:

- Replaced the default Next.js homepage with a project dashboard shell.
- Added static project creation and schema preview UI.
- Defined shared TypeScript types for projects, schemas, and responses.
- Added a dynamic form renderer.
- Added mock schema and response API routes.
- Added an embeddable form preview route.
- Added local persistence.
- Added PPIO-backed schema generation with local fallback.
- Added the embeddable `/gadget.js` script and `/demo-host`.
- Connected the dashboard to the local store and response counts.
- Added project list, project detail, and schema editor pages.
- Added multi-page forms and field validation metadata.
- Added configurable gadget settings, host metadata, lifecycle events, and success callback support.
- Updated the UI toward the Atpio warm research-workspace style.
- Added local `.env.local` PPIO key support without committing secrets.
- Verified the PPIO-backed UI flow: `/projects/new` can generate a schema and save a project using the configured local API key.
- Replaced the project detail JSON-only schema editor with a visual schema builder plus Advanced JSON fallback.
- Added visual validation controls for text length and rating range fields.
- Improved the PPIO schema prompt and field type normalization.
- Added full gadget branding controls for brand color, accent color, button shape, and font family.
