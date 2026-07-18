import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import snapshot from "../../../build-week/bw8/production-coverage-snapshot.json";
import privacyAudit from "../../../build-week/bw8/production-coverage-privacy-audit.json";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
}

describe("JP-BW8 public-safe production coverage", () => {
  it("binds the aggregate snapshot to its canonical output hash", () => {
    const { snapshotOutputHash, ...payload } = snapshot;
    expect(createHash("sha256").update(canonical(payload)).digest("hex")).toBe(snapshotOutputHash);
    expect(snapshot.status).toBe("PASS_REPRODUCIBLE_AGGREGATES");
    expect(snapshot.holds).toEqual([]);
  });

  it("reconciles displayed denominators and distributions", () => {
    const active = snapshot.metrics.activeJobs.value;
    expect(active).toBeGreaterThan(0);
    expect(snapshot.metrics.completeSources.value).toBeLessThanOrEqual(snapshot.metrics.activeSources.value);
    expect(snapshot.metrics.originalApplicationLinkCoverage.total).toBe(active);
    expect(snapshot.metrics.validatedApplicationDestinations.total).toBe(active);
    expect(snapshot.metrics.freshnessDistribution.reduce((sum, item) => sum + item.count, 0)).toBe(active);
    expect(snapshot.metrics.workModeDistribution.reduce((sum, item) => sum + item.count, 0)).toBe(active);
    expect(snapshot.metrics.regionalCounts.bayArea.value).toBeGreaterThan(0);
    expect(snapshot.metrics.regionalCounts.losAngeles.value).toBeGreaterThan(0);
  });

  it("records source, query, timestamp, hashes, and privacy classification for displayed metrics", () => {
    const evidence = [
      snapshot.metrics.activeJobs.evidence,
      snapshot.metrics.regionalCounts.californiaVerified.evidence,
      snapshot.metrics.regionalCounts.bayArea.evidence,
      snapshot.metrics.regionalCounts.losAngeles.evidence,
      snapshot.metrics.activeSources.evidence,
      snapshot.metrics.completeSources.evidence,
      snapshot.metrics.originalApplicationLinkCoverage.evidence,
      snapshot.metrics.validatedApplicationDestinations.evidence,
      ...snapshot.metrics.freshnessDistribution.map((item) => item.evidence),
      snapshot.metrics.lastSuccessfulRefresh.evidence,
      ...snapshot.metrics.workModeDistribution.map((item) => item.evidence),
    ];
    for (const item of evidence) {
      expect(item.source).toBe("READ_ONLY_LOCAL_PRODUCTION_POSTGRESQL_AGGREGATES");
      expect(item.queryId).toMatch(/^[A-Za-z]+$/);
      expect(Date.parse(item.timestamp)).not.toBeNaN();
      expect(item.inputHash).toMatch(/^[a-f0-9]{64}$/);
      expect(item.outputHash).toMatch(/^[a-f0-9]{64}$/);
      expect(item.privacyClassification).toBe("PUBLIC_SAFE_AGGREGATE");
    }
  });

  it("uses an explicit read-only aggregate query path and copies no private records", () => {
    const generator = readFileSync(resolve("scripts/bw8-production-coverage.ts"), "utf8");
    const methodology = readFileSync(resolve("build-week/bw8/production-coverage-methodology.md"), "utf8");
    const snapshotFile = readFileSync(resolve("build-week/bw8/production-coverage-snapshot.json"));
    expect(generator).toContain("SET TRANSACTION READ ONLY");
    expect(generator).not.toMatch(/SELECT[^;]*\"description\"/is);
    expect(generator).not.toMatch(/FROM \"(User|Candidate|Resume|ApplicationStatus|ApplicationAttempt)\"/);
    expect(methodology).toContain(snapshot.disclosure);
    expect(privacyAudit.result).toBe("PASS");
    expect(privacyAudit.generatedAt).toBe(snapshot.generatedAt);
    expect(createHash("sha256").update(snapshotFile).digest("hex")).toBe(privacyAudit.sourceSnapshotSha256);
    expect(privacyAudit.checks.productionMutations).toBe(0);
    expect(privacyAudit.checks.inventedProductionMetrics).toBe(0);
    expect(privacyAudit.checks.privateRowsCopied).toBe(false);
  });
});
