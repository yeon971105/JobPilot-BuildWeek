# Owner-only participant inbox

Place one unedited CSV export per participant here. Each file must contain exactly two complete consenting rows: one Raw Posting condition and one JobPilot condition.

Participant records are intentionally ignored by Git. Do not add names, contact details, resumes, demographic data, employment status, health data, home addresses, IP addresses, or participant notes. Do not place dry-run or tooling exports here.

Run:

```bash
npm run study:validate -- build-week/study/inbox
npm run study:combine -- build-week/study/inbox
```
