# Decision Log

## 2026-06-01: Keep OpenClio as a reference, not a dependency

Decision:

Keep OpenClio as a research reference and focus the current implementation on TypeScript-first data gathering.

Reason:

OpenClio's completeness, scenario fit, runtime requirements, and Python/vLLM style may not fit Atpio's current repo. The current stage only needs to prove product-side data gathering: natural-language brief to gadget schema, standard script embed, response collection, and basic local aggregation.

Impact:

- The main app remains a solo TypeScript / Next.js codebase.
- OpenClio implementation files are not part of the current repo path.
- Analysis beyond local aggregation is future work after the data gathering flow is stable.

Additional instruction:

Do not make OpenClio part of the current implementation path. It was only reviewed as a reference. Atpio should first make the data gathering product flow work end to end, then decide whether analysis should be implemented in TypeScript or split into a separate service later.

## 2026-06-01: Keep commits small and meaningful

Decision:

Every meaningful addition or change should be committed separately.

Reason:

The project is exploratory and mentor-facing. Small commits make it easier to review progress, explain decisions, and roll back experiments.

Impact:

- Documentation changes get their own commits.
- UI, API, worker, and experiment changes should not be bundled together when avoidable.
- Commit messages should describe the specific change.
