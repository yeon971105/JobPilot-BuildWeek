# JobPilot — Devpost owner-review draft

## JP-BW13 authentic impact update

Five authentic Final sessions reached the minimum sample for a moderated directional usability study. Median task time was 39 seconds with a traditional posting and 18 seconds with JobPilot. Factual accuracy was 75% versus 100%; average confidence was 3.8 versus 6.0 out of 7, and clarity was 3.6 versus 6.2 out of 7.

All participants completed the traditional condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference. These results are directional usability evidence, not causal proof, population inference, or hiring-outcome evidence.

## JP-BW12 owner-polish foundation

JobPilot now translates all machine IDs and enums before they reach primary UI. The concise Application Strategy answers whether to act, why, what to emphasize, what to prepare, and what to clarify, while grounded evidence, prepared GPT-5.6 provenance, and limitations remain available on demand. Prepared output is not live inference and does not change AI Fit V2.2.

The Decision Utility Study auto-saves locally and exports anonymous phase-labeled CSV and JSON. Factual accuracy and decision alignment are separate. Preview, Pilot, and browser-test Final exports are excluded from participant analysis. Five authentic Final sessions passed validation; participant-level files remain local and untracked.

Final competition video: `build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4` (SHA-256 `7b9c572379f0c131395aca8abfc739ac05b1d124393a9c8e8c6b881667aa1c32`). RC4 preserves the approved Vercel visual sequence and ElevenLabs narration, and burns the approved English captions directly into the image. The unlisted YouTube URL remains pending authenticated upload. This text remains a draft and must not be submitted before owner approval.

Status: **Draft only. Not submitted.**

## Tagline

Find the roles worth your time—and see exactly why before you apply.

## Category

Apps for Your Life

## Short description

JobPilot turns application fatigue into a transparent decision loop: discover nearby and Remote roles, prioritize three next decisions, understand the evidence, open the original employer destination, and track progress locally—without auto-apply or hidden score adjustments.

## Inspiration and problem

Application fatigue is decision fatigue. A job seeker repeats searches, opens postings one by one, manually compares each role with their experience, hunts for the real employer destination, and maintains a separate tracker—yet still does not know which application deserves the next hour.

JobPilot connects that fragmented journey:

`DISCOVER → PRIORITIZE → UNDERSTAND → APPLY → TRACK`

## What it does

### Final product RC experience

The public landing is now distinct from the app home. The landing explains the job-seeker value first; **For You** shows three focused roles with **Why these three?** visible above the cards. Job Detail makes the plain-language conclusion primary, then uses five visual fit dimensions, a relevant-experience comparison, practical-fit cards, grouped evidence, and visual Score Proof. Exact quotes and micro-point mathematics remain available through progressive disclosure and the collapsed Technical Ledger.

The final RC adds restrained motion with a complete Reduced Motion fallback, intentional loading/empty/success/error states, a compact tracker with Undo, and the isolated `jobpilot-decision-utility.v2` study. Study V2 uses two different fictional roles, counterbalances Raw Posting and JobPilot conditions, requires primer comprehension, and rejects PREVIEW, PILOT, same-role, or unauthenticated rows from final evidence.

The no-login public review uses six synthetic roles and one synthetic candidate. **Today’s 3 Roles Worth Your Time** replaces an endless feed with three transparent next decisions. The shortlist follows a published lexicographic order—numeric eligibility, blocker state, Fit Score, Evidence Quality, distance or Remote, freshness, then stable job ID—and exposes its rationale without a hidden shortlist score.

Nearby discovery starts from profile-configured location and work-mode preferences. Job Detail separates required from preferred qualifications, calculates non-overlapping relevant experience by month, shows strongest matches and biggest gaps, and keeps practical constraints outside technical Fit Score. Comparison supports up to three roles.

When a user chooses to continue, JobPilot opens the original employer destination under an explicit trust state. The public synthetic destination disables submission. Returning never marks a role Applied; tracker changes require a deliberate browser-local action.

## How it works

Gemma 4 12B is the primary semantic model for role extraction, capability grouping, candidate evidence matching, equivalence, summaries, and uncertainty. Private Resume Mode runs only in the local edition: PDF, DOCX, or TXT is parsed in memory, confirmed structured evidence stays browser-local, and only that evidence can reach loopback Ollama.

Deterministic AI Fit V2.2 owns the exact 100,000,000 micro-point allocation, class caps, transfer rules, non-overlapping experience union, Evidence Quality, practical priority, and Score Receipt. The web/API/CLI verifier independently reproduces canonicalization, arithmetic, evidence IDs, source hashes, and the final receipt hash. A tampered receipt fails closed.

Four `gpt-5.6-sol` outputs were prepared through Codex from frozen synthetic evidence: application strategy, independent challenge, ambiguity review, and pairwise comparison. Every artifact records the generation surface, frozen input hash, output hash, file hash, and valid evidence IDs. Prepared output is never labeled live and never generates or modifies a numeric score.

The public runtime makes **0 OpenAI API requests** and incurs **$0 OpenAI API cost**.

## How Codex was used

Codex built and regression-tested the product across the Build Week sequence, including the Golden Path, deterministic scorer, nearby discovery, private resume boundary, Score Receipt Verifier, progressive proof disclosure, destination trust states, public-safe coverage freeze, Decision Utility harness, and release evidence.

The public defect timeline shows five concrete `Observed → Reproduced → Repaired → Regression tested` moments: work-mode interpretation, scoring-budget allocation, receipt verification, the Tailwind production pipeline, and dense Job Detail UX. The representative Codex task is identified in the owner package; its primary `/feedback` Session ID is `019f7382-0ef9-7d10-bf26-d6e5615924dd`.

## Production reality

The public UI remains synthetic, but a read-only immutable snapshot of the processed official-source portfolio recorded 145,978 unique active jobs, 13,164 California jobs, 6,426 Bay Area memberships, 1,108 Los Angeles County memberships, 473 active official-source endpoints, 446 latest complete snapshots, 145,978 original posting records, 2,727 reachable URLs, and 2,727 verified apply destinations.

These are processed-portfolio counts, not complete-market coverage. Unique-job totals and regional memberships are different counting populations and are never added. Recorded, reachable, and verified destination claims remain separate.

## Challenges

- Making a sophisticated evidence model understandable without forcing judges to read technical proof first.
- Keeping deterministic scoring, semantic interpretation, prepared GPT review, and practical constraints visibly separate.
- Proving production reach without exposing job rows, private URLs, candidate records, credentials, or the acquisition database.
- Preserving user control at the employer handoff and preventing any automatic Applied transition.
- Creating authentic usability evidence without inventing participants or letting dry-run rows enter the human dataset.

## Potential impact — directional usability study

In a moderated directional usability study with five participants, median task time was 18 seconds with JobPilot versus 39 seconds with a traditional posting. Factual accuracy was 100% versus 75%, while average confidence increased from 3.8 to 6.0 out of 7 and clarity increased from 3.6 to 6.2 out of 7. All participants completed the traditional condition first and JobPilot second, so the results are directional and may include an order effect. The minimum sample was achieved; no participant-level record is public.

## Accomplishments

- One concise decision path from shortlist through employer destination and local tracking.
- Exact micro-point scoring with an independently verifiable receipt.
- Gemma-first private local architecture with a fully usable cached public review mode.
- Four provenance-bound prepared GPT-5.6 reviews with zero API runtime.
- Frozen aggregate production-coverage evidence and honest destination trust states.
- 117 passing tests plus two authorized browser-only skips, two passing production-CSS tests, and 40/40 route–viewport browser checks.
- A no-PII, two-role counterbalanced Decision Utility Study V2 harness with validator, combiner, analysis pipeline, and strict pilot exclusion.

## Lessons learned

Trust improves when proof is progressive: the user first gets a decision, then an explanation, then exact evidence and reproducible arithmetic. AI adds the most value when semantic interpretation has a strict contract and deterministic code retains ownership of consequential calculations. Product impact must remain separate from hiring outcomes; usability can be measured without pretending to predict employment success.

## Privacy and safety

The public review requires no account, production database, OpenAI key, Ollama, real resume, or browser location permission. It contains only synthetic candidate/job data and aggregate coverage evidence. The hosted resume route rejects uploads before parsing and explains local setup. JobPilot collects no application form and never submits an application.

## Limitations

Public candidate, roles, employer destinations, captures, and video are synthetic. Coverage describes the processed portfolio, not the complete market. Fit Score is not a hiring probability. Independent hiring-outcome calibration is unavailable. The Decision Utility result is a small fixed-order directional usability study with five participants, not causal or population evidence.

## Build Week extension

During Build Week, JobPilot extended the existing acquisition and scoring foundation with the no-login Golden Path, application-fatigue story, nearby discovery, transparent three-role shortlist, private resume isolation, concise Job Detail, comparison, safe employer handoff, local tracker, Score Receipt verification, prepared GPT-5.6 review surfaces, judge tour, Trust Lab, Codex defect timeline, frozen coverage proof, and authentic Decision Utility workflow.

## Technologies

Codex, GPT-5.6 (`gpt-5.6-sol`, prepared), Gemma 4 12B (`gemma4:12b`), deterministic TypeScript scoring, Next.js 16.2.6, React 19, TypeScript, Tailwind CSS 4, Ollama for the local edition, Vitest, Playwright-compatible browser QA, SHA-256, CSV, JSON, and the Vercel public-review deployment.

## Links and testing

- Repository: https://github.com/yeon971105/JobPilot-BuildWeek
- Public owner-review URL: https://job-pilot-build-week.vercel.app
- Final competition video: `build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4` (owner-approved; YouTube upload still pending)
- Unlisted YouTube URL: pending authenticated upload and logged-out verification
- Codex `/feedback` Session ID: 019f7382-0ef9-7d10-bf26-d6e5615924dd

Testing path: open the landing page, choose **See My Best Matches**, read **Why these three?**, inspect Northstar’s Overview, Evidence, Experience, Score Proof, and Technical Ledger, verify its receipt, tamper with the receipt, open the synthetic employer destination, return and explicitly move a saved role, then open Trust Lab. The Study Preview route is isolated at `/study/decision-utility?mode=preview`; Preview and Pilot sessions are excluded from human evidence.

## Team information

Single-entrant project. The authenticated Devpost profile and final owner-visible team label must be confirmed in the draft before submission.
