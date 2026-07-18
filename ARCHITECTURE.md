# Architecture

```text
Synthetic/public job input
        |
        +--> Deterministic explicit parsing and normalization
        |
        +--> Local Gemma semantic pipeline
        |      1. JOB_SEMANTIC_ANALYSIS
        |      2. RESUME_SEMANTIC_PROFILE (independently cached)
        |      3. BATCHED_REQUIREMENT_MATCH
        |
        +--> Deterministic validation and AI Fit V2.2
        |      allocation, experience union, constraints, priority, receipt
        |
        +--> Optional explicit heavy reasoning
               GPT-5.6 strategy, critique, ambiguity, comparison
```

Hosted no-key mode replaces live Ollama inference with frozen public-safe prepared analyses. It does not replace Gemma's architectural role, and it labels the result as prepared. GPT-5.6 never handles routine scoring or silently changes a receipt.

Secrets are read only in server provider modules. Public status responses return capabilities and enablement state, never values, paths, or credentials.

## JP-BW6 product and private-profile architecture

The application now exposes one shared navigation with Jobs, Tracker, Trust Lab, Build Week, and Profile. The role page is a decision shell: the Overview is small and user-facing, while Evidence, Experience, Score Proof, capability details, the technical receipt, and strategy are rendered only after explicit interaction.

Local resume intake is a Node route boundary. `resume-parser.ts` validates name, size, extension, MIME type, signatures, archive structure, active content, external relationships, text encoding, and extractability. It returns only a structured profile plus hashes and minimal processing metadata. `local-analysis.ts` validates runtime loopback configuration, gives Gemma only confirmed structured evidence, validates every returned requirement and evidence ID, and then calls the unchanged deterministic AI Fit V2.2 scorer with an explicit private-profile context.

The public and private analysis caches are isolated by active profile mode. Switching to Demo Candidate A cannot reuse a private result, and selecting a new profile or preferences invalidates existing private analyses.
