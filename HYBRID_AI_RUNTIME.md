# Hybrid AI Runtime

## Primary: Gemma 4 12B

`gemma4:12b` runs through loopback Ollama for semantic job analysis, a cached resume semantic profile, batched evidence matching, equivalence, role summaries, and uncertainty. The adapter rejects a remote endpoint or model substitution and never pulls a missing model.

## Deterministic Code

Explicit parsing, classification from explicit sections, month-level experience, capability aliases, score allocation, Evidence Quality, constraints, cache identity, priority, and Score Receipt remain deterministic.

## Optional: GPT-5.6 Terra

The Responses API with strict Structured Outputs supports only explicit application strategy, critique, difficult ambiguity, and strategy comparison. Requests are bounded, timed out, rate-limited, schema-validated, ID-validated, and use synthetic/public-safe Build Week facts. The final score is read-only context and cannot be replaced by the model.

Set a server-side `OPENAI_API_KEY` and enable `OPENAI_HEAVY_FEATURES_ENABLED=true`; no source change is required.

## Prepared mode

The judge build uses frozen Gemma pipeline artifacts and prepared GPT-heavy demonstration output. Labels never claim live or fresh inference.
