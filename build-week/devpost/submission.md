# JobPilot — Evidence-First AI Job Search

## Tagline

Know why a job fits before you apply.

## Category

Apps for Your Life

## Inspiration

Job seekers spend limited time reading long listings and are often given opaque AI match scores. A number without evidence does not help someone decide where to focus.

## What it does

JobPilot turns a role into inspectable decision support: role summary, required versus preferred qualifications, practical constraints, candidate evidence, missing or weak evidence, deterministic score buckets, and a grounded apply/review/skip strategy. The Build Week flow is no-login and uses only original fictional data.

## How it works

The score is calculated by deterministic versioned code. The visible maximum reconciles to 100, with no hidden adjustment. In hosted Build Week mode, GPT-5.6 receives compact synthetic candidate evidence, job facts, deterministic components, and internal IDs through the Responses API Structured Outputs interface. Output is rejected unless every candidate and job claim maps to a known ID. GPT-5.6 never supplies the final Fit Score or an application submission.

## How Codex was used

Codex implemented the no-login synthetic demo, original demo data, provider abstraction, evidence-first UI, grounding validation, quota/error controls, tests, documentation, and release materials. Earlier JobPilot catalog and product work is documented separately as pre-Build-Week foundation.

## Challenges

The hardest constraint was delivering meaningful hosted AI while preserving deterministic scoring, privacy boundaries, and truthful feature status. The release therefore keeps fixture output visibly labelled and does not falsely represent it as GPT-5.6.

## Accomplishments

The demo makes a job-fit decision auditable rather than merely numerical. It works without a local 12B model, account, personal resume, or application submission.

## What we learned

Structured output is most useful when it is coupled with narrow input, explicit internal IDs, and deterministic post-validation. It lets generative strategy coexist with a transparent scoring policy.

## What is next

Complete the server-side GPT-5.6 deployment verification, public repository and demo publishing, video recording, and independent outcome calibration. The score remains an evidence-based ranking score, not a hiring probability.

## Technologies used

Next.js, React, TypeScript, Tailwind CSS, Prisma/PostgreSQL foundation, OpenAI Responses API Structured Outputs, Ollama private local mode, Vitest, Codex.

## Links and access

- Demo URL: `PENDING_DEPLOYMENT`
- Video URL: `PENDING_YOUTUBE_UPLOAD`
- Repository URL: `PENDING_REPOSITORY_PUBLICATION`
- Testing: see `build-week/judge-testing-instructions.md`
- Codex /feedback Session ID: `CODEX_FEEDBACK_ACTION_REQUIRED`

## Privacy and limitations

The Build Week demo contains synthetic data only. It does not upload a resume, expose an API key, call a local model from the browser, auto-apply, or claim complete market coverage. Independent hiring-outcome calibration is not yet available.
