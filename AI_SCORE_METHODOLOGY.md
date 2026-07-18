# AI Fit Score V2.2 Methodology

AI Fit V2.2 is deterministic policy code. Models can structure and classify evidence but cannot calculate the final score.

- One point equals 1,000,000 integer micro-points.
- CORE begins at 85.
- PREFERRED is capped at 12; its experience category is capped at 4.
- NICE_TO_HAVE is capped at 3 and at 1 per independent capability.
- Unused PREFERRED and NICE_TO_HAVE capacity transfers visibly to CORE.
- Stable largest-remainder allocation uses capability-group IDs for tie-breaking.
- Experience uses one maximum relevance coefficient per calendar month, preventing overlap.
- Match intervals generate low/mid/high ranges; UNKNOWN remains unknown.
- Practical constraints remain outside technical points.
- Evidence Quality is a versioned weighted geometric mean, not hiring confidence.
- Every eligible maximum reconciles to 100; hidden adjustment is zero.

Fit Score is an evidence-based ranking score, not a hiring probability.

## JP-BW6 profile context

AI Fit V2.2 mathematics did not change. Public fixture receipts remain byte-stable. Local private analysis supplies a versioned context containing a structured profile hash, preference hash, evidence IDs, accepted work modes, locations, travel tolerance, local provider mode, model tag, and generation time. Gemma proposes evidence-backed match classes; deterministic code still allocates every micro-point and creates the receipt. Practical preferences affect Apply Priority and blocker state, never technical points. Raw resume text never enters the receipt.
