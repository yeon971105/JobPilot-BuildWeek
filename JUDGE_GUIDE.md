# Judge Guide

The judge path requires no login, key, database, Ollama installation, browser location permission, or real resume.

## Fast path: approximately 90 seconds

1. Open `/` and select **Start the 90-Second Tour**.
2. Advance through `DISCOVER`, `PRIORITIZE`, `UNDERSTAND`, `INSPECT`, `VERIFY`, `APPLY`, and `TRACK`.
3. Confirm the completion card lists Nearby discovery, Resume-aware prioritization, Required vs. preferred, Relevant experience, Exact score mathematics, Direct employer destination, and No auto-apply.

The tour is optional, skippable, restartable, keyboard accessible, screen-reader labeled, and mobile safe.

## Full product path: 4–6 minutes

1. Select **See My Best Matches**. Confirm the context says Demo Candidate A near Oakland, California.
2. Change **Sort roles** to Nearest, Most Recent, and Highest Evidence Quality. Try the radius and Remote compatible filters.
3. Select Northstar and Alder with **Compare role**, then choose **Compare now**. No aggregate comparison score appears.
4. Open Northstar. Inspect one top match and one gap. Exact job evidence, candidate evidence ID, aliases, verifier, uncertainty, and points appear in the modal.
5. Open **Experience**. Confirm Preferred, 3+ requested years, 3.45 relevant years, six overlap months removed, and 3.60 / 4.00 points.
6. Open **Evidence**, choose **Challenge This Analysis**, and confirm **GPT-5.6 — Prepared Review**, `OpenAI API requests: 0`, and `Direct score changes: 0`.
7. Open **Score Proof**, then **Verify This Receipt**. Bundled status is `FULLY_REPRODUCED`. Change `displayedScore` in the JSON without changing the hash and verify that status becomes `INVALID`.
8. Return to Northstar and select **Apply on Employer Site ↗**. Inspect `_blank` handoff behavior, the fictional-employer disclosure, zero forms, and the disabled Continue application button.
9. Choose **Mark as Preparing**, return, and open Tracker. Preparing is 1; Applied is 0.
10. Open Trust Lab. Inspect the six-step decision chain and the score, Gemma, prepared GPT-5.6, privacy, and limitations tabs.

## Truthful claims

- Public candidate, jobs, employer destination, resume fixture, captures, and media are synthetic.
- Discovery covers the processed official-source portfolio, not the whole market.
- Gemma 4 12B is the primary semantic model; deterministic code owns the score.
- GPT-5.6 reviews were prepared in the verified Codex task from frozen synthetic evidence.
- OpenAI API requests: 0. OpenAI API cost: $0.
- The score is not a hiring probability; independent hiring-outcome calibration is unavailable.
- JobPilot never submits an application.

Preview for this release: `http://127.0.0.1:3204` while the owner keeps the local preview running.
