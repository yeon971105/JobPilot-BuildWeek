# AI Fit Score V2.2 Methodology

AI Fit V2.2 is deterministic policy code. Models can structure evidence, but cannot calculate the final score.

- One point equals 1,000,000 integer micro-points.
- CORE begins at 85.
- PREFERRED is capped at 12; Preferred Experience is capped at 4.
- NICE_TO_HAVE is capped at 3 and at 1 per independent capability.
- Unused PREFERRED and NICE_TO_HAVE capacity transfers visibly to CORE.
- Stable largest-remainder allocation uses capability-group IDs for tie-breaking.
- Experience takes the maximum relevance coefficient per calendar month, so overlapping roles count once.
- Match intervals generate low/mid/high ranges; `UNKNOWN` stays unknown.
- Eligible analyses reconcile to exactly 100,000,000 visible micro-points.
- Hidden adjustments are always zero.

## Practical separation

Configured location, Haversine distance, remote compatibility, work mode, travel, posting recency, and blockers help prioritize action. They never change technical capability points. Best Match applies an explicit stable order over eligibility, blocker state, Fit Score, Evidence Quality, distance when applicable, posting date, and job ID.

## Receipt

Every analysis includes versioned input hashes, prompt and scorer versions, class totals, transfers, capability groups, evidence IDs, practical constraints, Evidence Quality, displayed-score rounding, hidden adjustments, and a canonical SHA-256 receipt hash. The independent verifier can fully reproduce all six frozen receipts.

Fit Score is an evidence-based ranking score, not a hiring or interview probability. Independent hiring-outcome calibration is not yet available.
