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
