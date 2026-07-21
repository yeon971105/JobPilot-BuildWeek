# JobPilot Judge Guide — Impact RC

## Final competition video and public demo

The sole owner-approved competition video is `build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4` (SHA-256 `7b9c572379f0c131395aca8abfc739ac05b1d124393a9c8e8c6b881667aa1c32`). Its approved RC3 picture and AAC narration are preserved; English captions are burned into the image for guaranteed visibility, and the English soft-subtitle track remains available.

Review the matching public demo at <https://job-pilot-build-week.vercel.app>. The video has not been uploaded to YouTube and this Devpost entry remains a draft. The primary Codex `/feedback` Session ID is `019f7382-0ef9-7d10-bf26-d6e5615924dd`.

## JP-BW13 authentic impact review

Open `/demo/trust#directional-usability-study` or `/about/build-week#directional-usability-study`. The aggregate-only section shows median task time, factual accuracy, and clarity for five authentic participants. **View methodology** explains the synthetic roles, factual questions, decision alignment, anonymous local collection, and the fixed-order limitation. The public aggregate artifact is `build-week/bw13/authentic-study-aggregate.json`; participant CSVs are intentionally unlinked and untracked.

All participants completed the traditional posting condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference. Treat the results as directional usability evidence, not causal proof or hiring-outcome evidence.

## JP-BW12 product review focus

Open Northstar and choose **Application Strategy**. The default review is intentionally concise, uses human capability and evidence names, and keeps provenance, limitations, questions, and technical references collapsed. Primary-UI internal IDs and raw enums are zero. In Study Preview, complete the two-role flow and verify that Preview CSV and JSON remain visible at 320×700 and are labeled as excluded from participant evidence.

The primary path requires no login, key, database, Ollama installation, browser location permission, or real resume. All interactive judge roles and employer destinations are synthetic.

## Fast product path: about 90 seconds

1. Open `/` and read the neutral `DISCOVER → PRIORITIZE → UNDERSTAND → APPLY → TRACK` comparison.
2. Choose **See Today's 3 Roles**.
3. Confirm exactly three cards explain why they were selected and expose Fit Score, Evidence Quality, blocker state, distance or Remote, freshness, strongest match, biggest gap, and Apply Priority.
4. Open the first role's evidence, then return.
5. Choose **Apply on Employer Site ↗** and confirm the verified fictional destination opens in a safe new tab with no application form.
6. Save the role, open Tracker, and confirm the role is Saved—not Applied.

No hidden shortlist score exists. The exact policy appears below the cards. Distance, work mode, and freshness do not change technical Fit Score.

## Impact and production-reality path: 2–3 minutes

1. Open `/about/coverage`.
2. Confirm the required disclosure distinguishes synthetic judge roles from aggregate evidence in the larger acquisition system.
3. Inspect active jobs, California jobs, Bay Area and Los Angeles County memberships, active/complete sources, and the separately labeled recorded, reachable, and verified destination evidence.
4. Confirm that only `APPLY_DESTINATION_VERIFIED` says `Apply on Employer Site ↗`; recorded or reachable destinations say `Open Original Posting ↗`, and pending/unavailable states expose no link.
5. Confirm the page says the snapshot covers the processed catalog—not every role in a market.
6. Open `/about/build-week` and inspect the five `Observed → Reproduced → Repaired → Regression tested` proof moments.

## Trust and technical path: 4–6 minutes

1. Open `/demo/trust`; inspect the five-stage user journey and the neutral fragmented-search comparison.
2. Open **What GPT-5.6 Contributed**. Confirm four prepared artifacts show generation surface, model family, three hashes, valid evidence IDs, API requests `0`, and model final score `No`.
3. Read the concrete application-strategy and challenge examples.
4. Open `/demo/jobs/northstar-applied-ai-solutions-engineer`; inspect required/preferred evidence, relevant experience, practical constraints, and Score Proof.
5. Choose **Verify This Receipt**. Bundled status must be `FULLY_REPRODUCED`; a tampered displayed score must become `INVALID`.
6. Confirm the model never generates or mutates the score.

## Isolated study-harness review

The study route is intentionally not in primary product navigation. Open `/study/decision-utility` directly.

1. Read the consent screen; confirm no session ID or timer begins until **I consent and begin** is chosen.
2. Confirm the anonymous participant ID, task timer, and counterbalanced Raw Posting / JobPilot order.
3. Complete required-experience, preferred-experience, work-mode, biggest-gap, decision, confidence, and transparency fields.
4. Continue to the second condition and export local CSV/JSON.
5. Delete and reset; confirm local storage clears and consent is required again.
6. Confirm no name, email, resume, demographics, employment status, or health data is requested.

Actual participant count is `5`; status is `COMPLETE_MINIMUM`. Participant-level exports and the combined CSV remain local and untracked. Preview, Pilot, and browser-test Final rows remain excluded.

## Truthful claims

- Public candidate, roles, employer destinations, captures, and media are synthetic.
- The public-safe production snapshot reports aggregates only and claims processed-portfolio coverage, not complete market coverage.
- Gemma 4 12B is primary; deterministic code owns every score and receipt.
- GPT-5.6 artifacts are prepared, hash-bound, and provenance-verified—not live API inference.
- OpenAI API requests: `0`; OpenAI API cost: `$0`.
- Fit Score is not a hiring probability; independent hiring-outcome calibration is unavailable.
- JobPilot never submits an application.
- Authentic Study evidence is aggregate-only, directional, n=5, and carries the fixed-order limitation beside the metrics. No participant result was fabricated.

## Owner-review preview

Public review demo: <https://job-pilot-build-week.vercel.app>.

This is a development RC. Do not deploy, publish the video, submit Devpost, or create a final release tag without explicit owner approval.
