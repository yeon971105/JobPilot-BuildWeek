# JobPilot — Evidence-First AI Job Search

> Know why a job fits before you apply.

Job seekers often get opaque match scores after reading long job descriptions. JobPilot makes the decision inspectable: it separates required and preferred qualifications, connects each displayed match to evidence, shows practical constraints, and calculates the Fit Score with deterministic versioned code. Fit Score is an evidence-based ranking score, not a hiring probability.

## Build Week demo

Category: **Apps for Your Life**. The no-login Build Week demo uses original synthetic candidate and job data. It is available locally at `/`, `/demo`, `/demo/jobs`, `/demo/jobs/[id]`, and `/demo/tracker`.

- Browse six fictional roles spanning remote, hybrid, and onsite work.
- Inspect responsibilities, requirements, evidence IDs, practical constraints, score components, and limitations.
- Save and remove roles from a session-local tracker.
- Use **Build My Application Strategy**. When `BUILD_WEEK_GPT56` is enabled, the server calls GPT-5.6 through the Responses API with Structured Outputs. The strategy must cite known requirement and evidence IDs; the model cannot calculate a score, invent candidate experience, or submit an application.
- Without a configured hosted key, a separate **Fixture preview** is available and visibly labelled `FIXTURE_ONLY`. It is never presented as a GPT-5.6 result.

## Screenshot / preview

Run the demo locally and record `/demo/jobs/northstar-applied-ai-solutions-engineer` for the intended evidence-first product view. The checked-in demo uses only original text and visual styling; it includes no employer logo, real resume, or copied job description.

## How Codex and GPT-5.6 were used

Codex was used to build the Build Week extension: synthetic demo mode, provider abstraction, deterministic evidence UI, grounded strategy validation, rate limiting, tests, release documentation, and submission packaging. GPT-5.6 is reserved for a bounded server-side application-strategy request in Build Week mode. The request consumes only synthetic job and candidate data, deterministic score components, and internal IDs. GPT-5.6 does not return the final Fit Score.

## Architecture

```text
Synthetic demo catalog + candidate evidence
                │
                ├── deterministic evidence and score display (100 visible points)
                │
                └── Build My Application Strategy
                      ├── BUILD_WEEK_GPT56 → Responses API + JSON Schema
                      ├── PRIVATE_LOCAL → Ollama gemma4:12b (Beta, private mode)
                      └── FIXTURE_ONLY → labelled offline preview
```

## Scoring boundaries

The latest valid scorer keeps Core, Preferred, and Nice-to-Have budgets visible. Preferred contributes at most 12 maximum points, Preferred Experience at most 4, Nice-to-Have at most 3, and hidden adjustment is always zero. A completed numeric result must reconcile to 100 visible maximum points. Unknown evidence is not silently treated as a confirmed gap, and work mode/travel are displayed as practical constraints rather than hidden technical-fit deductions.

Policy-based evidence score. Independent hiring-outcome calibration is not yet available.

## Private Local Mode and Build Week Demo Mode

| Mode | Provider | Data | Status |
| --- | --- | --- | --- |
| `PRIVATE_LOCAL` | Ollama `gemma4:12b` | private local analysis | Beta; current performance holds remain |
| `BUILD_WEEK_GPT56` | OpenAI Responses API, `gpt-5.6-terra` | synthetic public-demo content only | enabled only with explicit server environment configuration |
| `FIXTURE_ONLY` | deterministic fixture | tests and video fallback | visibly labelled; never live GPT-5.6 |

## Quick start

Prerequisites: Node.js 20+, npm, and PostgreSQL only if you want non-demo product routes. The synthetic Build Week demo itself does not require a database, user account, or Ollama model.

```bash
npm install
npm run demo:setup
npm run dev
```

Open `http://localhost:3000/demo`.

Validate the demo contract:

```bash
npm run demo:validate
npm run typecheck
npm run build
```

## Environment variables

Copy `.env.example` to `.env`. Never commit it.

```bash
BUILD_WEEK_DEMO_MODE="true"
BUILD_WEEK_ALLOW_LIVE_GPT56="false"
OPENAI_BUILD_WEEK_MODEL="gpt-5.6-terra"
OPENAI_API_KEY="" # server-side only
AI_PROVIDER="FIXTURE_ONLY"
OLLAMA_BASE_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="gemma4:12b"
```

For a hosted GPT-5.6 demo, configure `OPENAI_API_KEY` and set `BUILD_WEEK_ALLOW_LIVE_GPT56=true` only in server-side deployment settings. The route has a timeout, an in-memory per-IP daily request limit, and a safe quota/error response. Do not send real private resumes to this hosted demo path.

## Synthetic demo data

The original fictional dataset is in [`build-week/demo-data`](build-week/demo-data). It includes no real person, email address, telephone number, address, employer logo, copied job posting, or private source payload.

## Testing and health

- `npm run demo:validate` — synthetic data, score reconciliation, fixture grounding, and provider-mode tests.
- `npm test` — existing project suite.
- `npm run typecheck` — TypeScript validation.
- `npm run build` — production build.
- `GET /api/health` — non-sensitive Build Week demo health/status endpoint.

## Supported platforms

The demo is designed for modern desktop and mobile browsers. Required QA viewports are 1440×900, 1024×768, and 390×844. Keyboard focus styles and semantic buttons/headings are provided in the demo experience.

## Privacy and safety

The Build Week demo is synthetic and session-local. It has no account creation, resume upload, auto-apply, or application submission. It does not expose server-side API keys. The public demo does not depend on local Ollama or a production database. The product avoids hiring-probability claims and retains the human-calibration hold.

## Known limitations

- The bundled demo data is intentionally compact and fictional; it does not claim market coverage.
- GPT-5.6 live strategy requires a server-side API key and explicit release configuration.
- Private Local mode remains Beta while its broader performance evaluation hold is open.
- Independent hiring-outcome calibration is not available.

## Build Week extension disclosure

JobPilot existed before Build Week. The Build Week extension is separately documented in [`BUILD_WEEK_CHANGELOG.md`](BUILD_WEEK_CHANGELOG.md) and `build-week/build-week-extension-evidence.json`; it does not claim pre-existing catalog or product work as new.

## License and attribution

License selection and public-repository publication remain an owner decision. The synthetic demo data has its own [`demo-data license`](build-week/demo-data/LICENSE.md). Project attribution: JobPilot contributors.
