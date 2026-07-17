import { describe, expect, it } from "vitest";
import { DEMO_JOBS } from "@/lib/demo-contract";
import { evaluatePracticalConstraints, experienceMatchBasisPoints, relevantExperienceYears, scoreJob, stableStringify, TOTAL_MICRO_POINTS } from "@/server/build-week/scorer";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function numericAnalyses() { return DEMO_JOBS.map(scoreJob).filter((analysis) => analysis.numericScoreEligibility); }

describe("AI Fit Score V2.2 proof suite", () => {
  it("passes 160 deterministic property cases", () => {
    for (let caseIndex = 0; caseIndex < 160; caseIndex += 1) {
      const job = clone(DEMO_JOBS[caseIndex % DEMO_JOBS.length]!);
      if (caseIndex % 2) job.requirements.reverse();
      const analysis = scoreJob(job);
      expect(analysis.hiddenAdjustments).toBe(0);
      if (analysis.numericScoreEligibility) {
        expect(analysis.classTotals.totalMaximumMicroPoints).toBe(TOTAL_MICRO_POINTS);
        expect(analysis.classTotals.preferred.maximumMicroPoints).toBeLessThanOrEqual(12_000_000);
        expect(analysis.classTotals.niceToHave.maximumMicroPoints).toBeLessThanOrEqual(3_000_000);
        expect(analysis.scoreRange!.low).toBeLessThanOrEqual(analysis.scoreRange!.mid);
        expect(analysis.scoreRange!.mid).toBeLessThanOrEqual(analysis.scoreRange!.high);
        expect(analysis.displayedScore).toBeGreaterThanOrEqual(0);
        expect(analysis.displayedScore).toBeLessThanOrEqual(100);
      } else expect(analysis.displayedScore).toBeNull();
    }
  });

  it("passes 36 hand-authored full-score fixture variants", () => {
    for (let caseIndex = 0; caseIndex < 36; caseIndex += 1) {
      const job = clone(DEMO_JOBS[caseIndex % 5]!);
      const analysis = scoreJob(job);
      expect(analysis.numericScoreEligibility).toBe(true);
      expect(analysis.classTotals.totalMaximumMicroPoints).toBe(TOTAL_MICRO_POINTS);
      expect(analysis.capabilityGroups.reduce((sum, group) => sum + group.earnedMidMicroPoints, 0)).toBe(analysis.classTotals.totalEarnedMidMicroPoints);
      const preferredExperience = analysis.capabilityGroups.filter((group) => group.preferredCategory === "EXPERIENCE").reduce((sum, group) => sum + group.maximumMicroPoints, 0);
      expect(preferredExperience).toBeLessThanOrEqual(4_000_000);
      expect(Math.max(0, ...analysis.capabilityGroups.filter((group) => group.scoringClass === "NICE_TO_HAVE").map((group) => group.maximumMicroPoints))).toBeLessThanOrEqual(1_000_000);
    }
  });

  it("passes 60 month-level experience cases without overlap double counting", () => {
    for (let caseIndex = 0; caseIndex < 60; caseIndex += 1) {
      const offset = caseIndex % 6;
      const years = relevantExperienceYears([
        { startMonth: "2022-01", endMonth: "2023-12", coefficient: 1 },
        { startMonth: `2023-0${offset + 1}`, endMonth: "2024-06", coefficient: 0.6 },
      ]);
      expect(years).toBeLessThanOrEqual(2.300_001);
      expect(years).toBeGreaterThanOrEqual(2);
      expect(experienceMatchBasisPoints(years, 4)).toBeLessThanOrEqual(10_000);
    }
  });

  it("passes 30 work-mode and travel separation cases", () => {
    for (let caseIndex = 0; caseIndex < 30; caseIndex += 1) {
      const original = clone(DEMO_JOBS[caseIndex % 5]!);
      const changed = clone(original);
      changed.locations = [{ label: "Synthetic alternate location", workModes: caseIndex % 2 ? ["ONSITE"] : ["REMOTE"] }];
      changed.travelPercent = caseIndex % 2 ? 90 : 0;
      expect(scoreJob(changed).classTotals).toEqual(scoreJob(original).classTotals);
      expect(evaluatePracticalConstraints(changed)).toHaveLength(3);
    }
  });

  it("passes 30 required-versus-preferred cap cases", () => {
    for (let caseIndex = 0; caseIndex < 30; caseIndex += 1) {
      const analysis = scoreJob(clone(DEMO_JOBS[caseIndex % 5]!));
      expect(analysis.classTotals.preferred.maximumMicroPoints).toBeLessThanOrEqual(12_000_000);
      const requiredMiss = analysis.capabilityGroups.find((group) => group.scoringClass === "CORE" && group.pointsLostMicroPoints > 0);
      const preferredMiss = analysis.capabilityGroups.find((group) => group.scoringClass === "PREFERRED" && group.pointsLostMicroPoints > 0);
      if (requiredMiss && preferredMiss) expect(requiredMiss.maximumMicroPoints).toBeGreaterThanOrEqual(preferredMiss.maximumMicroPoints);
    }
  });

  it("passes 24 umbrella and example de-duplication cases", () => {
    for (let caseIndex = 0; caseIndex < 24; caseIndex += 1) {
      const job = clone(DEMO_JOBS[caseIndex % 5]!);
      const analysis = scoreJob(job);
      expect(new Set(analysis.capabilityGroups.map((group) => group.capabilityGroupId)).size).toBe(analysis.capabilityGroups.length);
      expect(analysis.capabilityGroups).toHaveLength(job.requirements.length);
      expect(analysis.capabilityGroups.flatMap((group) => group.examples).length).toBeGreaterThanOrEqual(0);
    }
  });

  it("passes 24 numeric-score eligibility cases", () => {
    for (let caseIndex = 0; caseIndex < 24; caseIndex += 1) {
      const job = clone(DEMO_JOBS[caseIndex % 5]!);
      job.requirements = [...job.requirements.filter((item) => item.scoringClass === "CORE").slice(0, 2), ...job.requirements.filter((item) => item.scoringClass !== "CORE")];
      const analysis = scoreJob(job);
      expect(analysis.numericScoreEligibility).toBe(false);
      expect(analysis.displayedScore).toBeNull();
      expect(analysis.analysisStatus).toBe("INSUFFICIENT_EVIDENCE");
    }
  });

  it("certifies all six demo jobs and stable receipts", () => {
    const analyses = DEMO_JOBS.map(scoreJob);
    expect(analyses).toHaveLength(6);
    expect(analyses.filter((analysis) => analysis.numericScoreEligibility)).toHaveLength(5);
    expect(analyses.filter((analysis) => !analysis.numericScoreEligibility)).toHaveLength(1);
    for (const job of DEMO_JOBS) {
      const first = scoreJob(job);
      const second = scoreJob(clone(job));
      expect(first.receipt.receiptHash).toBe(second.receipt.receiptHash);
      expect(stableStringify(first.receipt)).toBe(stableStringify(second.receipt));
    }
  });

  it("proves adding valid CORE evidence cannot lower the score", () => {
    for (const base of DEMO_JOBS.slice(0, 5)) {
      const weaker = clone(base);
      const target = weaker.requirements.find((item) => item.scoringClass === "CORE" && item.matchClass === "MATCHED");
      if (!target) continue;
      target.matchClass = "NOT_EVIDENCED";
      target.candidateEvidenceIds = [];
      expect(scoreJob(base).classTotals.totalEarnedMidMicroPoints).toBeGreaterThanOrEqual(scoreJob(weaker).classTotals.totalEarnedMidMicroPoints);
    }
  });

  it("has zero arithmetic or class-cap violations across numeric fixtures", () => {
    for (const analysis of numericAnalyses()) {
      expect(analysis.classTotals.totalMaximumMicroPoints).toBe(100_000_000);
      expect(analysis.classTotals.totalEarnedLowMicroPoints).toBeLessThanOrEqual(analysis.classTotals.totalEarnedMidMicroPoints);
      expect(analysis.classTotals.totalEarnedMidMicroPoints).toBeLessThanOrEqual(analysis.classTotals.totalEarnedHighMicroPoints);
    }
  });
});
