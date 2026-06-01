# Research Notes

## Clio

Clio is Anthropic's privacy-preserving analytics system for understanding aggregate usage patterns in AI conversations. The core idea is to avoid human review of raw conversations and instead use models to transform raw unstructured inputs into safer, higher-level summaries, facets, clusters, and aggregate insights.

Key takeaways for this project:

- Clio is an analysis method and platform, not a public hosted API.
- The project should not reimplement Clio from scratch unless OpenClio cannot fit the use case.
- Privacy comes from layered safeguards: abstraction, aggregation, minimum thresholds, and auditing.
- The output should focus on broad patterns, not individual user records.

## OpenClio

OpenClio is an open-source implementation inspired by Anthropic's Clio. It is designed to run as a Python analysis pipeline, commonly with local LLMs through vLLM and embeddings through sentence-transformers.

Implications:

- Treat OpenClio as the analysis engine.
- Build a thin adapter that converts collected project responses into OpenClio input data.
- Start with `genericSummaryFacets` for non-conversation data such as form responses.
- Later, generate or configure custom facets per project when the product needs deeper analysis.

## Atpio Product Direction

Atpio should solve the pieces OpenClio does not provide:

- Data gathering project creation.
- Natural-language brief to form schema generation.
- Embeddable gadget / widget for other products.
- Response storage.
- Triggering analysis runs.
- Displaying OpenClio output inside a product dashboard.

## First Local Experiment

Goal:

Run a minimal OpenClio or OpenClio-like experiment on mock feedback data.

Planned input:

- 20-50 mock user feedback entries.
- Each entry should look like a form response from a product page.

Success criteria:

- The worker can transform responses into the data format expected by OpenClio.
- The analysis run produces a static report or output files.
- The app can link to or embed the generated output.
