# JobPilot Decision Utility Study protocol

Status: **READY_NOT_RUN**

Actual participant count: **0**

Minimum target: **5**

Preferred target: **8–12**

Study route: `/study/decision-utility`

No participant sessions or impact claims are included in this release. Synthetic tooling checks are never presented as human evidence.

## Research question and design

Does the JobPilot condition help a person make a faster, more confident, and more transparent Apply / Review / Skip decision than the Raw Posting condition while preserving accurate understanding of required experience, preferred experience, work mode, and the biggest candidate gap?

- Within-participant, two-condition crossover: `RAW_POSTING` and `JOBPILOT`.
- Counterbalanced order, randomized once after consent for each anonymous browser-local session.
- One frozen fictional role and candidate in both conditions.
- The timer begins after consent when a condition is displayed and stops when all required answers are saved.
- This is early decision-utility evidence, not hiring-outcome calibration.

## Collection and privacy

Collected fields are the anonymous random ID, order, condition, four accuracy answers, decision time, Apply / Review / Skip decision, confidence, transparency, consent version, and completion timestamp.

Names, emails, phone numbers, resumes, demographics, employment status, health data, employer credentials, and personal histories are prohibited. The route has no form action, API route, analytics call, fetch call, automatic upload, or real job/candidate input.

Home addresses and IP addresses are also prohibited in exported study data.

## State machine

- `READY_NOT_RUN`: zero imported actual participants.
- `IN_PROGRESS`: one to four complete actual participants.
- `COMPLETE_MINIMUM`: five to seven complete actual participants.
- `COMPLETE_PREFERRED`: eight or more complete actual participants.

The preferred 8–12 target remains visible after minimum completion. A session contributes only when both condition rows validate.

## Owner analysis

Place exported participant CSV files in `build-week/study/inbox/` without editing their values. Run:

```bash
npm run study:validate -- build-week/study/inbox
npm run study:combine -- build-week/study/inbox
npm run study:analyze -- build-week/study/validated/combined.csv
```

The inbox validator requires exactly two valid condition rows per participant, and rejects duplicates across files, incomplete pairs, dry-run rows, tooling rows, order mismatches, malformed ratings/times, missing or mismatched consent, non-anonymous IDs, prohibited columns, invalid choices, and identifying schema changes.

It calculates participant count, median time by condition, median paired time difference, median paired percentage time change, four accuracy measures, decision agreement, confidence/transparency differences, and deterministic bootstrap 95% intervals at five or more participants. It generates an internal full report and public concise summary. No statistical-significance claim is made from this small study.
