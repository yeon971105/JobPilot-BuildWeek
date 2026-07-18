# JobPilot JP-BW3 final report

**Decision:** GO_BUILD_WEEK_HYBRID_RELEASE_READY_WITH_ACCOUNT_ACTIONS

The JP-BW2 parent was reproduced exactly. JobPilot now runs as a local-first hybrid: Gemma 4 12B is the primary semantic model, deterministic AI Fit V2.2 owns every point, and GPT-5.6 Terra is optional for four bounded heavy-reasoning actions. The application builds and passes its complete judge flow without an OpenAI key.

The exact local `gemma4:12b` canary passed with digest `4eb23ef187e2c5462566d6a1d3bbbc2f1346d0b4327cbb66d58fffbcc9b2b05c`; no model was pulled or substituted. Six cached judge analyses are provenance-bound to frozen synthetic job hashes, the synthetic candidate hash, and recomputed receipt hashes. The anti-hardcoding audit found zero fixed final scores, zero fixed receipt hashes, and zero receipt mismatches. The score-change scenario changes only the expected capability and creates a new receipt.

Validation passes: 26 tests across 4 files, typecheck, zero-warning lint, production build, eleven-route smoke matrix, desktop/tablet/mobile browser QA, privacy audit, and secret scan. The validated local video is present. No application, production data, or private resume was used or transmitted.

Publication remains intentionally pending because no authenticated deployment target, Git remote, YouTube session, Devpost session, or Codex feedback Session ID was available. Exact clearance commands are recorded in `final-report.json`.
