# JobPilot — credibility RC Devpost draft

Status: owner-review draft. Not submitted.

JobPilot turns fragmented job searching into one controlled decision loop: discover, prioritize, understand, open the employer destination, and track. The public review flow needs no login and uses synthetic roles and a synthetic candidate.

## Production reality, safely frozen

At `2026-07-18T17:41:08.379Z`, one immutable read-only snapshot recorded:

- 145,978 unique active catalog jobs;
- 13,164 unique California jobs;
- 6,426 San Francisco Bay Area and 1,108 Los Angeles County memberships;
- 473 active official-source endpoints, 446 with a latest complete snapshot;
- 145,978 original posting records;
- 2,727 URLs with positive reachability evidence;
- 2,727 verified apply destinations;
- last successful refresh at `2026-07-18T10:09:52.791Z`.

These figures describe the processed source portfolio, not complete market coverage. The JP-41 2,808-record certificate was one bounded private-shadow generation; the 145,978-job figure is the later active catalog after subsequent acquisition and refresh generations. They are different counting populations. Catalog and California figures count unique jobs; regional figures are distinct memberships and are not summed.

Recorded, reachable, and verified are deliberately separate destination claims. Only a verified destination may say “Apply on Employer Site.” JobPilot never fills or submits an application.

Snapshot semantic hash: `68f2195f1e4a6d4dce155eb2dfcd9e209643d412e30d949ca65bd2bee6ae8414`.

## Evidence boundary

The public flow exports no production rows, descriptions, URLs, candidate records, credentials, or source payloads. All release surfaces use the frozen snapshot rather than live database counts. The runtime makes zero OpenAI API requests and incurs $0 API cost.

Four `gpt-5.6-sol` reviews were prepared through Codex from frozen synthetic evidence. They are prepared, not live; all evidence IDs are valid; and the model generated no numeric score.

Human-study results remain absent until actual consented participants complete the owner-operated local study.
