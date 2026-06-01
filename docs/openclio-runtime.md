# OpenClio Reference Runtime

OpenClio is reference material for future analysis work. It is not required for the current Atpio MVP.

The current Atpio plan is TypeScript-first:

```text
natural-language brief -> PPIO schema generation -> gadget rendering -> response collection -> basic TS aggregation
```

The full OpenClio path, if revisited later, requires a Python environment with OpenClio, vLLM, and sentence-transformers. This is best run in a Linux/GPU environment because vLLM is not a normal Windows desktop dependency.

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

The Next.js app should keep using the TypeScript local analysis API for now. If analysis becomes a priority later, use OpenClio as reference or reimplement the needed ideas in TypeScript.
