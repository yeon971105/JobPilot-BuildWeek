# Architecture

```text
processed official/right-eligible sources + configured profile location
                              |
                              v
                 nearby discovery and visible sorts
                              |
                              v
frozen public candidate or confirmed local private profile
             |                |                 |
             |                |                 +--> GPT-5.6 prepared review
             |                |                      strategy / critique /
             |                |                      ambiguity / comparison
             |                v
             +------> Gemma 4 12B semantic pipeline
                              |
                              v
                    deterministic validation
                              |
                              v
 AI Fit V2.2 micro-points + Evidence Quality + practical priority + receipt
                              |
                 +------------+-------------+
                 |                          |
         independent verifier        employer destination
                                      (open only; never submit)
```

## Responsibility boundary

- **Discovery code:** profile-configured coordinates, Haversine distance, Remote labels, radius compatibility, filters, stable sorts, and posted dates. It calls no map, geolocation, or geocoding API.
- **Gemma 4 12B:** primary semantic analysis. Public judging uses frozen prepared Gemma outputs; Local Private Mode uses one loopback Ollama call after profile confirmation.
- **Deterministic AI Fit V2.2:** exact point allocation, experience month union, class caps, transfers, practical separation, Evidence Quality, blocker state, priority, and receipt hash.
- **GPT-5.6 prepared reviews:** bounded advisory outputs created in Codex from frozen synthetic evidence. They cannot silently change evidence, score, or receipt.
- **Receipt verifier:** local/server code with bounded JSON parsing, canonical hash reproduction, arithmetic reconciliation, evidence-ID validation, and optional frozen-source reproduction.
- **Employer destination:** a synthetic internal demonstration of the future official employer link. It has no form, resume transmission, redirect, or submission path.

## State boundaries

Profile, preferences, comparison selection, tracker records, and minimal demo events are browser-local. Comparison is capped at three roles. Employer-open and return events contain only event type, synthetic job ID, and timestamp. Private analyses are isolated by profile and preference hashes.

Secrets are server-only. Public status responses return enablement states, never values, paths, or credentials.
