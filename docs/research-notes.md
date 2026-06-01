# Research Notes

## Clio

Clio is Anthropic's privacy-preserving analytics system for understanding aggregate usage patterns in AI conversations. The core idea is to avoid human review of raw conversations and instead use models to transform raw unstructured inputs into safer, higher-level summaries, facets, clusters, and aggregate insights.

Key takeaways for this project:

- Clio is an analysis method and platform, not a public hosted API.
- The project should not reimplement Clio from scratch unless OpenClio cannot fit the use case.
- Privacy comes from layered safeguards: abstraction, aggregation, minimum thresholds, and auditing.
- The output should focus on broad patterns, not individual user records.

## OpenClio Reference

OpenClio is an open-source implementation inspired by Anthropic's Clio. It is designed to run as a Python analysis pipeline, commonly with local LLMs through vLLM and embeddings through sentence-transformers.

Implications:

- Treat OpenClio as reference material, not the current analysis engine.
- Do not make the current repo depend on Python/vLLM.
- Reuse concepts where useful, but implement Atpio's product flow in TypeScript.
- Revisit deeper analysis once the data gathering flow is stable.

## Atpio Product Direction

Atpio should solve the data gathering product flow first:

- Data gathering project creation.
- Natural-language brief to form schema generation.
- Embeddable gadget / widget for other products.
- Response storage.
- Triggering analysis runs.
- Displaying collected response status and basic aggregate output.

## First Local Experiment

Goal:

Run a minimal Atpio data gathering experiment on mock feedback data.

Planned input:

- 20-50 mock user feedback entries.
- Each entry should look like a form response from a product page.

Success criteria:

- A separate product can load Atpio via `gadget.js`.
- The gadget can collect responses.
- The app can show basic aggregate output.
