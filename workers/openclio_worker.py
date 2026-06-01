from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load_responses(path: Path) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("Expected responses file to contain a JSON list.")

    return data


def response_to_openclio_record(response: dict[str, Any]) -> dict[str, Any]:
    answers = response.get("answers", {})
    if not isinstance(answers, dict):
        answers = {}

    lines = []
    for key, value in answers.items():
        if isinstance(value, list):
            rendered_value = ", ".join(str(item) for item in value)
        else:
            rendered_value = str(value)
        lines.append(f"{key}: {rendered_value}")

    return {
        "id": response.get("id"),
        "projectId": response.get("projectId"),
        "text": "\n".join(lines),
        "metadata": {
            "source": "data-gathering-gadget",
        },
    }


def write_openclio_input(records: list[dict[str, Any]], output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "openclio-input.json"
    with output_path.open("w", encoding="utf-8") as file:
        json.dump(records, file, indent=2, ensure_ascii=False)
        file.write("\n")
    return output_path


def run_openclio(records: list[dict[str, Any]], output_dir: Path) -> None:
    try:
        import openclio as clio
        import vllm
        from sentence_transformers import SentenceTransformer
    except ImportError as error:
        raise RuntimeError(
            "OpenClio dependencies are not installed. Run with --dry-run or "
            "install openclio, vllm, and sentence-transformers."
        ) from error

    llm = vllm.LLM(model="Qwen/Qwen3-8B")
    embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

    clio.runClio(
        facets=clio.genericSummaryFacets,
        llm=llm,
        embeddingModel=embedding_model,
        data=records,
        outputDirectory=str(output_dir),
        htmlRoot=f"/clio-results/{output_dir.name}",
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run OpenClio for a project.")
    parser.add_argument("--project-id", required=True)
    parser.add_argument("--responses", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    responses = load_responses(args.responses)
    project_responses = [
        response
        for response in responses
        if response.get("projectId") == args.project_id
    ]
    records = [response_to_openclio_record(response) for response in project_responses]
    input_path = write_openclio_input(records, args.output)

    if args.dry_run:
        print(f"Wrote {len(records)} OpenClio input records to {input_path}")
        return

    run_openclio(records, args.output)


if __name__ == "__main__":
    main()

