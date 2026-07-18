# JobPilot Decision Utility Study Protocol

Status: **READY_NOT_RUN**  
Human participant count: **0**  
Study route: `/study/decision-utility`

No participant sessions or impact claims are included in this release. The harness is isolated from primary judge navigation and uses synthetic roles only.

## Research question

Does the JobPilot condition help a person make a faster, more confident, and more transparent Apply / Review / Skip decision than a raw-posting condition while preserving understanding of required qualifications, preferred qualifications, work mode, and the biggest candidate gap?

## Design

- Within-participant, two-condition crossover: `RAW_POSTING` and `JOBPILOT`.
- Condition order is randomized once per anonymous browser-local session.
- The same frozen synthetic role and candidate are used in both conditions.
- The task timer starts when each condition becomes visible and stops when all required answers are saved.
- Condition order, not a hidden participant trait, is the planned order-effect covariate.
- This small study is decision-utility evidence, not hiring-outcome calibration.

## Collected fields

- Anonymous generated participant ID.
- Randomized condition order and condition label.
- Task time in seconds.
- One required-qualification answer.
- One preferred-qualification answer.
- Work-mode answer.
- Biggest-gap answer.
- Apply / Review / Skip decision.
- Confidence rating from 1–7.
- Transparency rating from 1–7.

## Prohibited fields

Do not collect names, email addresses, phone numbers, resumes, demographics, employment status, health information, employer credentials, or free-form personal histories. The question fields are capped and must be answered only from the synthetic role.

## Storage and export

The route stores one versioned session under `jobpilot-decision-utility-study-v1` in browser `localStorage`. It has no form action, API route, analytics call, fetch call, or automatic upload. JSON and CSV exports are initiated locally by the participant. Reset removes the stored session and creates a new anonymous ID and randomized order.

## Planned analysis

For real consented imports only:

1. Verify the frozen no-PII header and two rows per anonymous participant.
2. Exclude rows explicitly labeled `synthetic_tooling_validation=true` from human results.
3. Compare within-participant task time, confidence, and transparency by condition.
4. Report medians and paired differences; retain condition-order counts.
5. Report response completeness and decision changes descriptively.
6. Do not impute missing values or generalize beyond the small sample.

## Readiness gate

The study may be described as `READY_NOT_RUN` only when both condition orders, local persistence, export, reset, required fields, timer behavior, and zero-network behavior pass automated and browser validation. Human findings remain `NOT_RUN` until genuine participant rows are imported.
