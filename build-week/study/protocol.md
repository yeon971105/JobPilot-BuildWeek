# JobPilot Decision Utility Study protocol V2

Status: **READY_NOT_RUN**

Actual participant count: **0**

Protocol: `jobpilot-decision-utility.v2`

Minimum target: **5**; preferred target: **8–12**

Study route: `/study/decision-utility`

## Research question and valid design

Can JobPilot make a job decision easier while preserving accurate understanding of required experience, preferred experience, work arrangement, the weakest-supported qualification, and the participant’s Apply / Review Further / Skip decision?

Each participant reviews two different fictional roles:

- Role A: Analytics Operations Engineer
- Role B: Data Enablement Engineer

Assignment is randomized once after consent:

- Group 1: Role A Raw Posting, then Role B JobPilot
- Group 2: Role B Raw Posting, then Role A JobPilot

The same role can never appear twice in one valid session. A hidden timer starts with each condition and stops after its confidence and clarity ratings. Comprehension attempts are not performance data.

## Modes and exclusion

- `PREVIEW`: owner instruction and interaction review; never valid participant evidence.
- `PILOT`: one or two real people may validate clarity; never valid final evidence.
- `FINAL`: the only phase accepted by the participant validator.

The documented pre-V2 record is retained as `PILOT_EXCLUDED` because it allowed same-role carryover, a learning advantage, unclear instructions, and an old protocol. It contains no published participant record and contributes zero participants.

## Privacy and validation

The V2 export contains only an anonymous ID, protocol and consent versions, phase, assignment, two different role IDs, condition, hidden completion time, five answers and their correctness, confidence, clarity, completion timestamp, and authentic-human confirmation.

Names, emails, phone numbers, IP addresses, resumes, demographics, health information, employment status, and home addresses are prohibited. The study route uses browser-local storage and makes no network request.

A FINAL participant contributes only when both rows are complete, use the current protocol and consent, match one valid assignment, use different roles and distinct conditions, reproduce answer-key correctness, and confirm authentic human completion. PREVIEW, PILOT, dry-run, excluded, malformed, duplicate, incomplete, same-role, and identifying rows are rejected.

## Owner analysis

```bash
npm run study:validate -- build-week/study/inbox
npm run study:combine -- build-week/study/inbox
npm run study:analyze -- build-week/study/validated/combined.csv
```

Do not edit records around the validator. No public metric is allowed below five authentic complete FINAL sessions. Any published result is directional usability evidence, not hiring-outcome calibration or proof of employment success.
