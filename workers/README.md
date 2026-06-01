# OpenClio Worker

This folder owns the Python side of the analysis pipeline.

The app should not redesign Clio. Instead, it should:

1. Export collected project responses.
2. Convert them into OpenClio input records.
3. Call OpenClio from this worker.
4. Save the generated output files.
5. Let the Next.js app link to or embed the output.

## Dry Run

Use the dry run before installing OpenClio:

```bash
python workers/openclio_worker.py \
  --project-id project_onboarding_feedback \
  --responses data/mock-responses.json \
  --output outputs/project_onboarding_feedback \
  --dry-run
```

This writes `openclio-input.json` so the data adapter can be reviewed.

## Real Run

Once the Python environment has OpenClio, vLLM, and sentence-transformers installed, run without `--dry-run`.

The initial real run will use `clio.genericSummaryFacets`, which is appropriate for generic form responses and questionnaire data.

