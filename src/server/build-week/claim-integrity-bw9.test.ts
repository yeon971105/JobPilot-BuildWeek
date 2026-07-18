import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import snapshot from "../../../build-week/bw9/frozen-coverage-snapshot.json";
import audit from "../../../build-week/bw9/coverage-consistency-audit.json";
import lineage from "../../../build-week/bw9/coverage-lineage.json";
import queryContract from "../../../build-week/bw9/coverage-query-contract.json";
import destinationAudit from "../../../build-week/bw9/destination-state-audit.json";
import gptManifest from "../../../build-week/bw9/gpt56-release-manifest.json";
import impactPublic from "../../../build-week/bw9/impact-results-public.json";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { allFrozenDestinationRecords, destinationActionFor, DESTINATION_TRUST_STATES } from "@/lib/destination-trust";
import { SHORTLIST_POLICY } from "@/lib/shortlist";

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
}

describe("JP-BW9 claim integrity release gate", () => {
  it("binds every public coverage claim to one immutable canonical snapshot", () => {
    const { snapshotOutputHash, ...payload } = snapshot;
    expect(createHash("sha256").update(canonical(payload)).digest("hex")).toBe(snapshotOutputHash);
    expect(snapshot.immutable).toBe(true);
    expect(snapshot.status).toBe("PASS_FROZEN_COVERAGE");
    expect(snapshot.holds).toEqual([]);
    expect(audit.snapshotOutputHash).toBe(snapshotOutputHash);
    expect(audit.checks.mismatchCount).toBe(0);
    expect(audit.result).toBe("PASS_ZERO_MISMATCHES");
    expect(snapshot.integrity.activeCatalogRows).toBe(snapshot.integrity.distinctActiveJobIds);
    expect(snapshot.integrity.duplicateCounting).toBe(0);
    expect(snapshot.zeroValues.productionMutations).toBe(0);
    expect(snapshot.zeroValues.privateRowsCopied).toBe(0);
    expect(createHash("sha256").update(canonical(queryContract)).digest("hex")).toBe(snapshot.reproduction.coverageQueryContractSha256);
  });

  it("keeps unique-job totals, exact market memberships, and JP-41 lineage distinct", () => {
    expect(queryContract.marketDefinitions.losAngelesCounty).toMatchObject({ marketKey: "LOS_ANGELES_COUNTY", publicLabel: "Los Angeles County" });
    expect(queryContract.queries.exactMarketMemberships.sql).toContain("market.\"marketKey\" IN ('BAY_AREA_OPERATIONAL_REGION', 'LOS_ANGELES_COUNTY')");
    expect(queryContract.queries.exactMarketMemberships.sql).toContain("COUNT(DISTINCT job.\"id\")");
    expect(queryContract.prohibitedInterpretations).toContain("Greater Los Angeles");
    expect(lineage.priorCertifiedCatalog.canonicalJobs).toBe(2_808);
    expect(lineage.currentActiveCatalog.uniqueJobs).toBe(145_978);
    expect(lineage.semantics.noDoubleCountingProof.mismatch).toBe(0);
    expect(lineage.zeroValues).toEqual({ lineageAmbiguity: 0, duplicateCounting: 0, populationConflation: 0 });
    const releaseCoverage = ["src/app/about/coverage/page.tsx", "README.md", "build-week/bw9/video-script.md", "build-week/bw9/devpost-draft.md", "build-week/bw9/coverage-report.md"].map((path) => readFileSync(resolve(path), "utf8")).join("\n");
    expect(releaseCoverage).not.toContain("Greater Los Angeles");
  });

  it("renders all five employer destination trust states without an unverified Apply CTA", () => {
    const records = allFrozenDestinationRecords();
    expect(new Set(records.map((record) => record.state))).toEqual(new Set(DESTINATION_TRUST_STATES));
    expect(new Set(records.map((record) => record.jobId))).toEqual(new Set(DEMO_JOBS.map((job) => job.id)));
    for (const record of records) {
      const action = destinationActionFor(record.jobId);
      expect(action.state).toBe(record.state);
      expect(action.label.startsWith("Apply on Employer Site")).toBe(record.state === "APPLY_DESTINATION_VERIFIED");
      expect(action.interactive).toBe(action.href !== null);
    }
    expect(destinationAudit.allStatesExercised).toBe(true);
    expect(destinationAudit.unverifiedApplyCta).toBe(0);
    expect(destinationAudit.result).toBe("PASS");
    expect(readFileSync(resolve("src/components/demo/job-detail.tsx"), "utf8")).toContain("<DestinationAction");
    expect(readFileSync(resolve("src/components/demo/shortlist.tsx"), "utf8")).toContain("<DestinationAction");
  });

  it("keeps the shortlist rationale to four visible labels with the complete policy disclosed separately", () => {
    const shortlist = readFileSync(resolve("src/components/demo/shortlist.tsx"), "utf8");
    expect(shortlist).toContain("Why these three?");
    expect(shortlist).toContain("See the full ranking method");
    expect(shortlist).toContain("SHORTLIST_POLICY.map");
    expect(SHORTLIST_POLICY).toHaveLength(7);
    expect(readFileSync(resolve("src/lib/shortlist.ts"), "utf8")).toContain('{ label: "Fit"');
    expect(readFileSync(resolve("src/lib/shortlist.ts"), "utf8")).toContain('{ label: "Compatibility"');
    expect(readFileSync(resolve("src/lib/shortlist.ts"), "utf8")).toContain('{ label: "Freshness"');
    expect(readFileSync(resolve("src/lib/shortlist.ts"), "utf8")).toContain('{ label: "Blocker"');
    expect(shortlist).toContain("No hidden shortlist score");
    expect(shortlist).toContain("No hidden total is calculated.");
  });

  it("uses one exact prepared GPT-5.6 model identity with reproducible artifacts and zero live usage", () => {
    expect(gptManifest.exactModelFamily).toBe("gpt-5.6-sol");
    expect(gptManifest.preparedNotLive).toBe(true);
    expect(gptManifest.apiRequestCount).toBe(0);
    expect(gptManifest.openAiApiCostUsd).toBe(0);
    expect(gptManifest.modelGeneratedFinalScores).toBe(0);
    expect(gptManifest.invalidEvidenceIds).toBe(0);
    for (const artifact of gptManifest.artifacts) {
      expect(createHash("sha256").update(readFileSync(resolve(artifact.path))).digest("hex")).toBe(artifact.sha256);
      expect(artifact.hashMatch).toBe(true);
    }
    const activeRelease = gptManifest.releaseSurfaces.map((path) => readFileSync(resolve(path), "utf8")).join("\n");
    expect(activeRelease).toContain("gpt-5.6-sol");
    expect(activeRelease).not.toContain("gpt-5.6-terra");
    expect(gptManifest.releaseSurfaceModelNameInconsistency).toBe(0);
  });

  it("publishes an honest not-yet-run human-study state with no fabricated result", () => {
    expect(impactPublic.status).toBe("READY_NOT_RUN");
    expect(impactPublic.humanParticipantCount).toBe(0);
    expect(impactPublic.metrics).toBeNull();
    expect(impactPublic.statisticalSignificanceClaim).toBe(false);
    expect(impactPublic.fabricatedParticipants).toBe(0);
    const studyUi = readFileSync(resolve("src/components/study/decision-utility-study.tsx"), "utf8");
    const studyContract = readFileSync(resolve("src/lib/decision-study.ts"), "utf8");
    expect(studyContract).toContain('storageMode: "BROWSER_LOCAL_ONLY"');
    expect(studyUi).toContain("I consent");
    expect(studyUi).toContain("localStorage.removeItem");
    expect(studyUi).not.toMatch(/fetch\s*\(/);
  });
});
