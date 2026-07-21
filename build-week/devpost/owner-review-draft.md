# JobPilot: Devpost owner-review draft

## Submission details

- **Project name:** JobPilot
- **Tagline:** Find the roles worth your time.
- **Track:** Apps for Your Life
- **Submission type:** Solo submission
- **Owner:** Jewon Yeon
- **Team members:** No additional team members
- **Repository:** https://github.com/yeon971105/JobPilot-BuildWeek
- **Public demo:** https://job-pilot-build-week.vercel.app
- **Codex Session ID:** `019f7382-0ef9-7d10-bf26-d6e5615924dd`
- **YouTube:** `PENDING_OWNER_UPLOAD` (local draft placeholder only; never copy this into a submitted form)

Status: owner-review draft only. It has not been submitted to Devpost.

## Inspiration

I built JobPilot after noticing that job search fatigue is usually decision fatigue. A person repeats searches, opens postings one by one, compares each role with their experience, finds the employer destination, and keeps a separate tracker, yet still does not know which application deserves the next hour.

## What it does

JobPilot gives a job seeker three transparent next decisions instead of another long feed. It explains why each role appears, separates required from preferred qualifications, shows relevant experience and practical constraints, opens a clearly labeled synthetic employer destination, and keeps planning state in the browser.

The public demo uses one synthetic profile and six synthetic roles. It does not auto-apply, submit an application, accept a public resume, or claim complete-market coverage.

## How it works

The shortlist follows a published deterministic order. Job Detail starts with a plain-language decision, then lets the person open evidence, experience, practical-fit, and score proof only when needed. The browser-local tracker changes state only after an explicit action.

The public deployment uses cached analysis and synthetic data. It needs no account, database, API key, or Ollama installation.

## How Codex was used

I used Codex throughout the Build Week extension to build, debug, and test the Golden Path, nearby discovery, private resume boundary, receipt verifier, destination trust states, progressive proof surfaces, coverage freeze, study workflow, and release evidence.

Codex also helped me investigate concrete defects. The public defect timeline records the observed issue, reproduction, repair, and regression test for score allocation, receipt verification, production CSS, and dense Job Detail behavior. The owner-confirmed `/feedback` Session ID is `019f7382-0ef9-7d10-bf26-d6e5615924dd`.

## How GPT-5.6 was used

GPT-5.6 Sol contributed four prepared artifacts through Codex: application strategy, independent challenge, ambiguity review, and role comparison. Each artifact is tied to frozen synthetic inputs, hashes, and allowed evidence IDs.

Those artifacts are not live runtime calls. GPT-5.6 does not calculate Fit Score, modify the deterministic score, or receive a real resume in the public demo.

## Technical architecture

Gemma 4 12B is the primary local semantic model for bounded role interpretation and evidence matching. Deterministic AI Fit V2.2 calculates every final score, including exact micro-point arithmetic, caps, experience union, practical separation, and Score Receipt data.

The Score Receipt verifier has web, API, and CLI paths that reproduce canonicalization, hashes, and score arithmetic. A tampered receipt fails closed. Private Resume Mode is local-only: the public deployment rejects uploads, while the local edition keeps confirmed structured evidence browser-local before loopback-only model use.

## Challenges

The hard part was making proof available without making every judge read a technical ledger first. I also needed to keep semantic interpretation, prepared GPT review, deterministic scoring, and practical constraints visibly separate.

Another constraint was showing production reality without shipping private job rows, resumes, or credentials. The public interface uses synthetic data, while the coverage page exposes only frozen aggregate evidence. The study workflow had to collect authentic, no-PII usability evidence without letting dry-run rows enter the result.

## Accomplishments

- A no-login decision path from landing page to shortlist, role detail, employer handoff, and browser-local tracking.
- Deterministic scoring with an independently verifiable Score Receipt.
- A local-first privacy boundary and a public-safe cached review mode.
- Prepared, provenance-bound GPT-5.6 Sol review artifacts with no live public API use.
- A frozen aggregate coverage snapshot and explicit destination trust states.
- **132 tests passed**, **2 authorized skips**, **0 lint errors**, **0 lint warnings**, **2 / 2 CSS pipeline checks passed**, and **0 production dependency vulnerabilities**.

## What I learned

Trust improves when the user sees a useful decision first and can inspect proof at the right moment. I learned to make model boundaries explicit, keep consequential arithmetic deterministic, and state what a small study cannot prove as clearly as what it observed.

## Directional usability evidence

Five authentic, moderated participants completed `jobpilot-decision-utility.v2`. Five files were accepted, zero were rejected, ten human rows were analyzed, and no fabricated or dry-run row was counted as a person. Median task time was 39 seconds with a traditional posting and 18 seconds with JobPilot. Factual accuracy was 75% and 100%, confidence was 3.8 and 6.0 out of 7, and clarity was 3.6 and 6.2 out of 7.

All participants completed the traditional condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference.

Role assignment was counterbalanced, but condition order was fixed: every participant completed Traditional first and JobPilot second. This is directional usability evidence from a small sample, not causal proof, a general accuracy claim, or evidence of hiring outcomes. Participant-level records remain local and untracked.

## Limitations

The public candidate, roles, employer destinations, captures, and video are synthetic. Coverage describes a processed official-source portfolio, not every role in a market. Fit Score is not a hiring probability, and JobPilot has no hiring-outcome calibration.

The public demo uses cached preparation rather than live local model calls. Private resume processing is available only in the local edition. The study is a fixed-order `n=5` usability observation with no confidence interval or statistical-significance claim.

## What is next

The remaining release steps are operational: upload the approved RC4 video as Public or Unlisted, verify playback while logged out, add the actual URL to the final Devpost form, run the final preflight, and submit after owner approval. I will not add a fabricated video URL or submit this draft before those checks are complete.
