# Final Voiceover

Most AI job tools give you a score and ask you to trust it. JobPilot starts from a different idea: every career decision should be inspectable.

JobPilot is local-first and evidence-first. Gemma 4 12B is the primary semantic model, designed to analyze ambiguous requirements and candidate evidence on the user's machine. Deterministic code—not a model—calculates the Fit Score.

This public demo uses only synthetic data. With one click, I can browse six fictional roles, search by title or company, and filter by work mode or evidence sufficiency.

On this role, JobPilot separates required and preferred qualifications. Every capability shows the source requirement, synthetic candidate evidence, match class, uncertainty, maximum points, and earned range. Explicit experience is calculated month by month so overlaps cannot be counted twice. Work mode and travel remain practical constraints; they never silently change technical points.

The score breakdown reconciles to exactly one hundred visible points. The Score Receipt records content hashes, model and prompt metadata, scorer version, every capability allocation, constraints, and zero hidden adjustments.

See a Score Change proves this is not a hardcoded result. One existing synthetic evidence item is verified as an exact match. Only the affected capability changes, unrelated points remain identical, and deterministic code produces a new receipt hash. This demonstrates sensitivity; it does not recommend inventing experience.

GPT-5.6 Terra is optional and reserved for complex strategy, critique, difficult ambiguity, and strategy comparison. Here the no-key demo uses clearly prepared output. GPT-5.6 never generates or silently replaces the score.

The Trust Lab explains the complete boundary: Gemma is primary, deterministic code owns every point, fixtures keep judging reliable, and the score is not a hiring probability. Codex helped build, test, repair, audit, and package this extension.

JobPilot: know why a job fits before you apply.
