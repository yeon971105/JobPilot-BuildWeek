import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import aggregate from "../../../build-week/bw13/authentic-study-aggregate.json";
import claimContract from "../../../build-week/bw13/study-claim-contract.json";
import privacyAudit from "../../../build-week/bw13/study-privacy-audit.json";
import pilot from "../../../build-week/study/pilot-excluded.json";

const read = (path: string) => readFileSync(path, "utf8");
const tracked = (...patterns: string[]) => execFileSync("git", ["ls-files", "--", ...patterns], { encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);

describe("JP-BW13 authentic aggregate impact and participant privacy gate", () => {
  it("locks the exact combined hash and aggregate-only canonical results", () => {
    expect(aggregate.status).toBe("AUTHENTIC_DIRECTIONAL_USABILITY_EVIDENCE");
    expect(aggregate.sourceCombinedSha256).toBe("ef3e72cb41e8f573031101609afafd00d7fe1a0fe3e1bab8927d24f3315dd0cc");
    expect(aggregate).toMatchObject({ participantCount: 5, humanRows: 10, acceptedFiles: 5, rejectedFiles: 0, fabricatedParticipantRows: 0, dryRunRowsCountedAsHumans: 0 });
    expect(aggregate.conditions.traditionalPosting).toMatchObject({ medianTaskTimeSeconds: 39, meanTaskTimeSeconds: 36.4, factualAccuracy: { correct: 15, total: 20, percent: 75 }, decisionAlignment: { percent: 40 }, meanConfidenceOutOf7: 3.8, meanClarityOutOf7: 3.6 });
    expect(aggregate.conditions.jobPilot).toMatchObject({ medianTaskTimeSeconds: 18, meanTaskTimeSeconds: 20.8, factualAccuracy: { correct: 20, total: 20, percent: 100 }, decisionAlignment: { percent: 100 }, meanConfidenceOutOf7: 6, meanClarityOutOf7: 6.2 });
    expect(aggregate.conditionOrder).toEqual({ RAW_POSTING_THEN_JOBPILOT: 5 });
    expect(aggregate.confidenceIntervalsReported).toBe(false);
    expect(aggregate.statisticalSignificanceTested).toBe(false);
  });

  it("renders directional aggregate metrics with the order limitation adjacent", () => {
    const source = read("src/components/demo/directional-study-evidence.tsx");
    const canonicalLimitation = "All participants completed the traditional condition first and JobPilot second. Different roles prevented same-role carryover, but practice or order effects may contribute to the observed difference.";
    expect(aggregate.limitation).toBe(canonicalLimitation);
    expect(source).toContain('import aggregate from "../../../build-week/bw13/authentic-study-aggregate.json"');
    for (const text of ["Directional usability study", "Moderated directional usability study, n=5", "Median task time", "Factual accuracy", "Self-reported clarity", "Small directional study, n=5", canonicalLimitation, "View methodology"]) expect(source).toContain(text);
    expect(source).toContain('data-study-metric-group="aggregate-only"');
    expect(source).toContain('data-limitation-adjacent="true"');
    expect(source).not.toMatch(/participant_?id|anonymous session|individual row/i);
    expect(source).not.toMatch(/anon-[a-z0-9-]+/i);
  });

  it("keeps prohibited causal and significance claims off public product surfaces", () => {
    const publicProduct = [read("src/components/demo/directional-study-evidence.tsx"), read("src/components/demo/trust-lab.tsx"), read("src/app/about/build-week/page.tsx")].join("\n").toLowerCase();
    for (const claim of claimContract.prohibitedClaims) expect(publicProduct).not.toContain(claim.toLowerCase());
    expect(publicProduct).toContain("directional");
    expect(publicProduct).toContain("n=5");
  });

  it("keeps participant files, identifiers, and rows out of tracked public evidence", () => {
    expect(tracked("build-week/study/inbox/*.csv", "build-week/study/inbox/*.json", "build-week/study/validated/combined.csv", "jobpilot-study-*.csv", "jobpilot-study-*.json")).toEqual([]);
    const publicEvidence = [read("build-week/bw13/authentic-study-aggregate.json"), read("build-week/bw13/authentic-study-report.md"), read("build-week/bw13/study-methodology.md"), read("build-week/bw13/study-privacy-audit.json")].join("\n");
    expect(publicEvidence).not.toMatch(/anon-[a-z0-9-]+|participant_id|completed_at|jobpilot-study-final-anon/i);
    expect(privacyAudit).toMatchObject({ participantFilesTracked: 0, participantFilesStaged: 0, participantIdsInPublicArtifacts: 0, participantRowsInPublicArtifacts: 0, combinedCsvInPublicBuild: 0, result: "PASS" });
    for (const index of tracked("**/artifact-index.json")) expect(read(index)).not.toContain("build-week/study/validated/combined.csv");
  });

  it("preserves exclusion gates and binds the public aggregate to its artifact bytes", () => {
    expect(pilot.status).toBe("PILOT_EXCLUDED");
    expect(aggregate.dryRunRowsCountedAsHumans).toBe(0);
    expect(aggregate.fabricatedParticipantRows).toBe(0);
    expect(createHash("sha256").update(read("build-week/bw13/authentic-study-aggregate.json")).digest("hex")).toMatch(/^[a-f0-9]{64}$/);
  });
});
