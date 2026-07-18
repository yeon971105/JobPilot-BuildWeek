# Frozen coverage methodology

## Release boundary

The credibility RC renders `build-week/bw9/frozen-coverage-snapshot.json`. Release surfaces do not query the live database. The frozen file was produced once from the separate original repository in an explicit read-only PostgreSQL transaction and is immutable by generator contract.

- Snapshot time: `2026-07-18T17:41:08.379Z`
- Transaction/read version: `9153132:9153132:`
- Query version: `jobpilot.bw9.coverage-query.v1`
- Database fingerprint: `3baa21cf0c8856742010649f820cd04f17fee24cb3320ea2fadd48c9edc5ed13`
- Snapshot semantic hash: `68f2195f1e4a6d4dce155eb2dfcd9e209643d412e30d949ca65bd2bee6ae8414`

The database fingerprint binds a hash of the database identity, server version, schema, migration manifest, transaction snapshot, and aggregate query output. It exposes no connection string or database name.

## Counting contracts

| Claim | Counting population | Frozen value |
| --- | --- | ---: |
| Active canonical jobs | One distinct `Job.id` where `ingestionStatus = ACTIVE` | 145,978 |
| California jobs | Distinct active `Job.id` whose latest job/scope decision is in an affirmative California state | 13,164 |
| Bay Area memberships | Distinct active `Job.id` joined to `BAY_AREA_OPERATIONAL_REGION` | 6,426 |
| Los Angeles County memberships | Distinct active `Job.id` joined to `LOS_ANGELES_COUNTY` | 1,108 |
| Active official-source endpoints | Distinct non-null source endpoint IDs supplying active jobs | 473 |
| Latest complete snapshots | Active endpoints whose latest `SyncSnapshot` is `COMPLETE` | 446 |
| Original posting recorded | Active jobs with a non-empty original `sourceUrl` | 145,978 |
| URL reachable | Active jobs with linked `ApplyDestination.status = VALID` evidence | 2,727 |
| Apply destination verified | Active jobs with a valid, non-empty, apply-ready `ActionDestination` | 2,727 |

The three destination figures are progressive evidence claims. A recorded posting is not automatically reachable; a reachable URL is not automatically a verified application handoff.

## Geography

The Los Angeles count is county-only. It uses the exact `LOS_ANGELES_COUNTY` market key, whose reproduced row is labeled `Los Angeles County`. The JP-41 contract excludes Orange, Ventura, Riverside, San Bernardino, San Diego, and all other California counties. “Southern California” and “Greater Los Angeles” are held without qualifying posting-level county evidence.

## Lineage

JP-41 certified 2,808 SourcePosting, CanonicalJob, and private-index records within one bounded private-shadow generation. The current 145,978 total is a later active `Job` table population after subsequent acquisition and refresh generations. These are not the same counting population.

The active catalog query returned 145,978 rows and 145,978 distinct IDs. California and both market queries use `DISTINCT Job.id`. Frozen duplicate counting is zero. Market memberships may overlap by design and are not summed into a unique-job total.

## Privacy and reproduction

The generator selects aggregate counts, timestamps, non-sensitive contract metadata, and hashes. It does not export job rows, titles, employers, descriptions, URLs, candidate data, application data, credentials, or source payloads. Production mutations are zero.

```bash
npm run bw9:freeze -- --original-repo <path-to-read-only-original-JobPilot-repository>
```

The command refuses to overwrite an existing frozen output. The full SQL and its hashes are in `coverage-query-contract.json`; input hashes and read metadata are in the snapshot; lineage is in `coverage-lineage.json`; and cross-surface values are in `coverage-consistency-audit.json`.
