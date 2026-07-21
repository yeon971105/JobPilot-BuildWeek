# JobPilot

**Find the roles worth your time.**

JobPilot helps a job seeker decide where to spend the next hour. Its public demo turns a small set of synthetic roles into a transparent decision path: discover, prioritize, understand the evidence, open a synthetic employer destination, and track a deliberate next step. It never auto-applies.

**Public demo:** <https://job-pilot-build-week.vercel.app>

**Repository:** <https://github.com/yeon971105/JobPilot-BuildWeek>

## Fastest review path

Use the public Vercel demo. It needs no login, API key, Ollama installation, real resume, or account. The public roles and profile are synthetic, cached analyses are used, and no live OpenAI runtime call is made.

1. Open the [landing page](https://job-pilot-build-week.vercel.app).
2. Choose **See My Best Matches** to open [For You](https://job-pilot-build-week.vercel.app/demo/shortlist).
3. Open [Harbor Product Data Analyst](https://job-pilot-build-week.vercel.app/demo/jobs/harbor-product-data-analyst), then inspect **Application Strategy** and **Score Proof**.
4. Verify the bundled receipt at [Score Receipt Verifier](https://job-pilot-build-week.vercel.app/demo/verify-receipt), then alter a displayed value to confirm the receipt becomes `INVALID`.

## Authentic moderated directional usability study

Protocol: `jobpilot-decision-utility.v2`

Status: `COMPLETE_MINIMUM`

Participants: **5 authentic, moderated participants**

Accepted / rejected files: **5 / 0**

Human rows: **10**
Fabricated or dry-run rows counted as human evidence: **0**

The traditional posting median task time was **39 seconds**; the JobPilot median was **18 seconds**. Traditional factual accuracy was **75%** and JobPilot factual accuracy was **100%**. Mean confidence was **3.8 / 7** versus **6.0 / 7**, and mean clarity was **3.6 / 7** versus **6.2 / 7**.

All participants completed the traditional condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference.

Role assignment was counterbalanced, but condition order was not: every participant completed Traditional first and JobPilot second. This small `n=5` result is authentic, moderated, and directional usability evidence only. It is not causal, statistically significant, representative, or a hiring-outcome result. The combined participant data remains local and untracked; only aggregate evidence is public. See the [aggregate report](build-week/bw13/authentic-study-report.md), [methodology](build-week/bw13/study-methodology.md), [claim contract](build-week/bw13/study-claim-contract.json), and [aggregate](build-week/bw13/authentic-study-aggregate.json).

## Architecture and safety boundary

- **Gemma 4 12B** is the primary local semantic model for bounded role interpretation, evidence matching, equivalence, summaries, and uncertainty.
- **Deterministic AI Fit V2.2** calculates every final score, including micro-point allocation, class caps, experience rules, practical separation, and the Score Receipt.
- **GPT-5.6 Sol** contributed prepared application strategy and critique artifacts through Codex from frozen synthetic evidence. It does not calculate Fit Score and is not live public-runtime inference.
- **Codex** was the primary development, debugging, repair, testing, and release-evidence surface.
- **Score Receipt** web, API, and CLI verification independently reproduce the deterministic result and fail closed on tampering.

Fit Score is not a hiring probability. Public roles and profiles are synthetic. Private resume processing is local-only: the public deployment accepts no resume upload, and the local edition keeps confirmed structured evidence browser-local before loopback-only Gemma use. The submitted runtime made **0 OpenAI API requests** at **$0 runtime cost**.

## Local public-review setup

Use Node **22.12-22.x LTS** or **Node 24+**. Do not use Node 20.0-20.18 or Node 23 for this project. Start from a clean clone, then run the following in one PowerShell session. Do not copy `.env.example`: it is for the local private-mode workflow and is not the safe public-review configuration.

```powershell
npm ci

# Synthetic public-review runtime: no Ollama, no OpenAI API, no real-resume path.
$env:AI_RUNTIME_MODE = "LOCAL_FIRST"
$env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"
$env:OLLAMA_MODEL = "gemma4:12b"
$env:OLLAMA_ENABLED = "false"
$env:LOCAL_PRIVATE_MODE = "false"
$env:OPENAI_HEAVY_FEATURES_ENABLED = "false"
$env:OPENAI_HEAVY_MODEL = "gpt-5.6-sol"
$env:OPENAI_API_KEY = ""
$env:BUILD_WEEK_DEMO_MODE = "true"
$env:BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES = "true"
$env:BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS = "false"
$env:BUILD_WEEK_ALLOW_LIVE_GPT56 = "false"

# Immutable local-build metadata. These are public identifiers, not secrets.
$env:JOBPILOT_APPROVED_PRODUCT_COMMIT = (git rev-parse HEAD).Trim()
$env:JOBPILOT_DEPLOYMENT_COMMIT = (git rev-parse HEAD).Trim()
$env:JOBPILOT_RELEASE_TAG = "local-public-review"
$env:JOBPILOT_DEPLOYMENT_ENVIRONMENT = "public-review"
$env:JOBPILOT_DEPLOYED_AT = (Get-Date).ToUniversalTime().ToString("o")
```

Run the development server with:

```powershell
npm run dev -- --webpack
```

Then open `http://localhost:3000`. This is a local development address only; the current public demo remains <https://job-pilot-build-week.vercel.app>.

Run the public-safe validation path with:

```powershell
npm run typecheck
npm run lint
npm test
npm run test:css-pipeline
npm run validate:providers
npm run verify:receipt -- build-week/bw7/receipts/northstar-demo-receipt.json
npm audit --omit=dev
```

Build and serve the Vercel-compatible Next.js application with the same environment variables still set:

```powershell
npm run build:next -- --webpack
npm run start
```

`next.config.ts` requires all five `JOBPILOT_*` metadata variables so `/api/version` can identify a build truthfully. A local clone uses its checked-out SHA and local build timestamp; those values are not a claim about the deployed Vercel build. The public deployment exposes its own immutable product and deployment commits at `/api/version`. `npm run build` is an optional Cloudflare/OpenNext packaging path, not the primary Vercel-compatible command above.

## Validation and release facts

The reconciled pre-upload validation target is:

- TypeScript: **PASS**
- Lint: **0 errors, 0 warnings**
- Tests: **132 passed, 2 authorized skips**
- Production CSS pipeline: **2 / 2 passed**
- Certified Webpack CSS SHA-256: `a4baf28d0be10d4effa3bf91165f2118aeb2169596b9796850b1fa37e7365355`
- Production dependency vulnerabilities: **0**

The sole competition video is [`build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4`](build-week/video/jobpilot-vercel-elevenlabs-final-rc4-burned-captions.mp4). It is 173.133333 seconds, H.264/AAC at 1920x1080 and 30 fps, with burned English captions and an embedded English subtitle track. SHA-256: `7b9c572379f0c131395aca8abfc739ac05b1d124393a9c8e8c6b881667aa1c32`. The approved standalone captions are [`build-week/video/jobpilot-vercel-elevenlabs-final-rc3.srt`](build-week/video/jobpilot-vercel-elevenlabs-final-rc3.srt), SHA-256 `812d733c925cc1cfdf99d9b628ba97d7986ac28802ffa7af069e90489d41c5c0`.

## Product and evidence links

- [Judge Guide](JUDGE_GUIDE.md)
- [Score Receipt Verifier guide](SCORE_RECEIPT_VERIFIER.md)
- [Private Resume Mode](PRIVATE_RESUME_MODE.md)
- [Architecture](ARCHITECTURE.md), [Privacy](PRIVACY.md), and [zero-API GPT-5.6](ZERO_API_GPT56.md)
- [Public coverage methodology](build-week/bw9/coverage-methodology.md)
- [Final RC4 metadata](build-week/video/jobpilot-vercel-elevenlabs-final-rc4-metadata.json)
- [Canonical YouTube upload metadata](build-week/video/jobpilot-final-rc4-youtube-metadata.md)
- [Devpost owner-review draft](build-week/devpost/owner-review-draft.md)

## Codex feedback record

The primary Build Week task is **Finalize JobPilot product UX**. The owner-confirmed Codex `/feedback` Session ID is `019f7382-0ef9-7d10-bf26-d6e5615924dd`. It is a Codex feedback identifier, not a Git commit, repository identifier, or Vercel deployment identifier. See [`build-week/codex-session.json`](build-week/codex-session.json).

## Submission boundary

This is a solo submission by **Jewon Yeon** with no additional team members. The RC4 video has not been uploaded to YouTube, and the Devpost draft has not been submitted. No submitted-final tag exists. The remaining submission actions are limited to an owner upload and logged-out playback check, inserting the actual YouTube URL into the final Devpost form, performing the final preflight, and submitting.
