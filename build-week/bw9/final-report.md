# JP-BW9 final credibility and impact report

`FINAL_DECISION=GO_BUILD_WEEK_CREDIBILITY_RC_READY_FOR_OWNER_REVIEW`

This is a release candidate for owner review, not a final submission. Owner approval remains false. No Devpost submission, public YouTube upload, or final tag was created.

## Frozen coverage

- Snapshot: `68f2195f1e4a6d4dce155eb2dfcd9e209643d412e30d949ca65bd2bee6ae8414`
- Frozen: 2026-07-18T17:41:08.379Z at read version `9153132:9153132:`
- 145,978 active unique jobs; 13,164 California unique jobs
- 6,426 San Francisco Bay Area memberships; 1,108 Los Angeles County memberships
- 473 active official-source endpoints; 446 latest complete snapshots
- 145,978 original postings recorded; 2,727 URLs reachable; 2,727 apply destinations verified
- Last successful refresh: 2026-07-18T10:09:52.791Z
- Coverage, geography, and duplicate-count mismatch: 0

Lineage result: **PASS_DISTINCT_COUNTING_POPULATIONS_RECONCILED**. JP-41's 2,808 generation-scoped private-shadow slice and the later 145,978-job active catalog are documented as different counting populations.

## Destination, GPT, and study status

- Destination result: all five states exercised; unverified Apply CTA: 0.
- Prepared GPT provenance: exact `gpt-5.6-sol` via Codex; four artifacts; not live; API requests 0; cost $0; model-generated score 0; invalid evidence IDs 0; naming inconsistency 0.
- Human study: **READY_NOT_RUN**; actual participants 0; fabricated participants 0; minimum 5; preferred 8â€“12; no human metric is published.

## Certification

- General suite: 104 passed, 2 pre-authorized CSS-context skips, 0 failed.
- Production CSS gate: 2 passed, 0 failed.
- Typecheck, lint, production build, dependency audit, provider validation, six-receipt suite, direct CLI receipt reproduction, secret scan, accessibility, and visual review: PASS.
- Browser: eight routes Ã— four exact viewports = 32 passes; console errors 0; horizontal overflow 0.
- Local production smoke: 20 cycles, 160 requests, 160 HTTP 200, 0 failures.
- Required zero values: all zero.

The equal-weight internal evidence matrix is in `build-week/bw9/judging-evidence-matrix.md`. It contains no invented judge score.

## Preview status

Local approval preview: `http://127.0.0.1:3206/` and intentionally left running.

No authenticated Vercel, Netlify, or Wrangler tooling is available, so public deployment remains `ACCOUNT_ACTION_REQUIRED_PREVIEW_DEPLOYMENT`. The owner must authenticate a free preview provider, deploy this exact RC with `LOCAL_PRIVATE_MODE=false`, and repeat 20 public smoke cycles plus the four-viewport logged-out matrix before sharing a public URL.

## Exact owner tasks for actual participants

1. Recruit at least 5 adult volunteers who can evaluate a job-search interface; target 8â€“12. Do not collect names, emails, resumes, demographics, employment status, health data, or personal histories.
2. Ask each volunteer to open `/study/decision-utility` on their own device, read the consent notice, and participate only if they choose **I consent and begin**.
3. Each participant completes both counterbalanced tasks with the fictional posting and candidate, then exports the local CSV. Do not treat dry-run or tooling rows as human sessions.
4. Combine exports under the frozen header without adding identifying columns. Keep exactly one Raw Posting row and one JobPilot row for each anonymous participant ID.
5. Run `npm run study:analyze -- <combined.csv>`. Resolve every duplicate, incomplete-session, malformed-row, consent-version, and schema error instead of editing around the validator.
6. Review the internal report first. Publish the concise summary only at 5 or more complete actual sessions, label it directional early-usability evidence, and make no statistical-significance or hiring-outcome claim.

## Release candidate history

The branch contains exactly six JP-BW9 commits after `40fab7c`: the five implementation commits recorded in `final-report.json` and this self-identifying certification commit, `test: certify claim integrity and impact calculations`. The annotated non-final RC tag is `build-week-2026-credibility-rc1`.
