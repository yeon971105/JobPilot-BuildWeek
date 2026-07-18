# JobPilot — Find the Roles Worth Your Time

Job search fatigue comes from repeating the same searches, opening postings one by one, manually comparing a resume, and still not knowing which application deserves the next hour. JobPilot brings nearby roles from a processed portfolio of official and rights-eligible employer sources into one profile-aware view, explains the evidence behind each priority, and opens the employer destination without auto-applying.

The public demo needs no login, account, database, Ollama installation, OpenAI key, browser geolocation, or real resume.

```bash
npm install
npm run build
npm run start
```

Open `http://localhost:3000`, choose **See My Best Matches**, or run the optional **Start the 90-Second Tour**.

![JobPilot application-fatigue landing](build-week/bw7/captures/landing-1440x900.png)

## The decision journey

`Nearby discovery → deterministic priority → visible evidence → relevant experience → verifiable receipt → direct employer destination → browser-local tracker`

- **Discover:** six fictional roles with location, remote compatibility, posting date, and source disclosure.
- **Prioritize:** Best Match, Nearest, Most Recent, and Highest Evidence Quality are deterministic visible sorts.
- **Understand:** required and preferred qualifications, top matches, gaps, blockers, and practical constraints remain separate.
- **Inspect:** every scored capability maps to exact synthetic job and candidate evidence IDs.
- **Verify:** the standalone receipt verifier reproduces SHA-256 hashing and exact micro-point arithmetic.
- **Apply safely:** JobPilot opens a fictional employer destination in a safe new tab; the application control is disabled.
- **Track:** only explicit user actions change Saved, Interested, Preparing, or Applied planning state.

Distance, recency, work mode, location, and travel never become hidden technical score adjustments. The Fit Score is an evidence-based ranking score, not a hiring probability. Independent hiring-outcome calibration is not yet available.

## Hybrid AI with an exact score boundary

1. **Gemma 4 12B** is the primary semantic model for ambiguous role extraction, capability grouping, candidate profiling, evidence matching, equivalence, summaries, and uncertainty. Private resume analysis stays on loopback Ollama.
2. **Deterministic code** owns every micro-point, class cap, transfer, month-level experience union, practical constraint, Evidence Quality value, priority, and Score Receipt.
3. **GPT-5.6 prepared reviews** add bounded strategy, critique, ambiguity review, and pairwise comparison from frozen synthetic evidence. The submitted runtime made **0 OpenAI API requests** and incurred **$0 API cost**.

Prepared output is labeled **GPT-5.6 — Prepared Review** and never presented as live. Models never generate or mutate the numeric score.

## Independent Score Receipt verification

Open `/demo/verify-receipt`, upload or paste JSON up to 1 MB, or use the bundled receipt. The verifier checks canonical serialization, SHA-256, supported versions, the 100,000,000 micro-point allocation, low/mid/high ordering, class and category caps, transfers, rounding, practical separation, evidence IDs, and frozen source reproduction.

CLI:

```bash
npm run generate:demo-receipt
npm run verify:receipt -- build-week/bw7/receipts/northstar-demo-receipt.json
```

Statuses are `FULLY_REPRODUCED`, `ARITHMETICALLY_VALID`, `INVALID`, and `UNSUPPORTED_VERSION`. See [SCORE_RECEIPT_VERIFIER.md](SCORE_RECEIPT_VERIFIER.md).

## Private Resume Mode

The local edition accepts PDF, DOCX, and UTF-8 TXT up to 10 MB. It parses in memory, requires editable extraction review, stores only the confirmed structured profile in browser-local storage, and sends confirmed evidence only to loopback `gemma4:12b`. Raw bytes and complete raw text are absent from logs, reports, prepared GPT reviews, and Score Receipts.

```dotenv
LOCAL_PRIVATE_MODE=true
OLLAMA_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma4:12b
```

See [PRIVATE_RESUME_MODE.md](PRIVATE_RESUME_MODE.md).

## Validation

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:css-pipeline
npm run validate:providers
npm run validate:local-gemma
npm audit --audit-level=low
```

The release certificate records 73 passing tests, two authorized skips, a clean production build, two passing CSS pipeline tests, zero npm vulnerabilities, 44 responsive route checks with zero overflow, zero browser console warnings/errors, all six receipts fully reproduced, and a fresh real `gemma4:12b` loopback canary.

## Routes

- `/`, `/demo`, `/demo/jobs`, `/demo/jobs/[id]`, `/demo/compare`
- `/demo/employer-posting/[id]`, `/demo/tracker`, `/demo/trust`, `/demo/verify-receipt`
- `/profile`, `/profile/resume`, `/profile/preferences`, `/profile/private-mode`
- `/about/build-week`, `/api/health`, `/api/provider-status`, `/api/verify-receipt`

## Release evidence

- [Judge guide](JUDGE_GUIDE.md)
- [Product UX](PRODUCT_UX.md)
- [Nearby discovery](NEARBY_DISCOVERY.md)
- [Direct employer flow](DIRECT_EMPLOYER_FLOW.md)
- [Zero-API GPT-5.6](ZERO_API_GPT56.md)
- [Architecture](ARCHITECTURE.md) and [privacy](PRIVACY.md)
- `build-week/bw7/` — contracts, captures, validation, and release evidence
- `build-week/study/` — preregistered usability kit, status `READY_NOT_RUN`
- `build-week/video/jobpilot-winning-rc1-demo.mp4` — 175-second actual-product video

## Scope and limitations

Public data, screenshots, and media are synthetic. Nearby results describe the processed portfolio, not every role in a market. JobPilot does not predict employer decisions, fill forms, submit applications, deploy itself, upload the video, or submit Devpost. Code and original documentation are MIT licensed.
