# Score Receipt Verifier

The independent verifier is available at `/demo/verify-receipt`, `POST /api/verify-receipt`, and `npm run verify:receipt -- <path>`.

It accepts one JSON object up to 1 MB, with maximum depth 14, maximum array length 600, maximum string length 12,000, maximum 25,000 values, and forbidden `__proto__`, `prototype`, and `constructor` keys. Content type and request length are bounded before interpretation.

Checks include receipt/scorer version, SHA-256 format, canonical hash, analysis status, hidden adjustments, Evidence Quality range, exact 100,000,000 micro-point allocation, class and capability reconciliation, low ≤ mid ≤ high ≤ maximum, Preferred/Nice/experience caps, budget transfers, displayed-score rounding, practical separation, job content hash, unique/known evidence IDs, and full frozen-source reproduction.

Statuses:

- `FULLY_REPRODUCED`: hash, arithmetic, evidence IDs, and frozen source inputs match exactly.
- `ARITHMETICALLY_VALID`: hash and arithmetic pass, but original source inputs are unavailable.
- `INVALID`: one or more schema, hash, arithmetic, cap, evidence, or source checks fail.
- `UNSUPPORTED_VERSION`: receipt version is outside the verifier contract.

All six frozen demo receipts fully reproduce. The verifier makes zero external requests and never needs raw or private resume text.
