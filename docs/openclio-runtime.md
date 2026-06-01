# OpenClio Runtime

Atpio has two analysis paths:

1. `atpio-local`: local fallback analysis for demos and development.
2. `openclio`: full OpenClio analysis through `workers/openclio_worker.py`.

The full OpenClio path requires a Python environment with OpenClio, vLLM, and sentence-transformers. This is best run in a Linux/GPU environment because vLLM is not a normal Windows desktop dependency.

## Check Runtime

```bash
python workers/check_openclio_env.py
```

## Install Runtime

```bash
python -m venv .venv-openclio
source .venv-openclio/bin/activate
pip install -r workers/openclio-requirements.txt
```

On Windows PowerShell, activate with:

```powershell
.venv-openclio\Scripts\Activate.ps1
```

If `vllm` fails on Windows, use WSL2, Linux, or a GPU server.

## Dry Run

```bash
python workers/openclio_worker.py \
  --project-id project_onboarding_feedback \
  --responses data/mock-responses.json \
  --output outputs/project_onboarding_feedback \
  --dry-run
```

## Full Run

```bash
python workers/openclio_worker.py \
  --project-id project_onboarding_feedback \
  --responses data/mock-responses.json \
  --output outputs/project_onboarding_feedback
```

The worker uses:

- `clio.genericSummaryFacets`
- `vllm.LLM(model="Qwen/Qwen3-8B")`
- `SentenceTransformer("sentence-transformers/all-mpnet-base-v2")`

The Next.js app can keep using the local analysis API until this runtime is available, then swap the `/api/projects/[projectId]/analyze` handler to spawn the worker or call a worker service.

