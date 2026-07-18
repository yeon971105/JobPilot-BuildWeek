# JobPilot application-fatigue usability study protocol

Status: **READY_NOT_RUN**. No participant sessions or outcome claims are included in this release.

## Question

Can a job seeker move from a scattered-search problem to one evidence-backed next application in 90 seconds, while understanding why a role is prioritized and retaining control of the employer handoff?

## Planned sample

- Six to eight adults who have searched for work in the last 12 months.
- Use pseudonymous participant IDs only; do not collect names, resumes, employer accounts, protected attributes, or contact details.
- Use the frozen synthetic Demo Candidate A and six synthetic roles.

## Tasks

1. Start at the landing page and describe what problem JobPilot solves.
2. Find nearby roles and change the order to Nearest and Most Recent.
3. Choose two roles and decide which deserves attention first.
4. Open Northstar, identify one strong match and one truthful gap, then explain the experience calculation.
5. Verify the bundled Score Receipt and explain `FULLY_REPRODUCED`.
6. Open the fictional employer destination and return without marking the role Applied.
7. Move the role to Preparing in the browser-local tracker.

## Measures

- Task completion (`0`/`1`) for each task.
- Time to first prioritized role and time to controlled employer destination, in seconds.
- Number of facilitator assists.
- Comprehension checks: score is not hiring probability; distance is not a technical point adjustment; prepared GPT-5.6 is not a live API response; JobPilot never submits.
- Single ease question from 1–7 and one open-ended friction note.

## Success thresholds

- At least 80% task completion across completed sessions.
- Median time to the controlled employer destination at or below 90 seconds.
- At least 80% correct on all four trust-comprehension checks.
- Zero participants who believe the demo submitted an application.

These are preregistered targets, not achieved results. Report observed values and missing data without imputation.

## Safety and analysis

The facilitator must stop if a participant tries to upload a real resume or open a real employer account. The analysis script accepts only the documented pseudonymous columns, performs no network requests, and reports aggregates only when rows exist. Small-sample findings are directional usability evidence, not hiring-outcome calibration.
