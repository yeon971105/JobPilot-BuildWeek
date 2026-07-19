# Product UX — Final Product RC

## JP-BW12 comprehension boundary

Machine identifiers are resolved centrally before they reach primary UI. Application Strategy now leads with a recommendation banner, then five decision questions across two desktop columns or one mobile column. The default is 209 visible words; all disclosures total 380. Body copy is at least 16 px, metadata at least 14 px, section headings at least 22 px, and the 800 px desktop surface becomes full usable height on mobile.

Study completion keeps local save status persistent and puts phase-specific CSV and JSON actions above the fold, including at 320×700. Results translate answer codes, report four factual answers separately from subjective decision alignment, and keep detailed answers collapsed.

JP-BW11R centers JobPilot on one user outcome: move from application fatigue to the next confident, controlled application through a calm decision surface with exact proof available on demand.

## Landing and discovery

The public landing at `/` says **Find the roles worth your time.** The primary action opens **For You** at `/demo/shortlist`; the no-login demo and private-resume path remain available. The landing explains user value before implementation details. For You is a separate app home with **Why these three?**, three visible rationale items, simplified role cards, and a collapsed full ranking method.

The Jobs screen provides profile context, configured home area, source and posting-date disclosure, distance or Remote label, Fit Score, Evidence Quality, strongest match, biggest gap, priority, blocker state, and explicit employer destination. Filters cover search, work mode, seniority, score, Evidence Quality sufficiency, priority, blocker, radius, and remote compatibility. Sorts are visible and deterministic.

## Compare and decide

Up to three persisted roles can be compared. Cards keep Fit Score, Evidence Quality, priority, blockers, distance, recency, work mode, required/preferred experience, matches, and gaps visible. Users can remove or replace a role, open its detail, or open the employer destination. No hidden aggregate comparison score exists.

## Visual decision and progressive evidence

The decision panel leads with an animated integer Fit Score, plain-language Fit label, Apply Priority, Evidence Quality label, blocker, destination, profile, employer action, Save, Strategy, and user-control language. The Overview contains mutually exclusive Strong Evidence and Attention Areas, five visual dimensions, a whole-year experience comparison, and Work Mode, Location, and Travel cards. It exposes no point decimals.

Evidence is grouped into Strong Evidence, Some Evidence, No Evidence Found, and Needs Review. Expanded cards retain exact quotes, aliases, examples, verifier status, uncertainty, maximum, earned, lost, and low/mid/high values. Score Proof first explains allocation, contribution, Evidence Quality, and receipt status visually; the exact micro-point table remains collapsed under **E. Technical Ledger**.

Prepared GPT-5.6 challenge and ambiguity reviews are available inside Evidence for the frozen Northstar role. They display provenance and make no direct score change.

## Employer handoff and tracker

The employer link uses `_blank` with `noopener noreferrer`. The public synthetic destination states that it demonstrates the original-employer handoff, contains no form or redirect, disables Continue application, and never marks the role Applied. Only explicit Save, Preparing, or other tracker actions change browser-local planning state.

## Motion, states, research, and responsive release

Motion uses 140–280 ms interface transitions, a one-time 650 ms score animation, maximum 40 ms card stagger, and no sustained or decorative loop. Reduced Motion collapses durations to 0.01 ms, caps iteration at one, and renders the final score directly. Loading skeletons run twice. Empty, success, and safe error states provide plain language and one recovery action.

The tracker uses browser-local compact cards, stage counts, mobile stage tabs, and an aria-live Undo toast. Trust Lab opens with Official Source → Resume Priority → Visual Decision → Verifiable Proof → Employer Destination → Tracker. The Study remains isolated at `/study/decision-utility` and uses Protocol V2, two different roles, counterbalancing, primer, comprehension, one question per screen, and strict PREVIEW/PILOT exclusion.

Production browser QA covers 10 owner routes across 1440×900, 1024×768, 390×844, and 320×700, plus interactive evidence, ledger, tracker, verifier, profile, empty-result, and Study states. Final matrix: 40/40 route–viewport checks passed, with zero horizontal overflow, one-H1 failures, undersized primary controls, console errors, or broken primary actions. The 320 px Technical Ledger scrolls inside its disclosure without widening the page.
