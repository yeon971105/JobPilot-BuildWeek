# Judge Guide

The public path needs no login, key, database, Ollama installation, or real resume.

1. Open `/` and confirm the job-seeker value statement appears before Build Week details.
2. Select **Try the Demo**.
3. Browse six synthetic roles. Verify profile context, search, work mode, seniority, score, evidence, Apply Priority, and blocker filters.
4. Open Alder's Data Platform Engineer. The first viewport shows the role, summary, Fit Score, Evidence Quality, Apply Priority, strongest match, biggest gap, and **Build Application Strategy**.
5. Open one match or gap to inspect exact evidence, aliases, verifier state, uncertainty, and points.
6. Use **Experience** on Northstar's role to see Preferred, 3+ requested years, 3.45 relevant years, six overlap months removed, and 3.60 / 4.00 points.
7. Use **Score Proof** to inspect budgets, download the Score Receipt, copy its hash, open technical JSON in a focus-trapped modal, and run **See a Score Change**.
8. Build the strategy. No-key output is labeled **Prepared demonstration output from synthetic evidence.**
9. Save the role, edit its local note and planning stage in Tracker, and verify the no-submission notice.
10. Open Trust Lab and inspect the responsibility boundary, exact score proof, privacy, and limitations.

Profile navigation is part of the product RC. `/profile/resume` explains that public deployment cannot accept a real resume. In a local run with `LOCAL_PRIVATE_MODE=true`, the same route accepts PDF, DOCX, or TXT, offers a synthetic test resume, provides editable extraction review, saves work preferences, and performs real loopback `gemma4:12b` analysis.

Provider provenance is intentionally three-part:

- Analysis pipeline: **Gemma 4 12B analysis pipeline**
- Delivery mode: **Prepared synthetic analysis**
- Scoring engine: **Deterministic AI Fit V2.2**

The score is not a hiring probability. The demo never submits an application.
