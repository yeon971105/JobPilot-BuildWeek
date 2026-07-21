# JobPilot — Evidence-First AI Job Search

> **HISTORICAL_SUPERSEDED:** Retained pre-RC4 draft evidence. Do not use for the current submission; use `build-week/devpost/owner-review-draft.md`.

**Tagline:** Know why a job fits before you apply.

**Category:** Apps for Your Life

## Inspiration and problem

Job seekers are routinely shown opaque fit scores without knowing what evidence produced them. JobPilot makes the reasoning inspectable before a person decides whether to apply.

## What it does

JobPilot presents six synthetic roles in a no-login judge flow. Each numeric result allocates an exact 100-point capability budget, links points to candidate evidence, separates work-mode constraints from technical fit, and produces a deterministic Score Receipt. One deliberately insufficient-evidence role shows no numeric score.

## How it works

Deterministic code handles explicit parsing, normalization, experience math, score allocation, receipt hashing, and Apply Priority. Gemma 4 12B is the primary local semantic model for ambiguous requirements, capability grouping, evidence matching, grounded summaries, and uncertainty. GPT-5.6 Terra is integrated only for bounded application strategy, critique, ambiguity resolution, and strategy comparison; it never generates or silently changes the score. The public judge flow uses frozen synthetic Gemma analyses so it needs neither Ollama nor an OpenAI key.

## How Codex was used

Codex reproduced the parent release, read the installed framework guidance, implemented and repaired the hybrid routing and trust experience, ran the real local Gemma canary, expanded deterministic proof tests, certified desktop/tablet/mobile flows, repaired the video, audited privacy and secrets, and packaged the release. Commit history and the Build Week logs preserve this work.

## Score proof and privacy

AI Fit V2.2 enforces an exact 100-point budget, required/preferred caps, no hidden adjustments, no work-mode leakage, and stable receipt recomputation. The judge flow contains no real resume, account, production database, protected-attribute scoring, auto-apply, or application submission. The score is a policy-based decision aid, not a hiring probability.

## Build Week extension disclosure

The pre-existing foundation was the official-source catalog, prior market acquisition, and earlier application structure. Build Week added the evidence-backed scoring redesign, deterministic AI Fit V2.2, Score Receipts, six-job no-login demo, Gemma/GPT hybrid architecture, Score Change, Trust Lab, responsive UX, proof suite, video, and publication package.

## Required links

- Repository: pending verified publication
- Demo: pending verified deployment
- Public YouTube video: pending authenticated upload
- Codex /feedback Session ID: pending primary-thread command

This draft must be reviewed in the entrant's own voice before submission and must not be submitted until all four required values are verified.
