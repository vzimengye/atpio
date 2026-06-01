# Decision Log

## 2026-06-01: Use OpenClio as the analysis engine

Decision:

Use OpenClio as the first analysis backend instead of redesigning Clio from scratch.

Reason:

Anthropic's original Clio is not exposed as a public API, while OpenClio provides an open-source implementation that can be called from a Python worker. This lets Atpio focus on data collection, product integration, and dashboard UX.

Impact:

- The main app can remain TypeScript / Next.js.
- A Python worker will handle OpenClio runs.
- The first adapter will use `genericSummaryFacets` for form and questionnaire responses.

## 2026-06-01: Keep commits small and meaningful

Decision:

Every meaningful addition or change should be committed separately.

Reason:

The project is exploratory and mentor-facing. Small commits make it easier to review progress, explain decisions, and roll back experiments.

Impact:

- Documentation changes get their own commits.
- UI, API, worker, and experiment changes should not be bundled together when avoidable.
- Commit messages should describe the specific change.
