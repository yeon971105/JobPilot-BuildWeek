# Owner collection workflow

1. Recruit at least 5 actual participants; 8–12 is preferred. Do not recruit by collecting protected or sensitive attributes.
2. Open the local or private review preview at `/study/decision-utility` for one participant at a time.
3. Ask the participant to read and accept the on-screen consent. Do not coach answers.
4. After both conditions, ask the participant to export the CSV. Store it locally in a study-only folder.
5. Confirm the CSV exists, then ask the participant to choose **Delete and reset** before the next person.
6. Keep filenames anonymous. Do not add names, emails, notes about employment status, demographics, or other identifying details.
7. Combine the CSV files. Repeated header rows are accepted; do not edit response values or participant IDs.
8. Run `npm run study:analyze -- <combined.csv>`.
9. Review `build-week/bw9/impact-results-internal.json` for validation holds and the full calculation, then review `impact-results-public.md` for safe public copy.
10. If the state is `IN_PROGRESS`, recruit more participants. If it is `COMPLETE`, review limitations and approve any directional usability wording in your own voice.

Never convert synthetic dry-run checks into human rows. Never claim statistical significance, hiring outcomes, or population-level impact from this small study.
