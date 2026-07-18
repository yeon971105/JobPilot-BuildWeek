# JP-BW8 Production Coverage Methodology

Generated: 2026-07-18T08:27:26.810Z  
Privacy classification: `PUBLIC_SAFE_AGGREGATE`  
Result: `PASS_REPRODUCIBLE_AGGREGATES`

## Disclosure and claim boundary

> The public judge flow uses synthetic roles for privacy and reproducibility. This page reports reproducible aggregate evidence from the larger production acquisition system.

The snapshot describes records in the current processed JobPilot catalog and source portfolio. It is not a complete-market claim. “Application link recorded” is reported separately from “destination marked apply-ready.”

## Source and command

- Source: the original JobPilot local production PostgreSQL catalog, inspected read-only.
- Sanitized output: `build-week/bw8/production-coverage-snapshot.json`.
- Command: `npm run bw8:coverage -- --original-repo <path-to-read-only-original-JobPilot-repository>`.
- Transaction control: `SET TRANSACTION READ ONLY`.
- Candidate tables queried: none.
- Job descriptions selected or exported: none.
- Database writes: none.

The command dynamically loads the original repository's generated Prisma client, starts one read-only transaction, executes only the aggregate queries embedded in `scripts/bw8-production-coverage.ts`, disconnects, and writes the public-safe snapshot in the sanitized submission repository.

## Metric definitions

| Displayed metric | Source fields | Query ID | Definition |
| --- | --- | --- | --- |
| Active jobs | `Job.ingestionStatus` | `catalogSummary` | Count where status is `ACTIVE`. |
| Verified California scope | Latest `JobScopeDecision` per job/scope | `verifiedRegionalCounts` | Active jobs in one of six affirmative California scope states; ambiguous, conflicting, and no-evidence states are excluded. |
| Bay Area / Los Angeles | `MarketMembership`, `LocalMarket`, `Job` | `marketMemberships` | Distinct active job IDs assigned to the named multi-county market. Counts are independently scoped and must not be summed. |
| Active sources | `Job.sourceEndpointId` | `catalogSummary` | Distinct source endpoints supplying at least one active job. |
| Complete sources | Latest `SyncSnapshot` per active endpoint | `catalogSummary` | Active endpoints whose latest snapshot is `COMPLETE`. |
| Original application-link coverage | `Job.applyUrl` | `catalogSummary` | Active jobs with a non-empty original application link recorded. This is not a validation claim. |
| Validated destinations | `Job.applyReady` | `catalogSummary` | Active jobs marked apply-ready by the acquisition system. |
| Freshness | `Job.lastSeenAt` | `freshnessDistribution` | Mutually exclusive age buckets evaluated at the database timestamp. |
| Last successful refresh | `SourceRefreshSchedule.lastSuccessAt`, successful `SourceRefreshRun.finishedAt` | `catalogSummary` | Latest non-null timestamp across the two success ledgers. |
| Work mode | `Job.workMode` | `workModeDistribution` | Active-job counts grouped by the stored enum. |

## Integrity hashes

- Prisma schema SHA-256: `db797595c747a99fd67213ae1f9bffc2e817d8869e28beedafa63d695ea9b4d1`
- Migration manifest SHA-256: `c961a1b4087406b3dee1593a38a390df181bb3a9d6dc85dc9ae5414cd095e84e`
- Aggregate input SHA-256: `3ef89ae03cd2d569a8787637dc14e34240b2e819c56fd3144787b5719e5af257`
- Aggregate query-output SHA-256: `39a4d0a20895bcf16427c9bab9a8b5b174682e7fced675ef6317ce2eb89b246a`
- Snapshot SHA-256: `53bc122a40a4e92805ee52d32946303d7413e209d1b9076fe98710de5410aa09`

Each metric in the JSON snapshot records its source, query ID, database timestamp, input hash, query-output hash, and privacy classification. Query text and its SHA-256 hashes are versioned in the generator and snapshot.

## Privacy review

Only counts, percentages, timestamps, enum labels, public market labels, and cryptographic hashes leave the transaction. The generator never selects job title, company, description, resume, user, candidate, application, credential, source URL, or source payload fields. See `production-coverage-privacy-audit.json`.

## Reproduction semantics

The committed snapshot is intentionally frozen. Re-running the command creates a new as-of timestamp and new hashes if the production catalog has changed. A changed result is expected evidence of a newer catalog state, not permission to alter the committed historical snapshot silently.
