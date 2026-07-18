# JobPilot — Find the Roles Worth Your Time

Job search fatigue comes from repeating the same discovery work, opening postings one by one, manually comparing a resume, and still not knowing which application deserves the next hour. JobPilot connects the decision loop:

`DISCOVER → PRIORITIZE → UNDERSTAND → APPLY → TRACK`

The public judge flow needs no login, account, database, OpenAI key, Ollama installation, browser location permission, or real resume. Its candidate, roles, employer destinations, captures, and video are synthetic for privacy and reproducibility.

```bash
npm install
npm run build
npm run start
```

Open `http://localhost:3000`, choose **See Today's 3 Roles**, or start the optional **90-Second Tour**.

![JobPilot application-fatigue landing](build-week/bw7/captures/landing-1440x900.png)

## Why JobPilot is different

Traditional job search often fragments discovery, resume comparison, employer handoff, and tracking across separate surfaces. JobPilot joins them without attacking named competitors, claiming complete-market coverage, or automating the user's application decision.

| Step | Traditional fragmented search | JobPilot |
| --- | --- | --- |
| Discover | Repeat searches across feeds and tabs | Bring nearby and Remote roles from a processed source portfolio into one view |
| Prioritize | Re-read postings and build an informal ranking | Publish deterministic visible factors and show three roles worth attention |
| Understand | Compare requirements and a resume manually | Separate required/preferred evidence, experience, gaps, blockers, and score proof |
| Apply | Find and re-check the employer destination | Open the fictional employer destination only after an explicit user action |
| Track | Record progress in another tool | Keep browser-local planning state without auto-applying |

## Today's 3 Roles Worth Your Time

`/demo/shortlist` defaults to four short rationale items on each card: fit, compatibility, freshness, and blocker state. Exact ordering remains available under **How this shortlist works** and applies one lexicographic policy:

1. numeric-score eligibility;
2. blocker state;
3. Fit Score;
4. Evidence Quality;
5. physical distance or Remote;
6. posting freshness;
7. stable job ID.

No weights are combined and no hidden shortlist score exists. Strongest matches, biggest gaps, and exact evidence remain on Job Detail instead of crowding the default shortlist. Distance, work mode, and freshness never modify technical Fit Score.

## Public-safe production coverage

The public demo remains synthetic, but `/about/coverage` renders one immutable aggregate snapshot from the larger original JobPilot acquisition system. At `2026-07-18T17:41:08.379Z` the read-only snapshot recorded:

- 145,978 unique active catalog jobs;
- 13,164 unique California jobs;
- 6,426 San Francisco Bay Area memberships;
- 1,108 Los Angeles County memberships under the exact `LOS_ANGELES_COUNTY` contract;
- 473 active official-source endpoints, 446 with a latest complete snapshot;
- 145,978 original posting records;
- 2,727 URLs with positive reachability evidence;
- 2,727 verified apply destinations;
- last successful refresh at `2026-07-18T10:09:52.791Z`.

Recorded, reachable, and verified are deliberately different destination claims. Counts describe the processed catalog and source portfolio, not complete market coverage. The earlier JP-41 certificate counted a bounded 2,808-record private-shadow generation; the frozen Build Week snapshot counts the later active `Job` catalog after subsequent acquisition and refresh generations. They are different counting populations. Catalog and California totals count unique `Job.id` values; regional memberships can overlap and are never summed into that total. Duplicate counting is zero.

```bash
npm run bw9:freeze -- --original-repo <path-to-read-only-original-JobPilot-repository>
```

The immutable snapshot semantic hash is `68f2195f1e4a6d4dce155eb2dfcd9e209643d412e30d949ca65bd2bee6ae8414`. See [the public timeline](build-week/bw9/coverage-public-timeline.md), [full methodology](build-week/bw9/coverage-methodology.md), and [query contract](build-week/bw9/coverage-query-contract.json).

## Hybrid AI with an exact score boundary

1. **Gemma 4 12B** is the primary semantic model for ambiguous role extraction, capability grouping, candidate profiling, evidence matching, equivalence, summaries, and uncertainty. Private resume analysis stays on loopback Ollama.
2. **Deterministic code** owns every micro-point, class cap, transfer, month-level experience union, practical constraint, Evidence Quality value, priority, and Score Receipt.
3. **GPT-5.6 prepared reviews** add bounded application strategy, challenge analysis, ambiguity review, and pairwise comparison from frozen synthetic evidence.

All four prepared artifacts expose their Codex generation surface, verifiable `gpt-5.6-sol` provenance, frozen input hash, output hash, file hash, valid evidence IDs, zero API requests, and `model-generated final score: No`. Only final structured outputs are stored; hidden reasoning is not published.

The submitted runtime made **0 OpenAI API requests** and incurred **$0 API cost**.

## Independent Score Receipt verification

Open `/demo/verify-receipt`, upload or paste bounded JSON, or use the bundled receipt. The verifier reproduces canonical serialization, SHA-256, the exact 100,000,000 micro-point allocation, class caps, transfers, rounding, practical separation, evidence IDs, and frozen source inputs.

```bash
npm run generate:demo-receipt
npm run verify:receipt -- build-week/bw7/receipts/northstar-demo-receipt.json
```

See [SCORE_RECEIPT_VERIFIER.md](SCORE_RECEIPT_VERIFIER.md).

## Decision Utility Study

`/study/decision-utility` is intentionally absent from primary product navigation. It is a synthetic, randomized two-condition harness comparing Raw Posting and JobPilot. It supports task timing, required/preferred/work-mode/gap questions, Apply / Review / Skip, confidence, transparency, anonymous IDs, browser-local autosave, JSON/CSV export, and reset.

Status: **READY_NOT_RUN**. Human participant count: **0**. Synthetic tooling validation is never presented as human evidence. See [the protocol](build-week/study/protocol.md).

## Private Resume Mode

The local edition accepts PDF, DOCX, and UTF-8 TXT up to 10 MB, parses in memory, requires editable extraction review, stores only the confirmed structured profile in browser-local storage, and sends confirmed evidence only to loopback `gemma4:12b`. Raw bytes and complete raw text are absent from public artifacts and prepared reviews.

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

The current BW8 certificate, route matrix, responsive QA, accessibility checks, privacy scans, and zero-value invariants are stored under `build-week/bw8/`.

## Key routes

- Product: `/`, `/demo/shortlist`, `/demo/jobs`, `/demo/jobs/[id]`, `/demo/compare`, `/demo/tracker`
- Proof: `/demo/trust`, `/demo/verify-receipt`, `/about/coverage`, `/about/build-week`
- Isolated research: `/study/decision-utility`
- Private local profile: `/profile`, `/profile/resume`, `/profile/preferences`, `/profile/private-mode`
- Health and verification: `/api/health`, `/api/provider-status`, `/api/verify-receipt`

## Judge and release evidence

- [Judge Guide](JUDGE_GUIDE.md)
- [Product UX](PRODUCT_UX.md), [nearby discovery](NEARBY_DISCOVERY.md), and [direct employer flow](DIRECT_EMPLOYER_FLOW.md)
- [Architecture](ARCHITECTURE.md), [privacy](PRIVACY.md), and [zero-API GPT-5.6](ZERO_API_GPT56.md)
- `build-week/bw8/` — production aggregates, provenance, validation, captures, and release evidence
- `build-week/study/` — frozen decision-utility kit, status `READY_NOT_RUN`
- `build-week/video/jobpilot-winning-rc1-demo.mp4` — current 175-second actual-product video

## Development-phase boundary

This remains a development release candidate. JobPilot has not deployed itself, made the video public, submitted Devpost, obtained final owner approval, or created a final release tag. Code and original documentation are MIT licensed.
