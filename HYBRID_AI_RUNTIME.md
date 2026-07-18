# Hybrid AI Runtime

## Gemma 4 12B: primary semantic model

`gemma4:12b` handles ambiguous requirement extraction, capability grouping, semantic candidate profiling, batched evidence matching, equivalence, role summaries, and uncertainty. The local adapter accepts loopback Ollama only, validates the exact model family and returned IDs, and never pulls or substitutes a missing model.

The release completed a fresh real canary against digest `4eb23ef…b2b05c`: structured output valid, evidence IDs valid, 87.5% frozen requirement coverage, and no final score in model output.

## Deterministic code: only score owner

Explicit parsing, integer micro-point allocation, stable tie-breaking, experience month union, class caps, transfers, Evidence Quality, constraints, priority, receipt creation, and receipt verification are deterministic. Models do not calculate, round, or mutate Fit Score.

## GPT-5.6: prepared bounded review

The submitted runtime uses four structured artifacts generated through the verified Codex Desktop task with `gpt-5.6-sol` at `xhigh` reasoning effort:

- application strategy;
- independent analysis challenge;
- ambiguous requirement review;
- two-role strategy comparison.

Every artifact is hash-bound, uses valid frozen job/candidate evidence IDs, stores final structured output only, and records zero unsupported claims, fabricated experience, education, or skills. OpenAI API requests and API cost are both zero. UI labels say **GPT-5.6 — Prepared Review**, never Live.

An optional future Responses API adapter remains disabled by default and requires both a server-side key and explicit feature flag. It is not part of the submitted runtime claim.

## Local Private Mode

Set `LOCAL_PRIVATE_MODE=true`, `OLLAMA_ENABLED=true`, `OLLAMA_BASE_URL=http://127.0.0.1:11434`, and `OLLAMA_MODEL=gemma4:12b`. Parsing remains offline. After the user confirms the structured profile, one bounded loopback generation returns schema-validated semantic matches. Unknown identifiers and malformed output fail closed.
