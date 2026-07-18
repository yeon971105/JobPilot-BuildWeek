# JobPilot — Evidence-First AI Job Search

## Tagline

Know why a job fits before you apply.

## Inspiration

Job seekers face long descriptions and opaque AI match scores. Those scores rarely distinguish required from preferred qualifications, show the evidence behind a match, expose actual gaps, or explain how each point was calculated.

## What it does

JobPilot converts a role into structured requirements, compares each meaningful capability with candidate evidence, calculates deterministic AI Fit V2.2, displays practical constraints separately, produces a reproducible Score Receipt, and creates a grounded application strategy.

## Architecture

Deterministic code handles explicit extraction, experience overlap prevention, capability aliases, every score point, Evidence Quality, constraints, priority, and receipt hashes. Gemma 4 12B is the primary local semantic model for ambiguous requirements, capability grouping, batched evidence matching, equivalence, summaries, and uncertainty. GPT-5.6 Terra is optional and restricted to explicit complex strategy, independent critique, difficult ambiguity, and strategy comparison.

## Privacy

The public demo uses only original synthetic data and browser-local tracker state. Private-user semantic analysis is designed to remain on local Ollama. Build Week GPT-heavy requests use bounded public-safe facts and IDs, never a full raw resume. There is no protected-attribute scoring, auto-apply, or application submission.

## Score trust

Every eligible score reconciles to exactly 100 visible points. Required and preferred caps, month-level experience, practical separation, deterministic sensitivity, and receipt stability are tested. “See a Score Change” proves the score recomputes when one synthetic evidence classification changes. The score is policy-based and is not a hiring probability.

## How Codex was used

Codex reproduced the prior release, inspected the exact local runtime, implemented provider routing, schemas, UI, tests, proof artifacts, and release documentation, ran a live Gemma canary, repaired failures, executed browser certification, scanned for secrets, and created clean task-scoped commits.

## Build Week extension

JobPilot existed before Build Week. The submission extension is the no-login synthetic judge flow, AI Fit V2.2 proof, hybrid runtime, provider labeling, score-change experience, Trust Lab, validation, and release package.

## Limitations

Independent hiring-outcome calibration is not yet available. GPT-heavy features require server configuration. The synthetic catalog is intentionally small and does not claim market coverage.

## Links

- Repository: `[PUBLIC_REPOSITORY_URL]`
- Demo: `[PUBLIC_DEMO_URL]`
- Video: `[PUBLIC_VIDEO_URL]`
- Codex Session ID: `[CODEX_FEEDBACK_SESSION_ID]`
