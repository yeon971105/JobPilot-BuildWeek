# Owner collection workflow

1. Complete the owner preview at `/study/decision-utility?mode=preview` and review the assignment, answers, correctness, condition times, and clarity warnings.
2. Optionally run one or two clarity sessions at `?mode=pilot`. Pilot exports are always rejected from final evidence.
3. Recruit at least five actual consenting adults for FINAL collection; 8–12 is preferred. Do not collect protected, sensitive, employment, or identifying attributes.
4. Open `/study/decision-utility` for one participant at a time. Ask the participant to read and accept consent. Do not coach answers.
5. At completion, ask the participant to export the FINAL CSV. Place it directly in `build-week/study/inbox/` without editing it.
6. Ask the participant to Reset before the next person, especially on a shared device.
7. Run `npm run study:validate -- build-week/study/inbox`. Do not work around rejection by editing a record.
8. Run `npm run study:combine -- build-week/study/inbox`, then `npm run study:analyze -- build-week/study/validated/combined.csv`.
9. Review internal results and the public summary. Public metrics remain withheld below five complete authentic FINAL sessions.

Never count PREVIEW, PILOT, dry-run, excluded-pilot, same-role, duplicate, incomplete, wrong-protocol, mismatched-answer-key, or non-authentic records.
