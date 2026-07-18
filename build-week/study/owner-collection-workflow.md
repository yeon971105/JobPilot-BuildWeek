# Owner collection workflow

1. Recruit at least 5 actual participants; 8–12 is preferred. Do not recruit by collecting protected or sensitive attributes.
2. Open the local or private review preview at `/study/decision-utility` for one participant at a time.
3. Ask the participant to read and accept the on-screen consent. Do not coach answers.
4. After both conditions, ask the participant to export the CSV. Place it in `build-week/study/inbox/` without opening or editing the record.
5. Confirm the CSV exists, then ask the participant to choose **Delete and reset** before the next person.
6. Keep filenames anonymous. Do not add names, emails, notes about employment status, demographics, or other identifying details.
7. Run `npm run study:validate -- build-week/study/inbox`. Do not work around a rejection by manually editing a record.
8. Run `npm run study:combine -- build-week/study/inbox` only after validation passes.
9. Run `npm run study:analyze -- build-week/study/validated/combined.csv`.
10. Review `build-week/study/internal-results.json` for validation and the full calculation, then review `build-week/study/public-summary.md` for safe public copy.
11. `COMPLETE_MINIMUM` starts at five complete participants; `COMPLETE_PREFERRED` starts at eight. Public metrics remain withheld below five.

Never convert synthetic dry-run checks into human rows. Never claim statistical significance, hiring outcomes, or population-level impact from this small study.
