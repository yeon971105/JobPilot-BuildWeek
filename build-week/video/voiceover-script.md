# Voiceover script

Job seekers often receive a number without an explanation. JobPilot makes the decision inspectable. This Build Week demo uses fictional jobs and a fictional candidate, so there is no account, resume upload, or personal data.

Here is a role from Northstar Labs. JobPilot separates core, preferred, and nice-to-have requirements. Each displayed match links a named requirement to specific candidate evidence. Work mode and travel are shown as practical constraints, rather than silently changing technical fit.

The Fit Score is calculated by deterministic versioned code. The visible maximum reconciles to one hundred points, with no hidden adjustment. It is an evidence-based ranking score, not a hiring probability.

When the hosted demo is enabled, Build My Application Strategy sends only compact synthetic evidence, job facts, and deterministic score components to GPT-5.6 through the Responses API with Structured Outputs. GPT-5.6 returns grounded recommendations with requirement and evidence IDs. It cannot invent experience, calculate the score, or submit an application.

Codex helped implement the no-login demo, the provider abstraction, grounding validation, testing, and release package. For private analysis, JobPilot also retains a local Gemma mode, currently marked Beta. The goal is simple: know why a job fits before you apply.
