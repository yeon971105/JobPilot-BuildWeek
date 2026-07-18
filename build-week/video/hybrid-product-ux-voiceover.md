# JobPilot Product UX RC Voiceover

Most job platforms give you a score before they give you a reason. JobPilot starts with the decision a job seeker actually needs: know why a job fits.

The public demo needs no login, key, database, or local model. It uses only synthetic candidate and role data, so every interaction is safe to inspect.

Job discovery keeps profile context visible. Each card shows one strongest match, one biggest gap, Evidence Quality, Apply Priority, and any practical blocker—without turning the search into an analytics dashboard.

On the role, the first screen answers four questions: what is the job, how well does it fit, why, and what should I do next? The summary is concise. The Fit Score, range, Evidence Quality, priority, strongest match, biggest gap, and application strategy are immediately available.

Every point maps to evidence. Selecting a capability reveals exact job and candidate excerpts, aliases, verifier state, uncertainty, and the full calculation. Required and preferred qualifications stay distinct. Relevant experience is calculated month by month, and overlapping months count once.

The Evidence tab holds every scored capability. The Experience tab shows the requested years, relevant midpoint, coefficients, overlap removal, and formula.

Score Proof reconciles Core, Preferred, and Nice-to-have budgets to one hundred visible points with zero hidden adjustments. The downloadable Score Receipt is byte-reproducible, while full technical JSON stays closed until requested.

See a Score Change verifies that the score is not hardcoded. One synthetic evidence change recomputes only the affected capability and creates a new receipt hash. The score is an evidence-based ranking score, not a hiring probability.

Private Resume Mode is real local product behavior. PDF, DOCX, and TXT files are parsed in memory, the user reviews and corrects extracted evidence, and no resume is sent to OpenAI or another cloud model. Private resume analysis stays local.

Gemma 4 12B is the primary local semantic model. Deterministic code calculates the score. GPT-5.6 Terra is optional heavy reasoning for strategy, critique, and difficult ambiguity. This public strategy is clearly prepared, and GPT-5.6 never owns the score.

Trust Lab explains the responsibility boundary, privacy, proof, and current limitations. Codex helped identify defects, repair scoring and UX, test, and ship the product. JobPilot: know why a job fits before you apply.
