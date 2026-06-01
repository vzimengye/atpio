from __future__ import annotations

import importlib.util
import sys


def check(module_name: str) -> bool:
  installed = importlib.util.find_spec(module_name) is not None
  print(f"{module_name}: {'installed' if installed else 'missing'}")
  return installed


def main() -> int:
  checks = [
    check("openclio"),
    check("vllm"),
    check("sentence_transformers"),
  ]
  if all(checks):
    print("OpenClio runtime is ready.")
    return 0

  print(
    "OpenClio runtime is not ready. Install workers/openclio-requirements.txt "
    "in a Linux/GPU Python environment for the full run."
  )
  return 1


if __name__ == "__main__":
  sys.exit(main())

