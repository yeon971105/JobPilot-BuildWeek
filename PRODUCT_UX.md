# Product UX

JP-BW7 centers JobPilot on one user outcome: move from application fatigue to the next confident, controlled application.

## Landing and discovery

The first screen says **Find the roles worth your time.** The primary action opens nearby Best Matches; the no-login demo and private-resume path remain available. Trust language names official-source discovery, private resume analysis, transparent Fit Score, and no auto-apply before Build Week implementation details.

The Jobs screen provides profile context, configured home area, source and posting-date disclosure, distance or Remote label, Fit Score, Evidence Quality, strongest match, biggest gap, priority, blocker state, and explicit employer destination. Filters cover search, work mode, seniority, score, Evidence Quality sufficiency, priority, blocker, radius, and remote compatibility. Sorts are visible and deterministic.

## Compare and decide

Up to three persisted roles can be compared. Cards keep Fit Score, Evidence Quality, priority, blockers, distance, recency, work mode, required/preferred experience, matches, and gaps visible. Users can remove or replace a role, open its detail, or open the employer destination. No hidden aggregate comparison score exists.

## Role detail and progressive evidence

The decision panel leads with Fit Score, range, Evidence Quality, priority, blocker, profile, **Apply on Employer Site ↗**, Save, application strategy, and user-control language. Overview, Evidence, Experience, and Score Proof tabs reveal deeper information only when requested. Capability and receipt modals take focus, trap Tab, close with Escape, and restore prior focus.

Prepared GPT-5.6 challenge and ambiguity reviews are available inside Evidence for the frozen Northstar role. They display provenance and make no direct score change.

## Employer handoff and tracker

The employer link uses `_blank` with `noopener noreferrer`. The public synthetic destination states that it demonstrates the original-employer handoff, contains no form or redirect, disables Continue application, and never marks the role Applied. Only explicit Save, Preparing, or other tracker actions change browser-local planning state.

## Judge tour and responsive release

The landing offers a seven-step, approximately 90-second tour. It is optional, skippable, restartable, arrow-key/Escape operable, screen-reader announced, and mobile safe.

Production browser QA covers 11 routes at 1440×900, 1024×768, 390×844, and 320×700. A verifier overflow found at 320 pixels was repaired with shrinkable grid columns and locked by a source regression. Final matrix: 44 checks, zero horizontal overflow, zero application error boundaries, and zero console warnings/errors.
