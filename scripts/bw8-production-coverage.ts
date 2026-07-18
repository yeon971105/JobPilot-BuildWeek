import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SUMMARY_QUERY = `
WITH active_jobs AS (
  SELECT * FROM "Job" WHERE "ingestionStatus" = 'ACTIVE'
), latest_snapshots AS (
  SELECT DISTINCT ON ("endpointId") "endpointId", "completeness", "finishedAt", "startedAt"
  FROM "SyncSnapshot"
  ORDER BY "endpointId", "startedAt" DESC
), active_source_ids AS (
  SELECT DISTINCT "sourceEndpointId" AS id FROM active_jobs WHERE "sourceEndpointId" IS NOT NULL
)
SELECT
  CURRENT_TIMESTAMP AS "asOf",
  (SELECT COUNT(*) FROM active_jobs) AS "activeJobs",
  (SELECT COUNT(DISTINCT id) FROM active_source_ids) AS "activeSources",
  (SELECT COUNT(*) FROM latest_snapshots ls JOIN active_source_ids a ON a.id = ls."endpointId" WHERE ls."completeness" = 'COMPLETE') AS "completeSources",
  (SELECT COUNT(*) FROM active_jobs WHERE "applyUrl" IS NOT NULL AND BTRIM("applyUrl") <> '') AS "originalApplicationLinks",
  (SELECT COUNT(*) FROM active_jobs WHERE "applyReady" = true) AS "applyReadyJobs",
  (SELECT MAX("lastSuccessAt") FROM "SourceRefreshSchedule") AS "lastSuccessfulRefresh",
  (SELECT MAX("finishedAt") FROM "SourceRefreshRun" WHERE "succeededSources" > 0) AS "lastSuccessfulRefreshRun",
  (SELECT MAX("updatedAt") FROM active_jobs) AS "latestActiveJobUpdate",
  (SELECT MAX("lastSeenAt") FROM active_jobs) AS "latestActiveJobSeen"
`;

const MARKET_QUERY = `
SELECT lm."marketKey", lm."name", lm."marketType", COUNT(DISTINCT j."id") AS "activeJobs"
FROM "LocalMarket" lm
LEFT JOIN "MarketMembership" mm ON mm."marketId" = lm."id" AND mm."entityType" = 'JOB'
LEFT JOIN "Job" j ON j."id" = mm."entityId" AND j."ingestionStatus" = 'ACTIVE'
GROUP BY lm."id", lm."marketKey", lm."name", lm."marketType"
HAVING COUNT(DISTINCT j."id") > 0
ORDER BY "activeJobs" DESC, lm."marketKey" ASC
`;

const WORK_MODE_QUERY = `
SELECT "workMode", COUNT(*) AS count
FROM "Job"
WHERE "ingestionStatus" = 'ACTIVE'
GROUP BY "workMode"
ORDER BY count DESC, "workMode"
`;

const FRESHNESS_QUERY = `
SELECT bucket, COUNT(*) AS count FROM (
  SELECT CASE
    WHEN CURRENT_TIMESTAMP - "lastSeenAt" <= INTERVAL '24 hours' THEN 'WITHIN_24_HOURS'
    WHEN CURRENT_TIMESTAMP - "lastSeenAt" <= INTERVAL '72 hours' THEN 'ONE_TO_THREE_DAYS'
    WHEN CURRENT_TIMESTAMP - "lastSeenAt" <= INTERVAL '7 days' THEN 'FOUR_TO_SEVEN_DAYS'
    WHEN CURRENT_TIMESTAMP - "lastSeenAt" <= INTERVAL '14 days' THEN 'EIGHT_TO_FOURTEEN_DAYS'
    WHEN CURRENT_TIMESTAMP - "lastSeenAt" <= INTERVAL '30 days' THEN 'FIFTEEN_TO_THIRTY_DAYS'
    ELSE 'OVER_THIRTY_DAYS'
  END AS bucket
  FROM "Job"
  WHERE "ingestionStatus" = 'ACTIVE'
) freshness
GROUP BY bucket
ORDER BY bucket
`;

const REGION_QUERY = `
WITH latest_scope AS (
  SELECT DISTINCT ON (decision."jobId", decision."productScopeId")
    decision."jobId", decision."productScopeId", decision."scopeState"
  FROM "JobScopeDecision" decision
  ORDER BY decision."jobId", decision."productScopeId", decision."evaluatedAt" DESC
)
SELECT scope."key", scope."name", COUNT(DISTINCT latest_scope."jobId") AS "activeJobs"
FROM latest_scope
JOIN "ProductScope" scope ON scope."id" = latest_scope."productScopeId"
JOIN "Job" job ON job."id" = latest_scope."jobId" AND job."ingestionStatus" = 'ACTIVE'
WHERE latest_scope."scopeState" IN (
  'CALIFORNIA_ONSITE',
  'CALIFORNIA_HYBRID',
  'CALIFORNIA_MULTI_LOCATION',
  'CALIFORNIA_REMOTE_ELIGIBLE',
  'CALIFORNIA_STATEWIDE',
  'CALIFORNIA_TRAVEL_BASED'
)
GROUP BY scope."key", scope."name"
ORDER BY scope."key"
`;

const QUERIES = {
  catalogSummary: SUMMARY_QUERY,
  marketMemberships: MARKET_QUERY,
  workModeDistribution: WORK_MODE_QUERY,
  freshnessDistribution: FRESHNESS_QUERY,
  verifiedRegionalCounts: REGION_QUERY,
} as const;

type Scalar = string | number | bigint | Date | null;
type QueryRow = Record<string, Scalar>;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
}

function serializable(value: unknown): unknown {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializable);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializable(item)]));
  return value;
}

function number(value: Scalar | undefined) {
  const result = Number(value ?? 0);
  if (!Number.isSafeInteger(result) || result < 0) throw new Error("Coverage query returned an invalid aggregate count.");
  return result;
}

function percent(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 1000) / 10;
}

function parseArgument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function migrationManifest(originalRepository: string) {
  const directory = path.join(originalRepository, "prisma", "migrations");
  const entries: Array<{ path: string; sha256: string }> = [];
  async function visit(current: string) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && entry.name.endsWith(".sql")) {
        entries.push({ path: path.relative(directory, absolute).replaceAll("\\", "/"), sha256: sha256(await readFile(absolute)) });
      }
    }
  }
  await visit(directory);
  entries.sort((left, right) => left.path.localeCompare(right.path));
  return { count: entries.length, hash: sha256(canonical(entries)) };
}

function metricEvidence(queryId: keyof typeof QUERIES, timestamp: string, inputHash: string, queryOutputHash: string) {
  return {
    source: "READ_ONLY_LOCAL_PRODUCTION_POSTGRESQL_AGGREGATES",
    queryId,
    timestamp,
    inputHash,
    outputHash: queryOutputHash,
    privacyClassification: "PUBLIC_SAFE_AGGREGATE",
  };
}

async function main() {
  const originalRepository = path.resolve(parseArgument("--original-repo") ?? "");
  const output = path.resolve(parseArgument("--output") ?? "build-week/bw8/production-coverage-snapshot.json");
  if (!parseArgument("--original-repo")) throw new Error("Usage: npm run bw8:coverage -- --original-repo <read-only-original-repository> [--output <path>]");
  if (originalRepository === process.cwd()) throw new Error("The coverage source must be the separate original JobPilot repository.");

  const schemaPath = path.join(originalRepository, "prisma", "schema.prisma");
  const dbClientUrl = pathToFileURL(path.join(originalRepository, "src", "server", "db", "client.ts")).href;
  const schemaHash = sha256(await readFile(schemaPath));
  const migrations = await migrationManifest(originalRepository);
  const queryHashes = Object.fromEntries(Object.entries(QUERIES).map(([id, query]) => [id, sha256(query.trim())]));
  const imported = await import(dbClientUrl) as { prisma: { $transaction<T>(operation: (transaction: { $executeRawUnsafe(query: string): Promise<number>; $queryRawUnsafe<T>(query: string): Promise<T> }) => Promise<T>, options?: { timeout?: number; maxWait?: number }): Promise<T>; $disconnect(): Promise<void> } };
  const prisma = imported.prisma;

  try {
    const raw = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const [summary, markets, workModes, freshness, regions] = await Promise.all([
        transaction.$queryRawUnsafe<QueryRow[]>(SUMMARY_QUERY),
        transaction.$queryRawUnsafe<QueryRow[]>(MARKET_QUERY),
        transaction.$queryRawUnsafe<QueryRow[]>(WORK_MODE_QUERY),
        transaction.$queryRawUnsafe<QueryRow[]>(FRESHNESS_QUERY),
        transaction.$queryRawUnsafe<QueryRow[]>(REGION_QUERY),
      ]);
      return { summary, markets, workModes, freshness, regions };
    }, { maxWait: 10_000, timeout: 60_000 });

    const safeRaw = serializable(raw) as { summary: QueryRow[]; markets: QueryRow[]; workModes: QueryRow[]; freshness: QueryRow[]; regions: QueryRow[] };
    const row = safeRaw.summary[0];
    if (!row) throw new Error("Coverage summary query returned no aggregate row.");
    const generatedAt = String(row.asOf);
    const activeJobs = number(row.activeJobs);
    const activeSources = number(row.activeSources);
    const completeSources = number(row.completeSources);
    const originalLinks = number(row.originalApplicationLinks);
    const applyReadyJobs = number(row.applyReadyJobs);
    const refreshTimestamps = [row.lastSuccessfulRefresh, row.lastSuccessfulRefreshRun]
      .filter((value): value is string => typeof value === "string")
      .map((value) => new Date(value));
    const lastSuccessfulRefresh = refreshTimestamps.length
      ? new Date(Math.max(...refreshTimestamps.map((value) => value.getTime()))).toISOString()
      : null;
    const bayArea = [...safeRaw.markets].filter((item) => /bay[ _-]*area/i.test(`${item.marketKey} ${item.name}`)).sort((left, right) => number(right.activeJobs) - number(left.activeJobs))[0];
    const losAngeles = [...safeRaw.markets].filter((item) => /los[ _-]*angeles/i.test(`${item.marketKey} ${item.name}`)).sort((left, right) => number(right.activeJobs) - number(left.activeJobs))[0];
    const california = [...safeRaw.regions].sort((left, right) => number(right.activeJobs) - number(left.activeJobs))[0];
    const queryOutputHash = sha256(canonical(safeRaw));
    const inputHash = sha256(canonical({ schemaHash, migrations, queryHashes, queryOutputHash }));
    const holds = [
      ...(!activeJobs ? ["HOLD_BUILD_WEEK_PRODUCTION_COVERAGE_PROOF"] : []),
      ...(!activeSources || completeSources > activeSources ? ["HOLD_BUILD_WEEK_PRODUCTION_COVERAGE_PROOF"] : []),
      ...(!bayArea || !losAngeles || !california ? ["HOLD_BUILD_WEEK_PRODUCTION_COVERAGE_PROOF"] : []),
      ...(!row.lastSuccessfulRefresh && !row.lastSuccessfulRefreshRun ? ["HOLD_BUILD_WEEK_PRODUCTION_COVERAGE_PROOF"] : []),
    ];
    const evidence = (queryId: keyof typeof QUERIES) => metricEvidence(queryId, generatedAt, inputHash, queryOutputHash);
    const freshnessOrder = ["WITHIN_24_HOURS", "ONE_TO_THREE_DAYS", "FOUR_TO_SEVEN_DAYS", "EIGHT_TO_FOURTEEN_DAYS", "FIFTEEN_TO_THIRTY_DAYS", "OVER_THIRTY_DAYS"];
    const payload = {
      schemaVersion: "jobpilot.bw8.production-coverage.v1",
      generatedAt,
      status: holds.length ? "HOLD" : "PASS_REPRODUCIBLE_AGGREGATES",
      holds: [...new Set(holds)],
      disclosure: "The public judge flow uses synthetic roles for privacy and reproducibility. This page reports reproducible aggregate evidence from the larger production acquisition system.",
      claimBoundary: "These counts describe the current processed JobPilot catalog and source portfolio. They do not claim complete market coverage.",
      privacyClassification: "PUBLIC_SAFE_AGGREGATE",
      metrics: {
        activeJobs: { value: activeJobs, evidence: evidence("catalogSummary") },
        regionalCounts: {
          californiaVerified: { value: california ? number(california.activeJobs) : 0, label: california ? String(california.name) : "California verified scope", evidence: evidence("verifiedRegionalCounts") },
          bayArea: { value: bayArea ? number(bayArea.activeJobs) : 0, label: bayArea ? String(bayArea.name) : "Bay Area", marketType: bayArea ? String(bayArea.marketType) : null, evidence: evidence("marketMemberships") },
          losAngeles: { value: losAngeles ? number(losAngeles.activeJobs) : 0, label: losAngeles ? String(losAngeles.name) : "Los Angeles", marketType: losAngeles ? String(losAngeles.marketType) : null, evidence: evidence("marketMemberships") },
        },
        activeSources: { value: activeSources, definition: "Distinct source endpoints supplying at least one active catalog job.", evidence: evidence("catalogSummary") },
        completeSources: { value: completeSources, definition: "Active source endpoints whose latest recorded sync snapshot is COMPLETE.", evidence: evidence("catalogSummary") },
        originalApplicationLinkCoverage: { count: originalLinks, total: activeJobs, percent: percent(originalLinks, activeJobs), definition: "Active catalog jobs with a non-empty original application link recorded; presence is not a claim that every destination is currently valid.", evidence: evidence("catalogSummary") },
        validatedApplicationDestinations: { count: applyReadyJobs, total: activeJobs, percent: percent(applyReadyJobs, activeJobs), definition: "Active catalog jobs marked apply-ready by the acquisition system.", evidence: evidence("catalogSummary") },
        freshnessDistribution: freshnessOrder.map((bucket) => { const item = safeRaw.freshness.find((candidate) => candidate.bucket === bucket); const count = item ? number(item.count) : 0; return { bucket, count, percent: percent(count, activeJobs), evidence: evidence("freshnessDistribution") }; }),
        lastSuccessfulRefresh: { value: lastSuccessfulRefresh, scheduleSuccessAt: row.lastSuccessfulRefresh ? String(row.lastSuccessfulRefresh) : null, runFinishedAt: row.lastSuccessfulRefreshRun ? String(row.lastSuccessfulRefreshRun) : null, evidence: evidence("catalogSummary") },
        workModeDistribution: safeRaw.workModes.map((item) => ({ workMode: String(item.workMode), count: number(item.count), percent: percent(number(item.count), activeJobs), evidence: evidence("workModeDistribution") })),
      },
      reproduction: {
        command: "npm run bw8:coverage -- --original-repo <path-to-read-only-original-JobPilot-repository>",
        transactionMode: "READ ONLY",
        source: "Original JobPilot local production PostgreSQL catalog",
        schemaSha256: schemaHash,
        migrationManifest: migrations,
        querySha256: queryHashes,
        inputHash,
        queryOutputHash,
      },
      zeroValues: {
        inventedProductionMetrics: 0,
        privateProductionRecordsCopied: 0,
        rawJobDescriptionsExposed: 0,
        candidateRecordsRead: 0,
        productionMutations: 0,
        credentialsCopied: 0,
      },
    };
    const snapshotOutputHash = sha256(canonical(payload));
    const finalPayload = { ...payload, snapshotOutputHash };
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify(finalPayload, null, 2)}\n`, "utf8");
    console.log(JSON.stringify({ output, status: payload.status, activeJobs, activeSources, completeSources, bayArea: bayArea ? number(bayArea.activeJobs) : 0, losAngeles: losAngeles ? number(losAngeles.activeJobs) : 0, openAiApiRequests: 0, productionMutations: 0, snapshotOutputHash }, null, 2));
    if (holds.length) process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
