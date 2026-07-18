# JobPilot — Find the Roles Worth Your Time

Status: owner-review draft. Not submitted.

## Inspiration

Application fatigue is decision fatigue: repeat the same searches, open postings one by one, compare each role manually, hunt for an employer link, and maintain a separate tracker—without knowing which application deserves the next hour.

JobPilot connects that fragmented journey:

`DISCOVER → PRIORITIZE → UNDERSTAND → APPLY → TRACK`

## What it does

JobPilot brings nearby and Remote roles from a processed portfolio of official and rights-eligible employer sources into one profile-configured view. **Today's 3 Roles Worth Your Time** replaces an endless feed with three transparent next decisions selected by a published lexicographic policy: numeric eligibility, blocker state, Fit Score, Evidence Quality, distance or Remote, posting freshness, then stable job ID.

Every shortlisted role explains why it was selected and shows its strongest match, biggest gap, distance or Remote label, freshness, Evidence Quality, Apply Priority, Save action, and employer destination. No hidden shortlist score exists. Distance, work mode, and freshness never alter technical Fit Score.

Users can inspect required versus preferred qualifications, month-accurate relevant experience, exact evidence IDs, practical constraints, and an independently verifiable Score Receipt. JobPilot opens the fictional employer destination only after an explicit click and never fills or submits an application.

## Production reality, safely proven

The judge flow uses synthetic roles for privacy and reproducibility. One immutable read-only aggregate snapshot from the larger production acquisition system recorded, as of `2026-07-18T17:41:08.379Z`:

- 145,978 unique active catalog jobs;
- 13,164 unique California jobs;
- 6,426 San Francisco Bay Area and 1,108 Los Angeles County memberships;
- 473 active source endpoints, including 446 with a latest complete snapshot;
- 145,978 original posting records;
- 2,727 URLs with positive reachability evidence;
- 2,727 verified apply destinations.

Recorded, reachable, and verified are separate destination claims. These numbers describe the processed catalog and source portfolio, not the complete market. JP-41's earlier 2,808-row private-shadow generation and this later active catalog are different counting populations. Unique-job totals and market memberships are not added together. The public snapshot contains no job descriptions, candidate records, credentials, source URLs, private payloads, or database files.

## How it works

Gemma 4 12B is the primary semantic model for requirement extraction, capability grouping, candidate evidence matching, equivalence, summaries, and uncertainty. Deterministic AI Fit V2.2 owns the exact 100,000,000 micro-point allocation, experience union, Evidence Quality, practical priority, and receipt.

Four GPT-5.6 prepared reviews add bounded application strategy, challenge analysis, ambiguity review, and pairwise comparison. The product exposes each artifact's Codex generation surface, verifiable `gpt-5.6-sol` provenance, frozen input hash, output hash, file hash, valid evidence IDs, API request count `0`, and `model-generated final score: No`. Prepared reviews cannot silently change a score or receipt.

The submitted runtime made **0 OpenAI API requests** and incurred **$0 API cost**.

## Decision-utility study harness

An isolated `/study/decision-utility` route requires explicit consent, generates an anonymous random ID, counterbalances Raw Posting / JobPilot order, and collects required-experience, preferred-experience, work-mode, biggest-gap, Apply / Review / Skip, completion time, confidence, and transparency responses. Storage and CSV/JSON export remain local-only.

Status is **READY_NOT_RUN**. Actual participant count is **0**; minimum target is **5** and preferred target is **8–12**. The importer validates complete paired sessions and calculates the predeclared metrics and bootstrap intervals when sample size permits. Synthetic tooling validation is labeled and never represented as human results.

## Built with Codex

Codex helped create five memorable proof moments:

1. incorrect work-mode interpretation;
2. scoring-budget defect;
3. receipt and verifier construction;
4. missing Tailwind production pipeline;
5. dense Job Detail transformation.

Each public timeline entry shows `Observed → Reproduced → Repaired → Regression tested`. Codex also packaged the public-safe production query, shortlist policy, local-only study harness, responsive browser evidence, privacy scans, and release certificate.

## Neutral differentiation

Traditional job search often separates discovery, prioritization, explanation, employer handoff, and tracking. JobPilot connects those steps while preserving user control. It does not claim every job in a market, predict employer outcomes, attack named competitors, auto-apply, or hide ranking adjustments.

## Validation

The committed BW8 certificate covers typecheck, lint, all tests, production-coverage methodology, shortlist policy, distance/freshness score invariants, randomized study conditions, local-only storage, prepared provenance, production build, route matrix, responsive browser QA, accessibility, visual regression, dependency audit, secret scan, and private-data scan.

Required zero values include API requests/cost, invented production metrics, private records copied, raw descriptions exposed, fabricated study results, distance/freshness technical-score changes, invalid GPT evidence IDs, model-generated scores, receipt mismatches, hidden adjustments, application submissions, secrets, production mutations, console errors, and horizontal overflow.

## Limitations

Public candidate, roles, employer destination, captures, and media are synthetic. Production counts describe the processed source portfolio, not complete market coverage. Fit Score is not a hiring probability, and independent hiring-outcome calibration is unavailable. The decision-utility study has not run with humans. JobPilot never submits applications.

## Demo and owner actions

Primary path: Landing → Today's Shortlist → Job Detail → Employer Destination → Tracker → Coverage Proof → Trust Lab → Build Week.

Current local video: `build-week/video/jobpilot-winning-rc1-demo.mp4` (175 seconds). The owner must review the port-3205 preview, publish the video, add approved public URLs, and submit Devpost. This development RC has not deployed or submitted itself.
