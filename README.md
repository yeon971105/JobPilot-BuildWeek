# JobPilot — Evidence-First AI Job Search

> Know why a job fits before you apply.

JobPilot turns job descriptions into inspectable career decisions. It separates required and preferred qualifications, maps each match to evidence, shows practical constraints, and reconciles every eligible Fit Score to exactly 100 visible points. A Fit Score is an evidence-based ranking score, not a hiring probability.

## Local-first hybrid architecture

1. **Deterministic Code** parses explicit facts, unions experience months, normalizes aliases, allocates points, separates constraints, and creates the Score Receipt.
2. **Gemma 4 12B** is the primary semantic model for ambiguous requirements, capability grouping, evidence matching, equivalence, summaries, and uncertainty.
3. **GPT-5.6 Terra** is optional and restricted to explicit heavy reasoning: application strategy, independent critique, difficult ambiguity, and strategy comparison.
4. **Prepared output** keeps the synthetic judge flow reliable without Ollama or an OpenAI key and is never labeled live or fresh.

The deterministic scorer—not a model—calculates every score.

## Visual release candidate

The repaired production UI is certified at desktop, tablet, mobile, and 320px narrow-mobile widths. These captures come from the optimized Next.js build with the Tailwind v4 PostCSS pipeline active.

![JobPilot landing page visual RC](build-week/bw5/screenshots/post-landing-1440x900.jpg)

![JobPilot job discovery visual RC](build-week/bw5/screenshots/post-jobs-1440x900.jpg)

The visual-regression contract, computed-style evidence, responsive captures, accessibility results, and repaired-product video are indexed in [`build-week/bw5/`](build-week/bw5/).

## Quick Start

Prerequisites: Node.js 20+ and npm. The public synthetic demo does not require PostgreSQL, Ollama, an account, or an OpenAI key.

```bash
npm install
npm run build
npm run start
```

Open `http://localhost:3000`, select **Try the Demo**, and follow the no-login Golden Path.

Validation:

```bash
npm test
npm run typecheck
npm run lint
npm run validate:providers
```

Optional exact local Gemma validation—this never pulls or substitutes a model:

```bash
npm run validate:local-gemma
```

Optional GPT-heavy validation requires a server-side key and one enablement flag:

```bash
OPENAI_API_KEY=... OPENAI_HEAVY_FEATURES_ENABLED=true npm run validate:openai-heavy
```

When the key is absent, `validate:openai-heavy` exits with documented configuration-required code 78 and never prints a key.

## No-key judge mode

The checked-in `.env.example` defaults to:

```dotenv
AI_RUNTIME_MODE="LOCAL_FIRST"
OLLAMA_MODEL="gemma4:12b"
BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES="true"
BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS="false"
OPENAI_HEAVY_FEATURES_ENABLED="false"
BUILD_WEEK_ALLOW_LIVE_GPT56="false"
```

In this mode, all primary routes use a synthetic candidate, six fictional jobs, prepared Gemma analysis artifacts, AI Fit V2.2, prepared strategy/critique output, and browser-local tracker state. No production database or credentials are loaded.

## Judge flow

`Landing → Try Demo → Browse/Search/Filter → Open Role → Inspect Evidence and Experience → View Receipt → See a Score Change → Build Strategy → Save → Tracker → Trust Lab`

Required routes:

- `/`
- `/demo`
- `/demo/jobs`
- `/demo/jobs/[id]`
- `/demo/tracker`
- `/demo/trust`
- `/about/build-week`
- `/api/health`
- `/api/provider-status`

## Score contract

- CORE begins at 85 points.
- PREFERRED contributes at most 12; preferred experience at most 4.
- NICE_TO_HAVE contributes at most 3 and at most 1 per capability.
- Unused class capacity transfers visibly to CORE.
- Integer micro-point arithmetic and stable largest-remainder allocation reconcile eligible analyses to 100.
- Work mode, location, and travel never change technical-fit points.
- UNKNOWN is not a confirmed gap.
- Insufficient evidence never displays a numeric Fit Score.
- Hidden adjustments are always zero.

See [AI_SCORE_METHODOLOGY.md](AI_SCORE_METHODOLOGY.md) and [AI_SCORE_EVALUATION.md](AI_SCORE_EVALUATION.md).

## Provider labels

- `Local Gemma — Live`
- `Local Gemma — Prepared Analysis`
- `GPT-5.6 — Live Heavy Reasoning`
- `Prepared Demonstration Output`

A badge is rendered only when its state is true. Prepared output is never represented as live inference.

## Privacy

The repository contains only original synthetic candidate and job data. There is no resume upload, real candidate, production database, employer logo, protected-attribute scoring, auto-apply, or application submission. Actual private-user analysis is designed to remain on the local Ollama runtime. Build Week GPT-heavy requests use bounded synthetic/public-safe facts and IDs, never a full raw resume.

## Repository map

- `src/server/build-week/` — environment validation, provider routing, Gemma adapter, deterministic scorer, heavy schemas, and tests
- `src/components/demo/` — no-login judge interface
- `build-week/demo-data/` — frozen synthetic inputs and prepared analysis artifacts
- `build-week/bw3/` — hybrid contracts, validation, deployment, and release evidence
- `build-week/video/` — final recording package
- `build-week/devpost/` — account-ready submission package

## Limitations

Policy-based evidence score. Independent hiring-outcome calibration is not yet available. The public demo is intentionally synthetic and compact. Optional GPT-heavy features require server-side configuration. JobPilot does not predict employer decisions or submit applications.

## License

Code and original documentation are available under the [MIT License](LICENSE). Synthetic fixtures contain no third-party job text, resume, logo, or personal data.
