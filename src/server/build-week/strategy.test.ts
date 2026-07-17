import { describe, expect, it } from "vitest";
import { DEMO_CANDIDATE, DEMO_JOBS, getDemoAnalysis } from "@/lib/build-week-demo";
import { fixtureStrategy, getDemoProviderConfig } from "@/server/build-week/strategy";

describe("Build Week demo contract", () => {
  it("contains six original synthetic jobs with varied work modes", () => {
    expect(DEMO_JOBS).toHaveLength(6);
    expect(new Set(DEMO_JOBS.flatMap((job) => job.workModes))).toEqual(new Set(["HYBRID", "REMOTE", "ONSITE"]));
    expect(DEMO_CANDIDATE.synthetic).toBe(true);
  });

  it("reconciles every displayed demo score to 100 maximum points", () => {
    for (const job of DEMO_JOBS) {
      const analysis = getDemoAnalysis(job.id)!;
      expect(analysis.allocation.totalMaximum).toBe(100);
      expect(analysis.allocation.hiddenAdjustment).toBe(0);
      expect(analysis.allocation.preferredMaximum).toBeLessThanOrEqual(12);
      expect(analysis.allocation.niceMaximum).toBeLessThanOrEqual(3);
    }
  });

  it("keeps fixture strategies explicitly grounded in internal IDs", () => {
    const job = DEMO_JOBS[0]!;
    const strategy = fixtureStrategy(job.id);
    const requirementIds = new Set(job.requirements.map((item) => item.id));
    const evidenceIds = new Set(DEMO_CANDIDATE.evidence.map((item) => item.id));
    strategy.strongestFitEvidence.forEach((item) => { expect(requirementIds.has(item.requirementId)).toBe(true); expect(evidenceIds.has(item.evidenceId)).toBe(true); });
    strategy.truthfulGaps.forEach((item) => expect(requirementIds.has(item.requirementId)).toBe(true));
  });

  it("does not silently represent a fixture as live GPT-5.6", () => {
    expect(getDemoProviderConfig({ BUILD_WEEK_DEMO_MODE: "true" })).toEqual({ mode: "FIXTURE_ONLY", model: "deterministic-demo-fixture", live: false });
    expect(getDemoProviderConfig({ AI_PROVIDER: "PRIVATE_LOCAL", OLLAMA_MODEL: "gemma4:12b" })).toEqual({ mode: "PRIVATE_LOCAL", model: "gemma4:12b", live: false });
  });
});
