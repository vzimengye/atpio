# OpenClio Reference Worker

This folder is reference material only. OpenClio is not required for the current Atpio MVP.

The current Atpio path is TypeScript-first and focuses on data gathering:

1. Natural-language brief to schema.
2. Script/iframe gadget.
3. Response collection.
4. Basic TypeScript aggregation.

## Dry Run

Use the dry run only if we later want to inspect OpenClio input compatibility:

```bash
python workers/openclio_worker.py \
  --project-id project_onboarding_feedback \
  --responses data/mock-responses.json \
  --output outputs/project_onboarding_feedback \
  --dry-run
```

This writes `openclio-input.json` so the data adapter can be reviewed.

## Real Run

Only run without `--dry-run` if future analysis work explicitly decides to use OpenClio.

The initial real run will use `clio.genericSummaryFacets`, which is appropriate for generic form responses and questionnaire data.
