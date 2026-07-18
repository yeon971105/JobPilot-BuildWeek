# JP-BW5 observed visual defects

- Purpose: preserve the pre-mutation visual defect inventory and invalidate route-only QA.
- Timestamp: `2026-07-18T02:00:42.0121954Z`
- Commit: `cbf3a09f14ca136c067c813e470047b419f16dd9`
- Size: 1417 canonical body bytes
- SHA-256: `0dac634fbfe8f3e0bd15ea1b87db3b542240add8403ba419be7a2019b6016632` (canonical body)
- Supported gate: pre-repair visual reproduction
- Public-safe status: `PUBLIC_SAFE`

The production build loaded the project's small custom stylesheet, but Tailwind v4 utilities were absent. The defect therefore affected both the generated CSS and the browser's computed layout.

Observed at 1440×900:

- Primary navigation rendered as normal block flow; links collapsed together and retained default blue anchor styling.
- The landing hero rendered as a vertical document instead of two columns.
- Tailwind margin, spacing, grid, flex, responsive, sizing, and large-type utilities did not apply.
- The illustrative score circle became ordinary text with zero height and no border.
- Capability bars and score-receipt columns became concatenated text.
- The job filter toolbar crowded native inputs together.
- Job content expanded into oversized one-column cards with poor hierarchy.
- Job score and `FIT` labels visually ran together.
- Detail-page sections repeated in a long raw-document presentation.
- Mobile and tablet behavior could not be considered certified because the responsive utilities were missing.

This evidence is preserved rather than deleting the earlier QA artifacts.
